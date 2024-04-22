import { useEvalHandler } from "@/hooks/use-eval-handler";
import { StrudelWrapper } from "@/lib/strudel-wrapper";
import { sendToast } from "@/lib/utils";
import { type EvalMessage } from "@flok-editor/session";
import { useCallback, useEffect, useState } from "react";

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
      });

      await instance.importModules();
      setInstance(instance);

      window.parent.strudel = window;
    })();
  }, []);

  useEvalHandler(
    useCallback(
      (msg: EvalMessage) => {
        if (!instance) return;
        instance.tryEval(msg);
      },
      [instance]
    )
  );

  return null;
}
