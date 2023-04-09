import { HydraWrapper } from "@/lib/hydra-wrapper";
import type { EvalMessage, Session } from "@flok-editor/session";
import { useEffect, useState, useRef, useMemo } from "react";
import { isWebglSupported } from "@/lib/webgl-detector";

export function useHydra(
  session: Session | null,
  onError: (err: unknown) => void,
  onWarning: (msg: string) => void
) {
  const [instance, setInstance] = useState<HydraWrapper | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl = useMemo(() => isWebglSupported(), []);

  // Load and initialize external library
  useEffect(() => {
    if (!session || instance || !hasWebGl || !canvasRef.current) return;

    let abort = false;

    const load = async () => {
      console.log("Create HydraWrapper");

      const hydra = new HydraWrapper({
        canvas: canvasRef.current!,
        onError,
        onWarning,
      });

      if (!abort) setInstance(hydra);
    };

    load().catch((err) => onError(err));

    return () => {
      abort = true;
    };
  }, [session, instance, canvasRef, hasWebGl]);

  // Handle eval messages
  useEffect(() => {
    if (!session || !instance) return;

    const evalHandler = ({ body }: EvalMessage) => {
      console.log("eval hydra", body);
      instance.tryEval(body);
    };

    session.on("eval:hydra", evalHandler);
    return () => {
      session.off("eval:hydra", evalHandler);
    };
  }, [session, instance]);

  return { instance, canvasRef };
}
