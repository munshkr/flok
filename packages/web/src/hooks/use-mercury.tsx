import { useWebTarget } from "@/hooks/use-web-target";
import { MercuryWrapper } from "@/lib/mercury-wrapper";
import type { Session } from "@flok-editor/session";

export function useMercury(
  session: Session | null,
  onError?: (err: unknown) => void,
  onWarning?: (msg: string) => void
) {
  return useWebTarget<MercuryWrapper>(
    "mercury-web",
    session,
    async () => {
      console.log("Create Mercury Wrapper");

      const mercury = new MercuryWrapper({ onError, onWarning });

      return mercury;
    },
    {
      onEval: (instance, { body }) => instance.tryEval(body),
      onError,
    }
  );
}
