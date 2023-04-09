import { useWebTarget } from "@/hooks/use-web-target";
import { HydraWrapper } from "@/lib/hydra-wrapper";
import { isWebglSupported } from "@/lib/webgl-detector";
import type { Session } from "@flok-editor/session";
import { useMemo, useRef } from "react";

export function useHydra(
  session: Session | null,
  onError?: (err: unknown) => void,
  onWarning?: (msg: string) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl = useMemo(() => isWebglSupported(), []);

  const webTarget = useWebTarget<HydraWrapper>(
    session,
    "hydra",
    async () => {
      console.log("Create HydraWrapper");

      return new HydraWrapper({
        canvas: canvasRef.current!,
        onError,
        onWarning,
      });
    },
    {
      deps: [hasWebGl, canvasRef],
      loadIf: ([hasWebGl, canvasRef]) => hasWebGl && canvasRef.current,
      onEval: (instance, { body }) => {
        console.log("eval hydra");
        instance.tryEval(body);
      },
      onError,
    }
  );

  return { ...webTarget, canvasRef };
}
