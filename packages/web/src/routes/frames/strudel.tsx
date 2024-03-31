import { useEvalHandler } from "@/hooks/use-eval-handler";
import { StrudelWrapper } from "@/lib/strudel-wrapper";
import { sendToast } from "@/lib/utils";
import { type EvalMessage } from "@flok-editor/session";
import { useEffect, useState } from "react";

export function Component() {
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const instance = new StrudelWrapper({
        onError: (err) => {
          sendToast("destructive", "Strudel error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "Strudel warning", msg);
        },
        session: window.parent.session,
        editorRefs: window.parent.editorRefs,
      });

      await instance.importModules();
      setInstance(instance);
    })();
  }, []);

  useEvalHandler(
    (msg: EvalMessage) => {
      if (!instance) return;
      instance.tryEval(msg);
    },
    [instance]
  );

  return null;
}
