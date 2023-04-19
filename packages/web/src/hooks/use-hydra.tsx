import { useWebTarget } from "@/hooks/use-web-target";
import { HydraWrapper } from "@/lib/hydra-wrapper";
import type { Session } from "@flok-editor/session";
import { useRef } from "react";

export function useHydra(
  session: Session | null,
  onError?: (err: unknown) => void,
  onWarning?: (msg: string) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const webTarget = useWebTarget<HydraWrapper>(
    "hydra",
    session,
    async () => {
      console.log("Create HydraWrapper");

      const hydra = new HydraWrapper({
        canvas: canvasRef.current!,
        onError,
        onWarning,
      });

      hydra.initialize();

      return hydra;
    },
    {
      deps: [canvasRef],
      loadIf: ([canvasRef]) => canvasRef.current,
      onEval: (instance, { body }) => {
        instance.tryEval(body);
      },
      onError,
    }
  );

  return { ...webTarget, canvasRef };
}
