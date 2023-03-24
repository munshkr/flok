"use client";

import React, { useMemo, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useTheme } from "next-themes";

type CodeMirrorThemeProp = "light" | "dark" | "none";

const codeMirrorTheme = (theme?: string): CodeMirrorThemeProp => {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  return "none";
};

interface IEditorProps {
  value: string;
  onChange?: (value: string, viewUpdate: any) => void;
}

function Editor({ value, onChange }: IEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  const themeName = useMemo(() => codeMirrorTheme(theme), [theme]);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <CodeMirror
      value={value}
      theme={themeName}
      extensions={[javascript()]}
      onChange={onChange}
    />
  );
}

export default Editor;
