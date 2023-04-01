import Editor from "@/components/editor";
import Mosaic from "@/components/mosaic";
import Pane from "@/components/pane";
import SessionCommandDialog from "@/components/session-command-dialog";
import { Toaster } from "@/components/ui/toaster";
import UsernameDialog from "@/components/username-dialog";
import { store } from "@/lib/utils";
import { Session } from "@flok/session";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ConfigureDialog from "@/components/configure-dialog";
import SessionMenu from "@/components/session-menu";

interface SessionLoaderParams {
  name: string;
}

interface Pane {
  target: string;
  content: string;
}

const defaultTarget = "hydra";

export default function SessionPage() {
  const { name } = useLoaderData() as SessionLoaderParams;
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string>("");
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [panes, setPanes] = useState<Pane[]>([
    { target: defaultTarget, content: "" },
  ]);

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

    // Load and set saved username, if available
    const savedUsername = store.get("username");
    if (!savedUsername) {
      setUsernameDialogOpen(true);
    } else {
      setUsername(savedUsername);
    }

    return () => newSession.dispose();
  }, [name]);

  useEffect(() => {
    if (!session) return;
    console.log(`Setting user on session to '${username}'`);
    session.user = username;
    store.set("username", username);
  }, [session, username]);

  const handleViewLayoutAdd = () => {
    setPanes((prevPanes) => [
      ...prevPanes,
      { target: defaultTarget, content: "" },
    ]);
  };

  const handleViewLayoutRemove = () => {
    setPanes((prevPanes) => prevPanes.slice(0, -1));
  };

  return (
    <>
      <SessionMenu
        onViewLayoutAdd={handleViewLayoutAdd}
        onViewLayoutRemove={handleViewLayoutRemove}
        onSessionConfigure={() => setConfigureDialogOpen(true)}
        onSessionChangeUsername={() => setUsernameDialogOpen(true)}
        onSessionNew={() => navigate("/")}
      />
      <SessionCommandDialog />
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
        items={panes.map((pane, i) => (
          <Pane key={i}>
            <Editor
              key={i}
              value={pane.content}
              autoFocus={i === 0}
              session={session}
              target={pane.target}
              id={`pane-${i}`}
              className="flex-grow"
            />
          </Pane>
        ))}
      />
      <Toaster />
    </>
  );
}
