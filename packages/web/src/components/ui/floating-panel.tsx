import { cn, store } from "@/lib/utils";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";

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

interface FloatingPanelProps extends PropsWithChildren {
  className?: string;
  id: string;
  header?: string;
  defaultSize?: Size;
  defaultPosition?: Position;
}

export function FloatingPanel({
  children,
  className,
  id,
  header,
  defaultSize = {
    width: 0.4,
    height: 0.4,
  },
  defaultPosition = {
    x: 0.55,
    y: 0.55,
  },
}: FloatingPanelProps) {
  const [resizeTriggered, setResizeTriggered] = useState(false);

  const headerClassName = useMemo(() => `${id}-header`, [id]);
  const sizeSettingId = useMemo(() => `panel:${id}:size`, [id]);
  const posSettingId = useMemo(() => `panel:${id}:position`, [id]);

  // Size and position are relative to window.innerWidth and window.innerHeight
  const [size, setSize] = useState<Size>(store.get(sizeSettingId, defaultSize));
  const [position, setPosition] = useState<Position>(
    store.get(posSettingId, defaultPosition)
  );

  // Save position and size
  useEffect(() => store.set(sizeSettingId, size), [size]);
  useEffect(() => store.set(posSettingId, position), [position]);

  // Resize trigger event
  useEffect(() => {
    const resizeHandler = () => setResizeTriggered((r) => !r);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

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

  return (
    <Rnd
      className={cn(
        "overflow-hidden rounded-md pl-1 pr-1 pb-2 border border-gray-800 shadow-lg shadow-black/50 text-slate-50 font-mono text-xs bg-black bg-opacity-70 z-10",
        className
      )}
      size={absSize}
      position={absPosition}
      dragHandleClassName={headerClassName}
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
        <div
          className={cn(
            headerClassName,
            "font-bold sticky top-0 cursor-move pb-1"
          )}
        >
          {header}
        </div>
        {children}
      </div>
    </Rnd>
  );
}
