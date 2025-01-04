import Py5Canvas from "@/components/py5-canvas";

import { useEvalHandler } from "@/hooks/use-eval-handler";
import { useSettings } from "@/hooks/use-settings";
import { Py5Wrapper } from "@/lib/py5-wrapper";
import { sendToast } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { defaultDisplaySettings } from "@/lib/display-settings";

export function Component() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [instance, setInstance] = useState<Py5Wrapper | null>(null);
  const [displaySettings, setDisplaySettings] = useState(
    defaultDisplaySettings,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      const py5 = new Py5Wrapper({
        canvas,
        onError: (err) => {
          sendToast("destructive", "Py5 error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "Py5 warning", msg);
        },
      });

      await py5.initialize();
      setInstance(py5);
    })();
  }, []);

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
    canvasRef && (
      <Py5Canvas ref={canvasRef} fullscreen displaySettings={displaySettings} />
    )
  );
}
