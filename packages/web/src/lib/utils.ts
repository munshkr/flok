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
  return `Anonymous-${Math.floor(Math.random() * 100000)}`;
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
