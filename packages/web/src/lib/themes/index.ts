import { Extension } from "@codemirror/state";
import { ayuDark } from "./ayu-dark";
import { dracula } from "./dracula";
import { gruvboxDark } from "./gruvbox-dark";
import { monokai } from "./monokai-dimmed";
import { nord } from "./nord";
import { tokyoNight } from "./tokyo-night";

import { oneDark } from "./one-dark";

// some themes installed from react codemirror
// https://uiwjs.github.io/react-codemirror/#/theme/home
import { andromedaInit } from "@uiw/codemirror-theme-andromeda";
import { bespinInit } from "@uiw/codemirror-theme-bespin";
import { consoleDarkInit } from "@uiw/codemirror-theme-console";
import { xcodeDarkInit } from "@uiw/codemirror-theme-xcode";
import { solarizedDarkInit } from "@uiw/codemirror-theme-solarized";
import { monokaiInit } from "@uiw/codemirror-theme-monokai";
import { githubDarkInit } from "@uiw/codemirror-theme-github";

interface Theme {
  name: string;
  ext: Extension;
}

const noBackground = { settings: { background: "none" } };

export const themes: { [key: string]: Theme } = {
  ayuDark: { name: "Ayu Dark", ext: ayuDark },
  andromeda: { name: "Andromeda", ext: andromedaInit(noBackground) },
  bespin: { name: "Bespin", ext: bespinInit(noBackground) },
  consoleDark: { name: "Console Dark", ext: consoleDarkInit(noBackground) },
  dracula: { name: "Dracula", ext: dracula },
  githubDark: { name: "Github Dark", ext: githubDarkInit(noBackground) },
  gruvboxDark: { name: "Gruvbox Dark", ext: gruvboxDark },
  monokai: { name: "Monokai", ext: monokaiInit(noBackground) },
  monokaiDimmed: { name: "Monokai Dimmed", ext: monokai },
  nord: { name: "Nord", ext: nord },
  oneDark: { name: "One Dark", ext: oneDark },
  solarizedDark: {
    name: "Solarized Dark",
    ext: solarizedDarkInit(noBackground),
  },
  tokyoNight: { name: "Tokyo Night", ext: tokyoNight },
  xcodeDark: { name: "XCode Dark", ext: xcodeDarkInit(noBackground) },
};

export default themes;
