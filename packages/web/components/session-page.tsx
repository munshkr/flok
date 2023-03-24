"use client";

import Menu from "@/components/menu";
import Mosaic from "@/components/mosaic";
import { useState } from "react";
import { allTargets } from "@flok/core";

interface Pane {
  target: string;
  content: string;
}

const defaultTarget = allTargets[0] || "default";

export default function SessionPage() {
  const [panes, setPanes] = useState<Pane[]>([
    { target: defaultTarget, content: "" },
  ]);

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
      <Menu
        onViewLayoutAdd={handleViewLayoutAdd}
        onViewLayoutRemove={handleViewLayoutRemove}
      />
      <Mosaic
        items={panes.map((pane, i) => (
          <div key={i}>{pane.target}</div>
        ))}
      />
    </>
  );
}
