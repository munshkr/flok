import { Mosaic } from "@/components/mosaic";
import { Pane } from "@/components/pane";
import SessionCommandDialog from "@/components/session-command-dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import UsernameDialog from "@/components/username-dialog";
import { store } from "@/lib/utils";
import { Session, Document } from "@flok-editor/session";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ConfigureDialog } from "@/components/configure-dialog";
import { CommandsButton } from "@/components/commands-button";
import { ReplsButton } from "@/components/repls-button";
import { Helmet } from "react-helmet-async";
import { isWebglSupported } from "@/lib/webgl-detector";
import HydraCanvas from "@/components/hydra-canvas";
import type { HydraWrapper } from "@/lib/hydra-wrapper";
import type { StrudelWrapper } from "@/lib/strudel-wrapper";
import { defaultTarget, webTargets } from "@/settings.json";
import { panicCodes as panicCodesUntyped } from "@/settings.json";
import { ReplsDialog } from "@/components/repls-dialog";

const panicCodes = panicCodesUntyped as { [target: string]: string };

interface SessionLoaderParams {
  name: string;
}

interface Pane {
  target: string;
  content: string;
}

export default function SessionPage() {
  const { name } = useLoaderData() as SessionLoaderParams;
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);

  const [commandsDialogOpen, setCommandsDialogOpen] = useState<boolean>(false);
  const [replsDialogOpen, setReplsDialogOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const hasWebGl = useMemo(() => isWebglSupported(), []);

  const [hydra, setHydra] = useState<HydraWrapper | null>(null);
  const hydraCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [strudel, setStrudel] = useState<StrudelWrapper | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!name) return;

    const { hostname, port, protocol } = window.location;
    const isSecure = protocol === "https:";
    const newSession = new Session(name, {
      hostname,
      port: parseInt(port),
      isSecure,
    });
    setSession(newSession);

    // Default documents
    newSession.on("sync", () => {
      if (newSession.getDocuments().length > 0) return;
      console.log("Create a default document");
      newSession.setActiveDocuments([{ id: "1", target: defaultTarget }]);
    });

    // If documents change on server, update state
    newSession.on("change", (documents) => {
      setDocuments(documents);
    });

    let connected = true;
    newSession.on("pubsub:open", () => {
      if (connected) return;
      connected = true;
      toast({
        title: "Connected to server",
        duration: 1000,
      });
    });

    newSession.on("pubsub:close", () => {
      if (!connected) return;
      connected = false;
      toast({
        variant: "destructive",
        title: "Disconnected from server",
        description: "Remote evaluations will be ignored until reconnected.",
      });
    });

    // Load and set saved username, if available
    const savedUsername = store.get("username");
    if (!savedUsername) {
      setUsernameDialogOpen(true);
    } else {
      setUsername(savedUsername);
    }

    return () => newSession.destroy();
  }, [name]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandsDialogOpen((open) => !open);
      }

      if (e.key === "p" && e.ctrlKey) {
        e.preventDefault();
        setConfigureDialogOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load and initialize external libraries: Strudel, Hydra
  useEffect(() => {
    if (!session) return;

    if (!strudel) {
      (async () => {
        console.log("Create StrudelWrapper");
        const { StrudelWrapper } = await import("@/lib/strudel-wrapper");

        const strudel = new StrudelWrapper({
          onError: (e) => handleWebError("Strudel error", e),
        });
        setStrudel(strudel);

        console.log("Import Strudel modules");
        await strudel.importModules();

        session.on("eval:strudel", ({ body }) => {
          console.log("eval strudel", body);
          strudel.tryEval(body);
        });
      })();
    }

    if (!hydra && hasWebGl && hydraCanvasRef.current) {
      (async () => {
        console.log("Create HydraWrapper");
        const { HydraWrapper } = await import("@/lib/hydra-wrapper");

        const hydra = new HydraWrapper({
          canvas: hydraCanvasRef.current!,
          onError: (e) => handleWebError("Hydra error", e),
        });
        setHydra(hydra);

        session.on("eval:hydra", ({ body }) => {
          console.log("eval hydra", body);
          hydra.tryEval(body);
        });
      })();
    }
  }, [session, hydraCanvasRef, hydra, strudel]);

  useEffect(() => {
    if (hasWebGl) return;
    toast({
      variant: "warning",
      title: "WebGL not available",
      description:
        "WebGL is disabled or not supported, so Hydra was not initialized",
    });
  }, [hasWebGl]);

  useEffect(() => {
    if (!session) return;
    console.log(`Setting user on session to '${username}'`);
    session.user = username;
    store.set("username", username);
  }, [session, username]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "." && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        documents.forEach((doc) => {
          const panicCode = panicCodes[doc.target];
          if (panicCode) doc.evaluate(panicCode, { from: null, to: null });
        });
        toast({ title: "Panic!", duration: 1000 });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [documents]);

  const replTargets = useMemo(
    () =>
      [...new Set(documents.map((doc) => doc.target))].filter(
        (t) => !webTargets.includes(t)
      ),
    [documents]
  );

  const targetsList = useMemo(
    () => documents.map((doc) => doc.target),
    [documents]
  );

  const handleViewLayoutAdd = useCallback(() => {
    if (!session) return;
    const newDocs = [
      ...documents.map((doc) => ({ id: doc.id, target: doc.target })),
      { id: String(documents.length + 1), target: defaultTarget },
    ];
    session.setActiveDocuments(newDocs);
  }, [session, documents]);

  const handleViewLayoutRemove = useCallback(() => {
    if (!session) return;
    session.setActiveDocuments([
      ...documents
        .map((doc) => ({ id: doc.id, target: doc.target }))
        .slice(0, -1),
    ]);
  }, [session, documents]);

  const handleTargetSelectChange = (document: Document, newTarget: string) => {
    document.target = newTarget;
  };

  const handleEvaluateButtonClick = (document: Document) => {
    document.evaluate(document.content, { from: null, to: null });
  };

  const handleConfigureAccept = (targets: string[]) => {
    if (!session) return;
    session.setActiveDocuments(
      targets
        .filter((t) => t)
        .map((target, i) => ({ id: String(i + 1), target }))
    );
  };

  const handleWebError = (title: string, error: string) => {
    if (!error) return;
    toast({
      variant: "destructive",
      title,
      description: <pre className="whitespace-pre-wrap">{error}</pre>,
    });
  };

  return (
    <>
      <Helmet>
        <title>{name} ~ Flok</title>
      </Helmet>
      <SessionCommandDialog
        open={commandsDialogOpen}
        onOpenChange={(isOpen) => setCommandsDialogOpen(isOpen)}
        onSessionChangeUsername={() => setUsernameDialogOpen(true)}
        onSessionNew={() => navigate("/")}
        onLayoutAdd={handleViewLayoutAdd}
        onLayoutRemove={handleViewLayoutRemove}
        onLayoutConfigure={() => setConfigureDialogOpen(true)}
      />
      <UsernameDialog
        name={username}
        open={usernameDialogOpen}
        onAccept={(name) => setUsername(name)}
        onOpenChange={(isOpen) => setUsernameDialogOpen(isOpen)}
      />
      {session && (
        <ConfigureDialog
          targets={targetsList}
          sessionUrl={session.wsUrl}
          sessionName={session.name}
          open={configureDialogOpen}
          onOpenChange={(isOpen) => setConfigureDialogOpen(isOpen)}
          onAccept={handleConfigureAccept}
        />
      )}
      {session && replTargets.length > 0 && (
        <ReplsDialog
          targets={replTargets}
          sessionUrl={session.wsUrl}
          sessionName={session.name}
          open={replsDialogOpen}
          onOpenChange={(isOpen) => setReplsDialogOpen(isOpen)}
        />
      )}
      <Mosaic
        items={documents.map((doc, i) => (
          <Pane
            key={doc.id}
            document={doc}
            autoFocus={i == 0}
            onTargetChange={handleTargetSelectChange}
            onEvaluateButtonClick={handleEvaluateButtonClick}
          />
        ))}
      />
      {hasWebGl && hydraCanvasRef && (
        <HydraCanvas ref={hydraCanvasRef} fullscreen />
      )}
      <div className="fixed top-1 right-1 flex m-1">
        {replTargets.length > 0 && (
          <ReplsButton onClick={() => setReplsDialogOpen(true)} />
        )}
        <CommandsButton onClick={() => setCommandsDialogOpen(true)} />
      </div>
      <Toaster />
    </>
  );
}
