import { FloatingPanel } from "@/components/ui/floating-panel";
import { cn } from "@/lib/utils";
import { Message } from "@/routes/session";
import { useEffect, useMemo, useRef } from "react";

type ExtMessage = Message & { sameTarget: boolean };

export function MessagesPanel({
  className,
  messages,
}: {
  className?: string;
  messages: Message[];
}) {
  const containerRef = useRef<HTMLUListElement>(null);

  // Scroll container to the end automatically when there are new messages
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [containerRef, messages]);

  // Include `sameTarget` prop to know if a message is from the same target as
  // the previous message.
  const messagesPrev = useMemo(() => {
    let res: ExtMessage[] = [];
    for (let i = 0; i < messages.length; i++) {
      const curMessage = messages[i];
      const prevMessage = i > 0 && messages[i - 1];
      res.push({
        ...curMessage,
        sameTarget: prevMessage && prevMessage.target === curMessage.target,
      });
    }
    return res;
  }, [messages]);

  return (
    <FloatingPanel id="messages" header="Messages" className={className}>
      <ul ref={containerRef} className="h-[calc(100%-16px)] overflow-auto">
        {messagesPrev.map(({ sameTarget, target, body, type }, i) => (
          <li key={i} className="block">
            {!sameTarget && (
              <p className="rounded-lg bg-gray-900 bg-opacity-20 p-1 mt-1 font-bold">
                {target}
              </p>
            )}
            {body.map((line, j) => (
              <pre key={j} className={cn(type === "stderr" && "text-red-400")}>
                {line}
              </pre>
            ))}
          </li>
        ))}
      </ul>
    </FloatingPanel>
  );
}
