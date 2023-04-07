import { indentService } from "@codemirror/language";

export function indentation() {
  return indentService.of((context, pos) => {
    if (context.lineIndent(pos, -1)) {
      return;
    }

    let { text, from } = context.lineAt(pos, -1);
    let parse = text.slice(0, pos - from).match(/^([^$#]+)\$.*/);

    if (parse) {
      return Math.min(parse[1].length, 8);
    } else {
      return null;
    }
  });
}
