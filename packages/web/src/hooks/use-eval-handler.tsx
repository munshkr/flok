import { EvalMessage } from "@flok-editor/session";
import { useEffect } from "react";

export function useEvalHandler(
  cb: (evalMessage: EvalMessage) => void,
  deps: any[]
) {
  useEffect(() => {
    const handleEval = (event: MessageEvent) => {
      if (event.data.type === "eval") {
        cb && cb(event.data);
      }
    };

    window.addEventListener("message", handleEval);

    return () => {
      window.removeEventListener("message", handleEval);
    };
  }, deps);

  return;
}
