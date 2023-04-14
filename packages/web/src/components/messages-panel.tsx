import { Message } from "@/routes/session";
import { cn } from "@/lib/utils";
import { Rnd } from "react-rnd";
import { useState, useEffect, useRef } from "react";
import { store } from "@/lib/utils";

type Size = {
  width: string | number;
  height: string | number;
};

type Position = {
  x: number;
  y: number;
};

export function MessagesPanel({
  className,
  messages,
}: {
  className?: string;
  messages: Message[];
}) {
  const containerRef = useRef<HTMLUListElement>(null);

  const [size, setSize] = useState<Size>(
    store.get("messages-panel:size", {
      width: window.innerWidth / 2,
      height: window.innerHeight / 3,
    })
  );
  const [position, setPosition] = useState<Position>(
    store.get("messages-panel:position", {
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
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

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [containerRef, messages]);

  return (
    <Rnd
      className={cn(
        "overflow-hidden pl-1 pr-1 pb-2 border border-gray-800 shadow-lg shadow-black/50 text-slate-50 font-mono text-xs bg-black bg-opacity-70 backdrop-blur-xl z-20",
        className
      )}
      size={size}
      position={position}
      dragHandleClassName="messages-header"
      bounds="window"
      onDrag={(e) => e.preventDefault()}
      onDragStop={(e, d) => {
        const { x, y } = d;
        setPosition({ x, y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const size = {
          width: +ref.style.width.replace("px", ""),
          height: +ref.style.height.replace("px", ""),
        };
        const { x, y } = position;
        if (size.width && size.height && size.width > 0 && size.height > 0)
          setSize(size);
        setPosition({ x, y });
      }}
    >
      <div className="w-full h-full overflow-x-clip">
        <div className="messages-header font-bold sticky top-0 cursor-move pb-1">
          Messages
        </div>
        <ul ref={containerRef} className="h-full overflow-auto">
          {messages.map(({ target, body, type }) => (
            <li>
              {body.map((line) => (
                <p className={cn(type === "stderr" && "text-red-400")}>
                  [{target}] {line}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </Rnd>
  );
}
