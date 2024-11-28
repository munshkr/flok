import { SettingsMessage } from "@/lib/settings";
import { useEffect } from "react";

export function useSettings(callback: (message: SettingsMessage) => void) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type !== "settings") return;
      callback(event.data.body as SettingsMessage);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [callback]);

  return;
}
