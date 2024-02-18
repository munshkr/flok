import { useWebTarget } from "@/hooks/use-web-target";
import { StrudelWrapper } from "@/lib/strudel-wrapper";
import type { Session } from "@flok-editor/session";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

export function useStrudel(
  session: Session | null,
  onError?: (err: unknown) => void,
  onWarning?: (msg: string) => void,
  editorRefs?: React.RefObject<ReactCodeMirrorRef>[]
) {
  return useWebTarget<StrudelWrapper>(
    "strudel",
    session,
    async () => {
      console.log("Create StrudelWrapper");
      const strudel = new StrudelWrapper({ onError, onWarning, editorRefs });

      console.log("Import Strudel modules");
      await strudel.importModules();

      return strudel;
    },
    {
      onEval: (instance, msg) => instance.tryEval(msg),
      onError,
    }
  );
}
