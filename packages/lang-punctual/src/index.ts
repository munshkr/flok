import { StreamLanguage } from "@codemirror/language";
import { punctualLanguage } from "./punctual";
import { indentation } from "./indentation";

export function punctual() {
  return [indentation(), StreamLanguage.define(punctualLanguage)];
}
