import { CommandsButton } from "@/components/commands-button";
import { ConfigureDialog } from "@/components/configure-dialog";
import { Editor } from "@/components/editor";
import { MessagesPanel } from "@/components/messages-panel";
import { Mosaic } from "@/components/mosaic";
import { Pane } from "@/components/pane";
import { ReplsButton } from "@/components/repls-button";
import { ReplsDialog } from "@/components/repls-dialog";
import SessionCommandDialog from "@/components/session-command-dialog";
import { ShareUrlDialog } from "@/components/share-url-dialog";
import { PubSubState, StatusBar, SyncState } from "@/components/status-bar";
import { Toaster } from "@/components/ui/toaster";
import UsernameDialog from "@/components/username-dialog";
import { WebTargetIframe } from "@/components/web-target-iframe";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { useHash } from "@/hooks/use-hash";
import { useQuery } from "@/hooks/use-query";
import { useShortcut } from "@/hooks/use-shortcut";
import { useStrudelCodemirrorExtensions } from "@/hooks/use-strudel-codemirror-extensions";
import { useToast } from "@/hooks/use-toast";
import {
  cn,
  code2hash,
  generateRandomUserName,
  hash2code,
  mod,
  store,
} from "@/lib/utils";
import {
  defaultTarget,
  knownTargets,
  panicCodes as panicCodesUntyped,
  webTargets,
} from "@/settings.json";
import { Session, type Document } from "@flok-editor/session";
import { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

declare global {
  interface Window {
    documentsContext: { [docId: string]: any };
    hydra: any;
    mercury: any;
    strudel: any;
  }
}

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

export async function loader({ params }: LoaderFunctionArgs) {
  return { name: params.name };
}

export function Component() {
  const query = useQuery();
  const [hash, setHash] = useHash();

  const { name } = useLoaderData() as SessionLoaderParams;
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [pubSubState, setPubSubState] = useState<PubSubState>("disconnected");
  const [syncState, setSyncState] = useState<SyncState>("syncing");
  const [commandsDialogOpen, setCommandsDialogOpen] = useState<boolean>(false);
  const [replsDialogOpen, setReplsDialogOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [shareUrlDialogOpen, setShareUrlDialogOpen] = useState(false);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hidden, setHidden] = useState<boolean>(false);
  const [lineNumbers, setLineNumbers] = useState<boolean>(false);
  const [vimMode, setVimMode] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<string>("monospace");
  const [theme, setTheme] = useState<string>("monospace");
  const [wrapText, setWrapText] = useState<boolean>(false);
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
  const [sessionUrl, setSessionUrl] = useState<string>("");

  const editorRefs = Array.from({ length: 8 }).map(() =>
    useRef<ReactCodeMirrorRef>(null)
  );

  useStrudelCodemirrorExtensions(session, editorRefs);

  const { toast: _toast } = useToast();
  const hideErrors = !!query.get("hideErrors");

  // Only call toast if query parameter "hideErrors" is not present
  const toast = useCallback(
    (options: Parameters<typeof _toast>[0]) => {
      if (hideErrors) return;
      _toast(options);
    },
    [_toast, hideErrors]
  );

  const postMessageParentWindow = (message: any) => {
    window.parent.postMessage(message, "*");
  };

  const firstTime = useMemo(() => store.get("firstTime", true), []);

  useEffect(() => {
    if (!firstTime) return;
    setWelcomeDialogOpen(true);
    store.set("firstTime", false);
  }, [firstTime]);

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
    newSession.on("sync", (protocol: string) => {
      setSyncState(newSession.wsConnected ? "synced" : "partiallySynced");

      console.log("Synced first with protocol:", protocol);

      // If session is empty, set targets from hash parameter if present.
      // Otherwise, use default target.
      if (newSession.getDocuments().length === 0) {
        console.log(
          "Session is empty, setting targets and code from hash params"
        );
        // If `targets` hash param is present and has valid targets, set them as
        // active documents.
        const targets = hash["targets"]?.split(",") || [];
        const validTargets = targets.filter((t) => knownTargets.includes(t));
        console.log("Valid targets from hash:", validTargets);
        if (validTargets.length > 0) {
          setActiveDocuments(newSession, validTargets);
        } else {
          setActiveDocuments(newSession, [defaultTarget]);
        }

        // For each valid target, set the corresponding document content from
        // hash (if present). `code` is an alias of `c0`.
        const documents = newSession.getDocuments();
        validTargets.forEach((_, i) => {
          let content = hash[`c${i}`];
          if (i == 0) content = content || hash["code"];
          if (content) {
            try {
              const code = hash2code(content);
              console.log(`Setting code for target ${i}:`, code);
              documents[i].content = code;
            } catch (err) {
              console.error(`Error parsing code ${i}`, err);
            }
          }
        });

        // Clear hash parameters
        setHash({});
      }
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

      postMessageParentWindow({
        event: "change",
        documents: documents.map((doc: Document) => ({
          id: doc.id,
          target: doc.target,
          content: doc.content,
        })),
      });
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

      postMessageParentWindow({
        event: "message",
        message,
      });
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

    newSession.on("eval", ({ docId, body, user }) => {
      postMessageParentWindow({
        event: "eval",
        id: docId,
        content: body,
        user,
      });
    });

    newSession.initialize();
    setSession(newSession);

    // Load and set saved username, if available
    // If read only is enabled, use a random username
    const readOnly = !!query.get("readOnly");
    if (readOnly) {
      setUsername(generateRandomUserName());
    } else {
      const savedUsername = hash["username"] || store.get("username");
      if (!savedUsername) {
        setUsername(generateRandomUserName());
        setUsernameDialogOpen(true);
      } else {
        setUsername(savedUsername);
      }
    }

    return () => newSession.destroy();
  }, [name]);

  useEffect(() => {
    if (!session) return;
    console.log(`Setting user on session to '${username}'`);
    session.user = username;
    // Store username in local storage only if it's not random (read only mode)
    if (!query.get("readOnly")) {
      store.set("username", username);
    }
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

  useEffect(() => {
    if (!shareUrlDialogOpen) return;
    if (!session) return;

    // Update sessionURL based on current session layout and documents
    // We need: session documents, and documents contents
    const documents = session.getDocuments();
    const targets = documents.map((doc) => doc.target);
    const contents = documents.map((doc) => doc.content);

    const hash = {
      targets: targets.join(","),
      ...contents.reduce((acc: { [key: string]: string }, content, i) => {
        acc[`c${i}`] = code2hash(content);
        return acc;
      }, {}),
    };

    const hashString = new URLSearchParams(hash).toString();
    const currentURL = window.location.href;

    setSessionUrl(`${currentURL}#${hashString}`);
  }, [session, shareUrlDialogOpen]);

  // Handle window messages from iframes
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === "toast") {
        const { variant, title, message, pre } = event.data.body;
        const description = pre ? (
          <pre className="whitespace-pre-wrap">{message}</pre>
        ) : (
          message
        );
        toast({ variant, title, description });
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

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
  useShortcut(["Control-P", "Meta-P"], () =>
    setConfigureDialogOpen((open) => !open)
  );
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
    setActiveDocuments(session, targets);
  };

  const setActiveDocuments = (session: Session, targets: string[]) => {
    session.setActiveDocuments(
      targets
        .filter((t) => t)
        .map((target, i) => ({ id: String(i + 1), target }))
    );
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

  const bgOpacity = query.get("bgOpacity") || "1.0";

  const activeWebTargets = useMemo(
    () =>
      webTargets.filter((target) =>
        documents.some((doc) => doc.target === target)
      ),
    [documents]
  );

  return (
    <div style={{ backgroundColor: `rgb(0 0 0 / ${bgOpacity})` }}>
      <Helmet>
        <title>{name} ~ Flok</title>
      </Helmet>
      <SessionCommandDialog
        open={commandsDialogOpen}
        onOpenChange={(isOpen) => setCommandsDialogOpen(isOpen)}
        onSessionChangeUsername={() => setUsernameDialogOpen(true)}
        onVimMode={() => setVimMode((vimMode) => !vimMode)}
        onLineNumbers={() => setLineNumbers((lineNumbers) => !lineNumbers)}
        onChangeFontFamily={(font) => setFontFamily(font)}
        onChangeTheme={(theme) => setTheme(theme)}
        onWrapText={() => setWrapText((wrapText) => !wrapText)}
        onSessionNew={() => navigate("/")}
        onSessionShareUrl={() => setShareUrlDialogOpen(true)}
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
      <WelcomeDialog
        open={welcomeDialogOpen}
        onOpenChange={(isOpen) => setWelcomeDialogOpen(isOpen)}
      />
      <ShareUrlDialog
        url={sessionUrl}
        open={shareUrlDialogOpen}
        onOpenChange={(isOpen) => setShareUrlDialogOpen(isOpen)}
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
              lineNumbers={lineNumbers}
              vimMode={vimMode}
              wrapText={wrapText}
              customTheme={theme}
              className="absolute top-6 overflow-auto flex-grow w-full h-[calc(100%-32px)] z-10"
            />
          </Pane>
        ))}
      />
      {activeWebTargets.map((target) => (
        <WebTargetIframe key={target} session={session} target={target} />
      ))}
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
    </div>
  );
}
