import { StreamLanguage } from "@codemirror/language";
import { tidalLanguage } from "./tidal";
import { indentation } from "./indentation";

export function tidal() {
  return [indentation(), StreamLanguage.define(tidalLanguage)];
}
