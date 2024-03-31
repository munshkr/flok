import React from "react";
import { cn } from "@/lib/utils";

interface HydraCanvasProps {
  fullscreen?: boolean;
}

const HydraCanvas = React.forwardRef(
  (
    { fullscreen }: HydraCanvasProps,
    ref: React.ForwardedRef<HTMLCanvasElement>
  ) => (
    <canvas
      ref={ref}
      className={cn(
        "absolute top-0 left-0",
        fullscreen && "h-full w-full block overflow-hidden"
      )}
      style={{ imageRendering: "pixelated" }}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  )
);

export default React.memo(HydraCanvas);
