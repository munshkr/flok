"use client";

import React, { useMemo, useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useTheme } from "next-themes";
import { fontMono } from "@/app/theme";

type CodeMirrorThemeProp = "light" | "dark";

const codeMirrorTheme = (theme?: string): CodeMirrorThemeProp => {
  if (theme === "light") return "light";
  return "dark";
};

const baseTheme = EditorView.baseTheme({
  ".cm-scroller": { fontFamily: fontMono.style.fontFamily, fontWeight: 600 },
});

function Editor(props: ReactCodeMirrorProps) {
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
      theme={themeName}
      extensions={[baseTheme, javascript()]}
      basicSetup={{
        foldGutter: false,
        lineNumbers: false,
      }}
      {...props}
    />
  );
}

export default Editor;
