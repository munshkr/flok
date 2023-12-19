import { CommandsButton } from "@/components/commands-button";
import { ConfigureDialog } from "@/components/configure-dialog";
import { Editor } from "@/components/editor";
import HydraCanvas from "@/components/hydra-canvas";
import { MessagesPanel } from "@/components/messages-panel";
import { Mosaic } from "@/components/mosaic";
import { Pane } from "@/components/pane";
import { ReplsButton } from "@/components/repls-button";
import { ReplsDialog } from "@/components/repls-dialog";
import SessionCommandDialog from "@/components/session-command-dialog";
import { PubSubState, StatusBar, SyncState } from "@/components/status-bar";
import { Toaster } from "@/components/ui/toaster";
import UsernameDialog from "@/components/username-dialog";
import { useHydra } from "@/hooks/use-hydra";
import { useShortcut } from "@/hooks/use-shortcut";
import { useStrudel } from "@/hooks/use-strudel";
import { useMercury } from "@/hooks/use-mercury";
import { useToast } from "@/hooks/use-toast";
import { cn, mod, store } from "@/lib/utils";
import { isWebglSupported } from "@/lib/webgl-detector";
import {
  defaultTarget,
  panicCodes as panicCodesUntyped,
  webTargets,
} from "@/settings.json";
import { Document, Session } from "@flok-editor/session";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLoaderData, useNavigate } from "react-router-dom";

const panicCodes = panicCodesUntyped as { [target: string]: string };

interface SessionLoaderParams {
  name: string;
}

export interface Message {
  target: string;
  tags: string[];
  type: "stdout" | "stderr";
  body: string[];
}

export default function SessionPage() {
  const { name } = useLoaderData() as SessionLoaderParams;
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [pubSubState, setPubSubState] = useState<PubSubState>("disconnected");
  const [syncState, setSyncState] = useState<SyncState>("syncing");
  const [commandsDialogOpen, setCommandsDialogOpen] = useState<boolean>(false);
  const [replsDialogOpen, setReplsDialogOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hidden, setHidden] = useState<boolean>(false);
  const [messagesPanelExpanded, setMessagesPanelExpanded] =
    useState<boolean>(false);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [autoShowMessages, setAutoShowMessages] = useState<boolean>(
    store.get("messages:autoshow", true)
  );
  const [hideMessagesOnEval, setHideMessagesOnEval] = useState<boolean>(
    store.get("messages:hide-on-eval", true)
  );

  const editorRefs = Array.from({ length: 8 }).map(() =>
    useRef<ReactCodeMirrorRef>(null)
  );

  const hasWebGl = useMemo(() => isWebglSupported(), []);

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

    // Default documents
    newSession.on("sync", () => {
      setSyncState(newSession.wsConnected ? "synced" : "partiallySynced");
      if (newSession.getDocuments().length > 0) return;
      console.log("Create a default document");
      newSession.setActiveDocuments([{ id: "1", target: defaultTarget }]);
    });

    newSession.on("ws:connect", () => {
      setSyncState(newSession.synced ? "synced" : "partiallySynced");
    });

    newSession.on("ws:disconnect", () => {
      setSyncState(newSession.synced ? "partiallySynced" : "syncing");
    });

    // If documents change on server, update state
    newSession.on("change", (documents) => {
      setDocuments(documents);
    });

    newSession.on("pubsub:start", () => {
      setPubSubState("connecting");
    });

    newSession.on("pubsub:stop", () => {
      setPubSubState("disconnected");
    });

    let connected = true;
    newSession.on("pubsub:open", () => {
      setPubSubState("connected");
      if (connected) return;
      connected = true;
      toast({
        title: "Connected to server",
        duration: 1000,
      });
    });

    newSession.on("pubsub:close", () => {
      setPubSubState("connecting");
      if (!connected) return;
      connected = false;
      toast({
        variant: "destructive",
        title: "Disconnected from server",
        description: "Remote evaluations will be ignored until reconnected.",
      });
    });

    newSession.on("message", ({ message }) => {
      setMessages((messages) => [...messages, message as Message]);
      setMessagesCount((count) => count + 1);
    });

    newSession.on("message", ({ message }) => {
      const { target, type, body } = message;
      const content = body.join("\n").trim();
      if (content) {
        console.log(
          `%c${target}` + `%c ${content}`,
          "font-weight: bold",
          type === "stderr" ? "color: #ff5f6b" : ""
        );
      }
    });

    newSession.initialize();
    setSession(newSession);

    // Load and set saved username, if available
    const savedUsername = store.get("username");
    if (!savedUsername) {
      setUsernameDialogOpen(true);
    } else {
      setUsername(savedUsername);
    }

    return () => newSession.destroy();
  }, [name]);

  // Show a warning if WebGL is not enabled
  useEffect(() => {
    if (!session || hasWebGl) return;

    toast({
      variant: "warning",
      title: "WebGL not available",
      description:
        "WebGL is disabled or not supported, so Hydra was not initialized",
    });
  }, [session, hasWebGl]);

  useEffect(() => {
    if (!session) return;
    console.log(`Setting user on session to '${username}'`);
    session.user = username;
    store.set("username", username);
  }, [session, username]);

  // Reset messages count when panel is expanded (mark all messages as read)
  useEffect(() => setMessagesCount(0), [messagesPanelExpanded]);

  // Show messages panel if autoShowMessages is enabled and there are messages
  useEffect(() => {
    if (autoShowMessages && messages.length > 0) setMessagesPanelExpanded(true);
  }, [messages]);

  // Hide messages panel after evaluation if hideMessagesOnEval is enabled
  useEffect(() => {
    if (!session || !hideMessagesOnEval) return;

    const evalHandler = () => {
      setMessagesPanelExpanded(false);
    };

    session.on("eval", evalHandler);
    return () => session.off("eval", evalHandler);
  }, [session, hideMessagesOnEval]);

  // Load external libraries
  useStrudel(
    session,
    (err) => handleWebError("Strudel", err),
    (msg) => handleWebWarning("Strudel", msg)
  );
  useMercury(
    session,
    (err) => handleWebError("Mercury", err),
    (msg) => handleWebWarning("Mercury", msg)
  )
  const { canvasRef: hydraCanvasRef } = useHydra(
    session,
    (err) => handleWebError("Hydra", err),
    (msg) => handleWebWarning("Hydra", msg)
  );

  const focusEditor = (i: number) => {
    const ref = editorRefs[i].current;
    if (!ref) return;
    const { view } = ref;
    view?.focus();
  };

  const getFocusedEditorIndex = (): number => {
    const i = editorRefs.findIndex(
      (ref) => ref.current && ref.current.view?.hasFocus
    );
    return i;
  };

  // Global shortcuts
  useShortcut(["Control-J", "Meta-J"], () =>
    setCommandsDialogOpen((open) => !open)
  );
  useShortcut(["Control-P"], () => setConfigureDialogOpen((open) => !open));
  useShortcut(
    ["Control-Shift-.", "Meta-Shift-."],
    () => {
      documents.forEach((doc) => {
        const panicCode = panicCodes[doc.target];
        if (panicCode) doc.evaluate(panicCode, { from: null, to: null });
      });
      toast({ title: "Panic!", duration: 1000 });
    },
    [documents]
  );
  Array.from({ length: 8 }).map((_, i) => {
    useShortcut([`Control-${i}`], () => focusEditor(i - 1), [...editorRefs]);
  });
  useShortcut(
    ["Control-["],
    () => {
      const curIndex = getFocusedEditorIndex();
      if (curIndex < 0) return;
      const newIndex = mod(curIndex - 1, documents.length);
      focusEditor(newIndex);
    },
    [documents, ...editorRefs]
  );
  useShortcut(
    ["Control-]"],
    () => {
      const curIndex = getFocusedEditorIndex();
      if (curIndex < 0) return;
      const newIndex = mod(curIndex + 1, documents.length);
      focusEditor(newIndex);
    },
    [documents, ...editorRefs]
  );
  useShortcut(["Meta-Shift-H", "Control-Shift-H"], () => {
    setHidden((p) => !p);
  });
  useShortcut(["Control-,", "Meta-,"], () => {
    setMessagesPanelExpanded((v) => !v);
  });

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

  const handleWebError = (title: string, error: unknown) => {
    if (!error) return;
    toast({
      variant: "destructive",
      title,
      description: <pre className="whitespace-pre-wrap">{String(error)}</pre>,
    });
  };

  const handleWebWarning = (title: string, msg: string) => {
    if (!msg) return;
    toast({
      variant: "warning",
      title,
      description: msg,
    });
  };

  const handleAutoShowToggleClick = useCallback((pressed: boolean) => {
    store.set("messages:autoshow", pressed);
    setAutoShowMessages(pressed);
  }, []);

  const handleHideMessagesOnEvalClick = useCallback((pressed: boolean) => {
    store.set("messages:hide-on-eval", pressed);
    setHideMessagesOnEval(pressed);
  }, []);

  const handleClearMessagesClick = useCallback(() => {
    setMessages([]);
    setMessagesPanelExpanded(false);
  }, []);

  const halfHeight = useMemo(() => documents.length > 2, [documents]);

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
          userName={username}
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
          userName={username}
          open={replsDialogOpen}
          onOpenChange={(isOpen) => setReplsDialogOpen(isOpen)}
        />
      )}
      <Mosaic
        className={cn(
          "transition-opacity",
          hidden ? "opacity-0" : "opacity-100"
        )}
        items={documents.map((doc, i) => (
          <Pane
            key={doc.id}
            document={doc}
            onTargetChange={handleTargetSelectChange}
            onEvaluateButtonClick={handleEvaluateButtonClick}
          >
            <Editor
              ref={editorRefs[i]}
              document={doc}
              autoFocus={i === 0}
              className={cn(
                "absolute top-6 overflow-auto flex-grow w-full",
                halfHeight ? "h-[calc(100%-24px)]" : "h-full"
              )}
            />
          </Pane>
        ))}
      />
      {hasWebGl && hydraCanvasRef && (
        <HydraCanvas ref={hydraCanvasRef} fullscreen />
      )}
      <div
        className={cn(
          "fixed top-1 right-1 flex m-1",
          "transition-opacity",
          hidden ? "opacity-0" : "opacity-100"
        )}
      >
        {replTargets.length > 0 && (
          <ReplsButton onClick={() => setReplsDialogOpen(true)} />
        )}
        <CommandsButton onClick={() => setCommandsDialogOpen(true)} />
      </div>
      {messagesPanelExpanded && (
        <MessagesPanel
          className={cn(
            "transition-opacity",
            hidden ? "opacity-0" : "opacity-100"
          )}
          messages={messages}
          autoShowMessages={autoShowMessages}
          hideMessagesOnEval={hideMessagesOnEval}
          onAutoShowToggleClick={handleAutoShowToggleClick}
          onHideMessagesOnEvalClick={handleHideMessagesOnEvalClick}
          onClearMessagesClick={handleClearMessagesClick}
        />
      )}
      <StatusBar
        className={cn(
          "transition-opacity",
          hidden ? "opacity-0" : "opacity-100"
        )}
        pubSubState={pubSubState}
        syncState={syncState}
        messagesCount={messagesPanelExpanded ? 0 : messagesCount}
        onExpandClick={() => {
          setMessagesPanelExpanded((v) => !v);
        }}
      />
      <Toaster />
    </>
  );
}
