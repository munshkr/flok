import { EvalMessage } from "@flok-editor/session";
import { useEffect } from "react";

export function useEvalHandler(
  cb: (evalMessage: EvalMessage) => void,
  deps: any[]
) {
  useEffect(() => {
    const handleEval = (event: MessageEvent) => {
      if (event.data.type === "eval") {
        const msg = event.data.body as EvalMessage;
        cb && cb(msg);
      }
    };

    window.addEventListener("message", handleEval);

    return () => {
      window.removeEventListener("message", handleEval);
    };
  }, deps);

  return;
}
