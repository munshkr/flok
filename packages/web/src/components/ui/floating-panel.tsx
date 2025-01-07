import { Button, ButtonProps } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, store } from "@/lib/utils";
import { ToggleProps } from "@radix-ui/react-toggle";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Rnd } from "react-rnd";

export interface FloatingPanelButtonProps extends ButtonProps {
  tooltip?: string;
}

export function FloatingPanelButton({
  children,
  tooltip,
  className,
  ...props
}: FloatingPanelButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          aria-label={tooltip}
          className={cn("h-4 mt-[1px] p-0.5 mr-1 focus:ring-0", className)}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      {tooltip && (
        <TooltipPortal>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </TooltipPortal>
      )}
    </Tooltip>
  );
}

export interface FloatingPanelToggleProps extends ToggleProps {
  tooltip?: string;
}

export function FloatingPanelToggle({
  children,
  tooltip,
  className,
  ...props
}: FloatingPanelToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Toggle
          asChild
          variant="outline"
          aria-label={tooltip}
          className={cn("h-4 p-0.5 mr-1", className)}
          {...props}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      {tooltip && (
        <TooltipPortal>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </TooltipPortal>
      )}
    </Tooltip>
  );
}

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

export interface FloatingPanelProps extends PropsWithChildren {
  className?: string;
  id: string;
  header?: string;
  headerToolbar?: ReactNode;
  defaultSize?: Size;
  defaultPosition?: Position;
}

export function FloatingPanel({
  children,
  className,
  id,
  header,
  headerToolbar,
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
    store.get(posSettingId, defaultPosition),
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
    [size, resizeTriggered],
  );

  const absPosition = useMemo(
    () => ({
      x: clamp(position.x) * innerWidth,
      y: clamp(position.y) * innerHeight,
    }),
    [position, resizeTriggered],
  );

  return (
    <Rnd
      className={cn(
        "overflow-hidden rounded-md pl-1 pr-1 pb-2 border border-gray-800 shadow-lg shadow-black/50 text-slate-50 font-mono text-xs bg-black bg-opacity-70 z-10",
        className,
      )}
      size={absSize}
      position={absPosition}
      dragHandleClassName={headerClassName}
      bounds="window"
      onDrag={(e) => e.preventDefault()}
      onDragStop={(_e, d) => {
        const { x, y } = d;
        setPosition({
          x: clamp(x / innerWidth),
          y: clamp(y / innerHeight),
        });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
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
            "font-bold sticky top-0 cursor-move pb-1",
          )}
        >
          <div className="flex flex-row">
            <span className="mr-2">{header}</span>
            <TooltipProvider delayDuration={100}>
              {headerToolbar}
            </TooltipProvider>
          </div>
        </div>
        {children}
      </div>
    </Rnd>
  );
}
