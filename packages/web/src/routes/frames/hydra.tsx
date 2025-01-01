import HydraCanvas from "@/components/hydra-canvas";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { useEvalHandler } from "@/hooks/use-eval-handler";
import { useSettings } from "@/hooks/use-settings";
import { HydraWrapper } from "@/lib/hydra-wrapper";
import { sendToast } from "@/lib/utils";
import { isWebglSupported } from "@/lib/webgl-detector";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultDisplaySettings } from "@/lib/display-settings";

declare global {
  interface Window {
    m: number; // meter value from Mercury
  }
}

export function Component() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl = useMemo(() => isWebglSupported(), []);
  const [instance, setInstance] = useState<HydraWrapper | null>(null);
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);

  useEffect(() => {
    if (hasWebGl) return;
    sendToast(
      "warning",
      "WebGL not available",
      "WebGL is disabled or not supported, so Hydra was not initialized"
    );
  }, [hasWebGl]);

  useEffect(() => {
    if (!hasWebGl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      const hydra = new HydraWrapper({
        canvas,
        onError: (err) => {
          sendToast("destructive", "Hydra error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "Hydra warning", msg);
        },
        displaySettings: displaySettings,
      });

      await hydra.initialize();
      setInstance(hydra);

      window.parent.hydra = window;
    })();
  }, []);

  // Update global value `m` for Mercury RMS meter (see src/routes/frames/mercury-web.tsx)
  useAnimationFrame(
    useCallback(() => {
      window.m = window.parent?.mercury?.m;
      window.strudel = window.parent?.strudel?.strudel;
    }, [])
  );

  useEffect(() => {
    instance?.setDisplaySettings(displaySettings);
  }, [displaySettings]);

  useEvalHandler(
    useCallback(
      (msg) => {
        if (!instance) return;
        instance.tryEval(msg.body);
      },
      [instance]
    )
  );

  useSettings(
    useCallback(
      (msg) => {
        if (!instance) return;
        if (msg.displaySettings) {
          setDisplaySettings(msg.displaySettings);
        }
      },
      [instance]
    )
  );

  return hasWebGl && canvasRef && <HydraCanvas ref={canvasRef} fullscreen displaySettings={displaySettings} />;
}
