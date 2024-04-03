import { Session } from "@flok-editor/session";
import {
  highlightMiniLocations,
  updateMiniLocations,
} from "@strudel/codemirror";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useCallback } from "react";
import { useAnimationFrame } from "./use-animation-frame";
import { forEachDocumentContext } from "@/lib/utils";

export function useStrudelCodemirrorExtensions(
  session: Session | null,
  editorRefs: React.RefObject<ReactCodeMirrorRef>[]
) {
  useAnimationFrame(
    useCallback(() => {
      if (!session) return;

      forEachDocumentContext(
        (ctx, editor) => {
          const view = editor?.view;
          if (!view) return;
          updateMiniLocations(view, ctx.miniLocations || []);
          highlightMiniLocations(view, ctx.phase || 0, ctx.haps || []);
        },
        session,
        editorRefs
      );
    }, [session, editorRefs])
  );
}
