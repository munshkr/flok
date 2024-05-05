import { codeMirrorThemes } from "./themes"

type Themes = {
  [key: string]: any
}

export const themes: Themes = {
  "dracula": codeMirrorThemes.dracula,
  "monokai": codeMirrorThemes.monokai,
  "gruvbox": codeMirrorThemes.gruvbox,
  "ayuDark": codeMirrorThemes.ayuDark,
  "tokyo Night": codeMirrorThemes.tokyonight,
  "nord": codeMirrorThemes.nord,
}