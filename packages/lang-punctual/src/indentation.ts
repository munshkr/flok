import { indentService } from "@codemirror/language";

export function indentation() {
  return indentService.of((context, pos) => {
    let { text, from } = context.lineAt(pos, -1);
    let parse = text.slice(0, pos - from).match(/^([^$#]+)\$.*/);

    if (parse) {
      return Math.min(parse[1].length, 8);
    } else {
      return 0;
    }
  });
}
