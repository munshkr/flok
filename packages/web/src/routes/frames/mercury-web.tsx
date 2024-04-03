import { useEvalHandler } from "@/hooks/use-eval-handler";
import { MercuryWrapper } from "@/lib/mercury-wrapper";
import { sendToast } from "@/lib/utils";
import { type EvalMessage } from "@flok-editor/session";
import { useCallback, useEffect, useState } from "react";

export function Component() {
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const instance = new MercuryWrapper({
        onError: (err) => {
          sendToast("destructive", "Mercury error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "Mercury warning", msg);
        },
      });

      setInstance(instance);
    })();
  }, []);

  useEvalHandler(
    useCallback(
      (msg: EvalMessage) => {
        if (!instance) return;
        instance.tryEval(msg.body);
      },
      [instance]
    )
  );

  return null;
}
