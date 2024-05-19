import { ayuDark } from "./ayu-dark";
import { dracula } from "./dracula";
import { gruvboxDark } from "./gruvbox-dark";
import { monokai } from "./monokai-dimmed";
import { nord } from "./nord";
import { tokyoNight } from "./tokyo-night";

type Themes = {
  [key: string]: any;
};

export const themes: Themes = {
  ayuDark,
  dracula,
  gruvboxDark,
  monokai,
  nord,
  tokyoNight,
};

export default themes;
