import { FloatingPanel } from "@/components/ui/floating-panel";
import { cn } from "@/lib/utils";
import { Message } from "@/routes/session";
import { useEffect, useMemo, useRef } from "react";
import {
  FloatingPanelButton,
  FloatingPanelToggle,
} from "@/components/ui/floating-panel";
import { View, EyeOff, X } from "lucide-react";

type ExtMessage = Message & { sameTarget: boolean };

interface MessagesPanelProps {
  className?: string;
  messages: Message[];
  autoShowMessages: boolean;
  hideMessagesOnEval: boolean;
  onAutoShowToggleClick?: (pressed: boolean) => void;
  onHideMessagesOnEvalClick?: (pressed: boolean) => void;
  onClearMessagesClick?: () => void;
}

export function MessagesPanel({
  className,
  messages,
  autoShowMessages,
  hideMessagesOnEval,
  onAutoShowToggleClick,
  onHideMessagesOnEvalClick,
  onClearMessagesClick,
}: MessagesPanelProps) {
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
    <FloatingPanel
      id="messages"
      header="Messages"
      headerToolbar={
        <>
          <div className="flex-grow"></div>
          <FloatingPanelToggle
            tooltip="Show panel when receiving new messages"
            pressed={autoShowMessages}
            onPressedChange={onAutoShowToggleClick}
          >
            <View size={16} />
          </FloatingPanelToggle>
          <FloatingPanelToggle
            tooltip="Hide panel after evaluation"
            pressed={hideMessagesOnEval}
            onPressedChange={onHideMessagesOnEvalClick}
          >
            <EyeOff size={16} />
          </FloatingPanelToggle>
          <FloatingPanelButton
            tooltip="Clear messages"
            onClick={onClearMessagesClick}
          >
            <X size={12} />
          </FloatingPanelButton>
        </>
      }
      className={className}
    >
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
