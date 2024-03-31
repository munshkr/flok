import HydraCanvas from "@/components/hydra-canvas";
import { HydraWrapper } from "@/lib/hydra-wrapper";
import { isWebglSupported } from "@/lib/webgl-detector";
import { useMemo, useRef, useEffect, useState } from "react";

function toast(
  variant: "warning" | "destructive",
  title: string,
  message: string
) {
  window.parent.postMessage(
    {
      type: "toast",
      body: {
        variant,
        title,
        message,
      },
    },
    "*"
  );
}

export default function HydraFrame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl = useMemo(() => isWebglSupported(), []);
  const [instance, setInstance] = useState<HydraWrapper | null>(null);

  useEffect(() => {
    if (hasWebGl) return;
    toast(
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
          toast("destructive", "Hydra error", err.toString());
        },
        onWarning: (msg) => {
          toast("warning", "Hydra warning", msg);
        },
      });

      await hydra.initialize();
      setInstance(hydra);
    })();
  }, []);

  // Handle eval messages
  useEffect(() => {
    if (!instance) return;

    const handleEval = (event: MessageEvent) => {
      if (event.data.type === "eval") {
        const { body } = event.data;
        instance.tryEval(body);
      }
    };

    window.addEventListener("message", handleEval);

    return () => {
      window.removeEventListener("message", handleEval);
    };
  }, [instance]);

  return (
    <>{hasWebGl && canvasRef && <HydraCanvas ref={canvasRef} fullscreen />}</>
  );
}
