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

interface IEditorProps extends ReactCodeMirrorProps {
  session: any;
  target: string;
  id: string;
}

function Editor({ session, target, id, ...props }: IEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  const themeName = useMemo(() => codeMirrorTheme(theme), [theme]);

  // useEffect(() => {
  //   (async () => {
  //     if (!session || !id || !target) return [];
  //     const cm = await import("@flok/codemirror");
  //     const setup = cm.flokBasicSetup(session, id, target);
  //     console.log("setup", setup);
  //     setFlokSetup(setup);
  //   })();
  // }, [session, id, target]);

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
