import type { EvalMessage, Session } from "@flok-editor/session";
import { useEffect, useState } from "react";
import { useQuery } from "./use-query";

export function useWebTarget<Controller>(
  target: string,
  session: Session | null,
  load: () => Promise<Controller | null>,
  {
    deps,
    loadIf,
    onEval,
    onError,
  }: {
    deps?: any[];
    loadIf?: (deps: any[]) => boolean;
    onEval?: (instance: Controller, evalMsg: EvalMessage) => void;
    onError?: (err: unknown) => void;
  },
) {
  const query = useQuery();
  const noWebEval = query.get("noWebEval")?.split(",") || [];

  // Check if we should load the target
  if (noWebEval.includes(target) || noWebEval.includes("*")) {
    return { instance: null };
  }

  const [instance, setInstance] = useState<Controller | null>(null);

  // Load and initialize external library
  useEffect(() => {
    if (!session || instance) return;
    if (loadIf && deps && !loadIf(deps)) return;

    let abort = false;

    const _load = async () => {
      const instance = await load();
      if (!abort && instance) setInstance(instance);
    };

    _load().catch((err) => onError && onError(err));

    return () => {
      abort = true;
    };
  }, [session, instance, ...(deps || [])]);

  // Handle eval messages
  useEffect(() => {
    if (!session || !instance || !onEval) return;

    const handler = (msg: EvalMessage) => onEval(instance, msg);
    session.on(`eval:${target}`, handler);

    return () => {
      session.off(`eval:${target}`, handler);
    };
  }, [session, instance, onEval]);

  return { instance };
}
