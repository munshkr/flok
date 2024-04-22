import { useQuery } from "@/hooks/use-query";
import { EvalMessage, Session } from "@flok-editor/session";
import { useEffect, useRef } from "react";

export interface WebTargetIframeProps {
  target: string;
  session: Session | null;
}

export const WebTargetIframe = ({ target, session }: WebTargetIframeProps) => {
  const ref = useRef<HTMLIFrameElement | null>(null);

  const query = useQuery();
  const noWebEval = query.get("noWebEval")?.split(",") || [];

  // Check if we should load the target
  if (noWebEval.includes(target) || noWebEval.includes("*")) {
    return null;
  }

  // Handle evaluation messages from session
  useEffect(() => {
    if (!session || !ref.current) return;

    const handler = (msg: EvalMessage) => {
      const payload = {
        type: "eval",
        body: msg,
      };
      ref.current?.contentWindow?.postMessage(payload, "*");
    };

    session.on(`eval:${target}`, handler);

    return () => {
      session.off(`eval:${target}`, handler);
    };
  }, [session, ref]);

  return (
    <iframe
      ref={ref}
      src={`/frames/${target}`}
      className="absolute inset-0 w-full h-full"
    />
  );
};
