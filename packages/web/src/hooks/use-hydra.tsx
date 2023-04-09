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

      return new HydraWrapper({
        canvas: canvasRef.current!,
        onError,
        onWarning,
      });
    },
    {
      deps: [canvasRef],
      loadIf: ([canvasRef]) => canvasRef.current,
      onEval: (instance, { body }) => {
        console.log("eval hydra");
        instance.tryEval(body);
      },
      onError,
    }
  );

  return { ...webTarget, canvasRef };
}
