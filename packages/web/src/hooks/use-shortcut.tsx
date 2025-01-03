import { useEffect } from "react";

const modifierMethods: { [key: string]: keyof KeyboardEvent } = {
  control: "ctrlKey",
  alt: "altKey",
  meta: "metaKey",
  shift: "shiftKey",
};
const allModifiers = Object.keys(modifierMethods);

export function useShortcut(
  keyShortcuts: string[],
  handler: (e: KeyboardEvent) => void,
  deps: any[] = [],
  preventDefault: boolean = true,
) {
  keyShortcuts.forEach((keyShortcut) => {
    const parts = keyShortcut.toLowerCase().split("-");
    const modifiers = parts.filter((p) => allModifiers.includes(p));
    const keys = parts.filter((p) => !allModifiers.includes(p));

    if (keys.length > 1) {
      console.error("Shortcut", keyShortcut, "has more than one key:", keys);
      return;
    }

    if (keys.length === 0) {
      console.error("Shortcut", keyShortcut, "has no key");
      return;
    }

    const key = keys[0];

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        const modifiersActive = allModifiers.every((m) => {
          const prop = modifierMethods[m];
          return modifiers.includes(m) ? e[prop] : !e[prop];
        });
        if (e.key === key && modifiersActive) {
          if (preventDefault) e.preventDefault();
          handler(e);
        }
      };

      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, [keyShortcut, ...deps]);
  });
}
