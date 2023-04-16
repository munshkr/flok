import { Message } from "@/routes/session";
import { cn } from "@/lib/utils";
import { Rnd } from "react-rnd";
import { useState, useEffect, useRef, useMemo } from "react";
import { store } from "@/lib/utils";

type ExtMessage = Message & { sameTarget: boolean };

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

function clamp(n: number): number {
  return Math.min(Math.max(n, 0), 1);
}

export function MessagesPanel({
  className,
  messages,
}: {
  className?: string;
  messages: Message[];
}) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [resizeTriggered, setResizeTriggered] = useState(false);

  // Size and position are relative to window.innerWidth and window.innerHeight
  const [size, setSize] = useState<Size>(
    store.get("messages-panel:size", {
      width: 0.4,
      height: 0.4,
    })
  );
  const [position, setPosition] = useState<Position>(
    store.get("messages-panel:position", {
      x: 0.55,
      y: 0.55,
    })
  );

  useEffect(() => {
    console.log("position", position);
    store.set("messages-panel:position", position);
  }, [position]);

  useEffect(() => {
    console.log("size", size);
    store.set("messages-panel:size", size);
  }, [size]);

  // Resize trigger event
  useEffect(() => {
    const resizeHandler = () => setResizeTriggered((r) => !r);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  // Scroll container to the end automatically when there are new messages
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [containerRef, messages]);

  const absSize = useMemo(
    () => ({
      width: clamp(size.width) * innerWidth,
      height: clamp(size.height) * innerHeight,
    }),
    [size, resizeTriggered]
  );

  const absPosition = useMemo(
    () => ({
      x: clamp(position.x) * innerWidth,
      y: clamp(position.y) * innerHeight,
    }),
    [position, resizeTriggered]
  );

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

  console.log("messagesPrev", messagesPrev);

  return (
    <Rnd
      className={cn(
        "overflow-hidden rounded-md pl-1 pr-1 pb-2 border border-gray-800 shadow-lg shadow-black/50 text-slate-50 font-mono text-xs bg-black bg-opacity-70 z-10",
        className
      )}
      size={absSize}
      position={absPosition}
      dragHandleClassName="messages-header"
      bounds="window"
      onDrag={(e) => e.preventDefault()}
      onDragStop={(e, d) => {
        const { x, y } = d;
        setPosition({
          x: clamp(x / innerWidth),
          y: clamp(y / innerHeight),
        });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: clamp(+ref.style.width.replace("px", "") / innerWidth),
          height: clamp(+ref.style.height.replace("px", "") / innerHeight),
        });
        setPosition({
          x: clamp(position.x / innerWidth),
          y: clamp(position.y / innerHeight),
        });
      }}
    >
      <div className="w-full h-full overflow-x-clip">
        <div className="messages-header font-bold sticky top-0 cursor-move pb-1">
          Messages
        </div>
        <ul ref={containerRef} className="h-[calc(100%-16px)] overflow-auto">
          {messagesPrev.map(({ sameTarget, target, body, type }, i) => (
            <li key={i} className="block">
              {!sameTarget && (
                <p className="rounded-lg bg-gray-900 bg-opacity-20 p-1 mt-1 font-bold">
                  {target}
                </p>
              )}
              {body.map((line, j) => (
                <pre
                  key={j}
                  className={cn(type === "stderr" && "text-red-400")}
                >
                  {line}
                </pre>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </Rnd>
  );
}
