"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Menu from "@/components/menu";
import Mosaic from "@/components/mosaic";
import ConfigureDialog from "./configure-dialog";
import { allTargets } from "@flok/core";
import { store } from "@/lib/utils";

interface Pane {
  target: string;
  content: string;
}

const defaultTarget = allTargets[0] || "default";

interface ISessionPageProps {
  name: string;
}

export default function SessionPage() {
  const pathname = usePathname();
  const sessionName = pathname.slice(1);

  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [panes, setPanes] = useState<Pane[]>([
    { target: defaultTarget, content: "" },
  ]);

  useEffect(() => {
    const key = `session:${sessionName}`;
    const settings = store.get(key);
    if (!settings) store.set(key, {});
    console.log("settings for", sessionName, settings);
  }, [sessionName]);

  const handleViewLayoutAdd = () => {
    setPanes((prevPanes) => [
      ...prevPanes,
      { target: defaultTarget, content: "" },
    ]);
  };

  const handleViewLayoutRemove = () => {
    setPanes((prevPanes) => prevPanes.slice(0, -1));
  };

  const handleSessionConfigure = () => {
    setConfigureDialogOpen(true);
  };

  return (
    <>
      <Menu
        onViewLayoutAdd={handleViewLayoutAdd}
        onViewLayoutRemove={handleViewLayoutRemove}
        onSessionConfigure={handleSessionConfigure}
      />
      <ConfigureDialog
        open={configureDialogOpen}
        onOpenChange={(isOpen) => setConfigureDialogOpen(isOpen)}
      />
      <Mosaic
        items={panes.map((pane, i) => (
          <div key={i}>{pane.target}</div>
        ))}
      />
    </>
  );
}
