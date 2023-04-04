import Editor from "@/components/editor";
import Mosaic from "@/components/mosaic";
import Pane from "@/components/pane";
import SessionCommandDialog from "@/components/session-command-dialog";
import { Toaster } from "@/components/ui/toaster";
import UsernameDialog from "@/components/username-dialog";
import { store } from "@/lib/utils";
import { Session, Document } from "@flok/session";
import { useEffect, useState, useCallback } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ConfigureDialog from "@/components/configure-dialog";
import SessionMenu from "@/components/session-menu";
import TargetSelect from "@/components/target-select";

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
  const [documents, setDocuments] = useState<Document[]>([]);

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
    newSession.setActiveDocuments([{ id: "1", target: "tidal" }]);

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

    return () => newSession.destroy();
  }, [name]);

  useEffect(() => {
    if (!session) return;
    console.log(`Setting user on session to '${username}'`);
    session.user = username;
    store.set("username", username);
  }, [session, username]);

  const handleViewLayoutAdd = useCallback(() => {
    if (!session) return;
    const newDocs = [
      ...documents.map((doc) => ({ id: doc.id, target: doc.target })),
      { id: String(documents.length + 1), target: "default" },
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
        items={documents.map((doc, i) => (
          <Pane key={doc.id}>
            <TargetSelect
              value={doc.target}
              onChange={(t) => handleTargetSelectChange(doc, t)}
            />
            <Editor document={doc} autoFocus={i === 0} className="flex-grow" />
          </Pane>
        ))}
      />
      <Toaster />
    </>
  );
}
