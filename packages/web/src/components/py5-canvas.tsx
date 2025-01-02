import React from "react";
import { cn } from "@/lib/utils";
import { DisplaySettings } from "@/lib/display-settings";

interface Py5CanvasProps {
  fullscreen?: boolean;
  displaySettings: DisplaySettings;
  ref: React.RefObject<HTMLCanvasElement>;
}

const Py5Canvas = ({
  fullscreen,
  displaySettings,
  ref,
}: Py5CanvasProps) => (
  <canvas
    ref={ref}
    className={cn(
      "absolute top-0 left-0",
      fullscreen && "h-full w-full block overflow-hidden"
    )}
    style={{
      imageRendering: "pixelated",
      display: displaySettings.showCanvas ? "" : "none",
    }}
    width={window.innerWidth / displaySettings.canvasPixelSize}
    height={window.innerHeight / displaySettings.canvasPixelSize}
  />
);

export default React.memo(Py5Canvas);
