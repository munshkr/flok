import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomSessionName() {
  const uuid = uuidv4();
  const namePrefix = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
  });
  return `${namePrefix}-${uuid.slice(0, 8)}`;
}

export function generateRandomUserName() {
  return uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: "-",
  });
}

export const store = {
  get: (key: string, defaultValue?: any): any | null => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return defaultValue;
      }
    }
    return defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function unicodeToBase64(text: string) {
  const utf8Bytes = new TextEncoder().encode(text);
  const base64String = btoa(String.fromCharCode(...utf8Bytes));
  return base64String;
}

export function base64ToUnicode(base64String: string) {
  const utf8Bytes = new Uint8Array(
    atob(base64String)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const decodedText = decoder.decode(utf8Bytes);
  return decodedText;
}

export function code2hash(code: string) {
  return encodeURIComponent(unicodeToBase64(code));
}

export function hash2code(hash: string) {
  return base64ToUnicode(decodeURIComponent(hash));
}

export function sendToast(
  variant: "warning" | "destructive",
  title: string,
  message: string,
  pre?: boolean
) {
  window.parent.postMessage(
    {
      type: "toast",
      body: {
        variant,
        title,
        message,
        pre,
      },
    },
    "*"
  );
}
