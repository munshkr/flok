import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

type FlashRange = [number, number];

export const setFlash = StateEffect.define<FlashRange | null>();

const defaultStyle = {
  "background-color": "#FFCA2880",
};

const styleObjectToString = (styleObj: object): string =>
  Object.entries(styleObj)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

export const flash = (
  view: EditorView,
  from: number | null,
  to: number | null,
  timeout: number = 150,
) => {
  if (from === null || to === null) return;
  view.dispatch({ effects: setFlash.of([from, to]) });
  setTimeout(() => {
    view.dispatch({ effects: setFlash.of(null) });
  }, timeout);
};

export const flashField = (style: object = defaultStyle) =>
  StateField.define({
    create() {
      return Decoration.none;
    },
    update(flash, tr) {
      try {
        for (let e of tr.effects) {
          if (e.is(setFlash)) {
            if (e.value) {
              const [from, to] = e.value;
              const mark = Decoration.mark({
                attributes: { style: styleObjectToString(style) },
              });
              flash = Decoration.set([mark.range(from, to)]);
            } else {
              flash = Decoration.set([]);
            }
          }
        }
        return flash;
      } catch (err) {
        console.warn("flash error", err);
        return flash;
      }
    },
    provide: (f) => EditorView.decorations.from(f),
  });

export default flashField;
