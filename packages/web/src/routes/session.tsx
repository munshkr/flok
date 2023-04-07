import Editor from "@/components/editor";
import Mosaic from "@/components/mosaic";
import Pane from "@/components/pane";
import SessionCommandDialog from "@/components/session-command-dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import UsernameDialog from "@/components/username-dialog";
import { store } from "@/lib/utils";
import { Session, Document } from "@flok-editor/session";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ConfigureDialog from "@/components/configure-dialog";
import TargetSelect from "@/components/target-select";
import { CommandsButton } from "@/components/commands-button";
import { Helmet } from "react-helmet-async";
import { isWebglSupported } from "@/lib/webgl-detector";
import HydraCanvas from "@/components/hydra-canvas";
import type { HydraWrapper } from "@/lib/hydra-wrapper";
import type { StrudelWrapper } from "@/lib/strudel-wrapper";
import { defaultTarget } from "@/settings.json";
import { panicCodes as panicCodesUntyped } from "@/settings.json";

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
    newSession.setActiveDocuments([{ id: "1", target: defaultTarget }]);
    setDocuments(newSession.getDocuments());

    // Load and set saved username, if available
    const savedUsername = store.get("username");
    if (!savedUsername) {
      setUsernameDialogOpen(true);
    } else {
      setUsername(savedUsername);
    }

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

    return () => newSession.destroy();
  }, [name]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandsDialogOpen((open) => !open);
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

        const strudel = new StrudelWrapper({ onError: handleHydraError });
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
          onError: handleHydraError,
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
          if (panicCode) doc.evaluate(panicCode, { from: 0, to: 0 });
        });
        toast({ title: "Panic!", duration: 1000 });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [documents]);

  const handleViewLayoutAdd = useCallback(() => {
    if (!session) return;
    const newDocs = [
      ...documents.map((doc) => ({ id: doc.id, target: doc.target })),
      { id: String(documents.length + 1), target: defaultTarget },
    ];
    console.log("newDocs", newDocs);
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

  const handleHydraError = (error: string) => {
    if (!error) return;
    toast({
      variant: "destructive",
      title: "Hydra error",
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
      <ConfigureDialog
        open={configureDialogOpen}
        onOpenChange={(isOpen) => setConfigureDialogOpen(isOpen)}
      />
      <Mosaic
        items={documents.map((doc, i) => (
          <Pane key={doc.id}>
            <TargetSelect
              triggerProps={{
                className:
                  "w-auto h-6 border-none focus:ring-0 focus:ring-offset-0 p-1 bg-slate-900 bg-opacity-50",
              }}
              value={doc.target}
              onValueChange={(t) => handleTargetSelectChange(doc, t)}
            />
            <Editor document={doc} autoFocus={i === 0} className="flex-grow" />
          </Pane>
        ))}
      />
      {hasWebGl && hydraCanvasRef && (
        <HydraCanvas ref={hydraCanvasRef} fullscreen />
      )}
      <CommandsButton onClick={() => setCommandsDialogOpen(true)} />
      <Toaster />
    </>
  );
}
