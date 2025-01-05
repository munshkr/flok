import React from "react";
import { cn } from "@/lib/utils";
import { DisplaySettings } from "@/lib/display-settings";

interface PunctualCanvasProps {
  fullscreen?: boolean;
  displaySettings: DisplaySettings;
  ref: React.RefObject<HTMLCanvasElement>;
}

const PunctualCanvas = ({
  fullscreen,
  displaySettings,
  ref,
}: PunctualCanvasProps) => (
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

export default React.memo(PunctualCanvas);
