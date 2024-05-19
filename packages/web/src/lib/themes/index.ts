import { Extension } from "@codemirror/state";
import { ayuDark } from "./ayu-dark";
import { dracula } from "./dracula";
import { gruvboxDark } from "./gruvbox-dark";
import { monokai } from "./monokai-dimmed";
import { nord } from "./nord";
import { tokyoNight } from "./tokyo-night";

interface Theme {
  name: string;
  ext: Extension;
}

export const themes: { [key: string]: Theme } = {
  ayuDark: { name: "Ayu Dark", ext: ayuDark },
  dracula: { name: "Dracula", ext: dracula },
  gruvboxDark: { name: "Gruvbox Dark", ext: gruvboxDark },
  monokai: { name: "Monokai Dimmed", ext: monokai },
  nord: { name: "Nord", ext: nord },
  tokyoNight: { name: "Tokyo Night", ext: tokyoNight },
};

export default themes;
