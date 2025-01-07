import React from "react";
import { cn } from "@/lib/utils";
import { DisplaySettings } from "@/lib/display-settings";

interface HydraCanvasProps {
  fullscreen?: boolean;
  displaySettings: DisplaySettings;
  ref: React.RefObject<HTMLCanvasElement>;
}

const HydraCanvas = ({
  fullscreen,
  displaySettings,
  ref,
}: HydraCanvasProps) => (
  <canvas
    ref={ref}
    className={cn(
      "absolute top-0 left-0",
      fullscreen && "h-full w-full block overflow-hidden",
    )}
    style={{
      imageRendering: "pixelated",
      display: displaySettings.showCanvas ? "" : "none",
    }}
    width={window.innerWidth / displaySettings.canvasPixelSize}
    height={window.innerHeight / displaySettings.canvasPixelSize}
  />
);

export default React.memo(HydraCanvas);
