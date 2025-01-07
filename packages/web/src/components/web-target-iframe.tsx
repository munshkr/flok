import { useQuery } from "@/hooks/use-query";
import { EvalMessage, Session } from "@flok-editor/session";
import { useEffect, useRef, useState } from "react";
import { DisplaySettings } from "@/lib/display-settings";

export interface WebTargetIframeProps {
  target: string;
  session: Session | null;
  displaySettings: DisplaySettings;
}

export const WebTargetIframe = ({
  target,
  session,
  displaySettings,
}: WebTargetIframeProps) => {
  const ref = useRef<HTMLIFrameElement | null>(null);

  const query = useQuery();
  const noWebEval = query.get("noWebEval")?.split(",") || [];
  const [firstEval, setFirstEval] = useState(true);

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
      setFirstEval(false);
    };

    session.on(`eval:${target}`, handler);

    return () => {
      session.off(`eval:${target}`, handler);
    };
  }, [session, ref]);

  // Handle user interactions
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!ref.current) return;
      const interactionMessage = { type: "user-interaction" };
      ref.current.contentWindow?.postMessage(interactionMessage, "*");
      setFirstEval(false);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [ref]);

  // Post display settings to iframe when the settings change, or when the
  // first eval occurs. The latter is a bit of a hack that prevents us from
  // having to detect when the iframe is ready to receive messages (adding
  // `ref` to the useEffect() dependencies doesn't do the trick), and it may
  // break if flok begins eval'ing on load (currently nothing is eval'd on
  // load).
  useEffect(() => {
    const message = {
      type: "settings",
      body: { displaySettings },
    };
    ref.current?.contentWindow?.postMessage(message, "*");
  }, [displaySettings, firstEval]);

  return (
    <iframe
      ref={ref}
      src={`/frames/${target}`}
      className="absolute inset-0 w-full h-full"
    />
  );
};
