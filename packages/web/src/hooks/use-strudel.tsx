import { useState, useEffect } from "react";
import { StrudelWrapper } from "@/lib/strudel-wrapper";
import type { EvalMessage, Session } from "@flok-editor/session";

export function useStrudel(
  session: Session | null,
  onError?: (err: unknown) => void
) {
  const [instance, setInstance] = useState<StrudelWrapper | null>(null);

  // Load and initialize external library
  useEffect(() => {
    if (!session || instance) return;

    let abort = false;

    const load = async () => {
      console.log("Create StrudelWrapper");
      const strudel = new StrudelWrapper({ onError });

      console.log("Import Strudel modules");
      await strudel.importModules();

      if (!abort) setInstance(strudel);
    };

    load().catch((err) => onError && onError(err));

    return () => {
      abort = true;
    };
  }, [session, instance]);

  // Handle eval messages
  useEffect(() => {
    if (!session || !instance) return;

    const evalHandler = ({ body }: EvalMessage) => {
      console.log("eval strudel", body);
      instance.tryEval(body);
    };

    session.on("eval:strudel", evalHandler);
    return () => {
      session.off("eval:strudel", evalHandler);
    };
  }, [session, instance]);

  return { instance };
}
