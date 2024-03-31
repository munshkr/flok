import { useRef, useEffect, useCallback } from "react";

export function useAnimationFrame(callback: (timestamp: number) => void) {
  const requestId = useRef<number>();

  const animate = useCallback(
    (timestamp: number) => {
      callback(timestamp);
      requestId.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    requestId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestId.current!);
    };
  }, [animate]);
}
