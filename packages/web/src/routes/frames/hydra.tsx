import HydraCanvas from "@/components/hydra-canvas";
import { useEvalHandler } from "@/hooks/use-eval-handler";
import { HydraWrapper } from "@/lib/hydra-wrapper";
import { sendToast } from "@/lib/utils";
import { isWebglSupported } from "@/lib/webgl-detector";
import { useMemo, useRef, useEffect, useState } from "react";

export default function HydraFrame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl = useMemo(() => isWebglSupported(), []);
  const [instance, setInstance] = useState<HydraWrapper | null>(null);

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
      });

      await hydra.initialize();
      setInstance(hydra);
    })();
  }, []);

  useEvalHandler(
    (msg) => {
      if (!instance) return;
      instance.tryEval(msg.body);
    },
    [instance]
  );

  return hasWebGl && canvasRef && <HydraCanvas ref={canvasRef} fullscreen />;
}
