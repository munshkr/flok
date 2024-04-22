import { EvalMessage } from "@flok-editor/session";
import { useEffect } from "react";

export function useEvalHandler(callback: (message: EvalMessage) => void) {
  useEffect(() => {
    const handleEval = (event: MessageEvent) => {
      if (event.data.type === "eval") {
        const msg = event.data.body as EvalMessage;
        callback(msg);
      }
    };

    window.addEventListener("message", handleEval);

    return () => {
      window.removeEventListener("message", handleEval);
    };
  }, [callback]);

  return;
}
