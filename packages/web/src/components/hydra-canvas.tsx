import React from "react";
import { cn } from "@/lib/utils";
import { DisplaySettings } from "@/lib/display-settings";

interface HydraCanvasProps {
  fullscreen?: boolean;
  displaySettings: DisplaySettings;
}

const HydraCanvas = React.forwardRef(
  (
    { fullscreen, displaySettings }: HydraCanvasProps,
    ref: React.ForwardedRef<HTMLCanvasElement>
  ) => (
    <canvas
      ref={ref}
      className={cn(
        "absolute top-0 left-0",
        fullscreen && "h-full w-full block overflow-hidden"
      )}
      style={{ imageRendering: "pixelated", display: displaySettings.showCanvas ? "" : "none" }}
      width={window.innerWidth / displaySettings.canvasPixelSize}
      height={window.innerHeight / displaySettings.canvasPixelSize}
    />
  )
);

export default React.memo(HydraCanvas);
