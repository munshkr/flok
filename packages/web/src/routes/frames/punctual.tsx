import { useEvalHandler } from "@/hooks/use-eval-handler";
import { useSettings } from "@/hooks/use-settings";
import { sendToast } from "@/lib/utils";
import { isWebglSupported } from "@/lib/webgl-detector";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultDisplaySettings } from "@/lib/display-settings";
import { PunctualWrapper } from "@/lib/punctual-wrapper";
import PunctualCanvas from "@/components/punctual-canvas";

declare global {
  interface Window {
    m: number; // meter value from Mercury
  }
}

export function Component() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl = useMemo(() => isWebglSupported(), []);
  const [instance, setInstance] = useState<PunctualWrapper | null>(null);
  const [displaySettings, setDisplaySettings] = useState(
    defaultDisplaySettings,
  );

  useEffect(() => {
    if (hasWebGl) return;
    sendToast(
      "warning",
      "WebGL not available",
      "WebGL is disabled or not supported, so Hydra was not initialized",
    );
  }, [hasWebGl]);

  useEffect(() => {
    if (!hasWebGl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      const punctual = new PunctualWrapper({
        canvas,
        onError: (err) => {
          sendToast("destructive", "Punctual error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "Punctual warning", msg);
        },
        displaySettings: displaySettings,
      });

      await punctual.initialize();
      setInstance(punctual);

      window.parent.punctual = window;
    })();

    return () => {
      instance?.dispose();
    };
  }, []);

  useEffect(() => {
    instance?.setDisplaySettings(displaySettings);
  }, [displaySettings]);

  useEvalHandler(
    useCallback(
      (msg) => {
        if (!instance) return;
        instance.tryEval(msg.body);
      },
      [instance],
    ),
  );

  useSettings(
    useCallback(
      (msg) => {
        if (!instance) return;
        if (msg.displaySettings) {
          setDisplaySettings(msg.displaySettings);
        }
      },
      [instance],
    ),
  );

  return (
    hasWebGl &&
    canvasRef && (
      <PunctualCanvas
        ref={canvasRef}
        fullscreen
        displaySettings={displaySettings}
      />
    )
  );
}
