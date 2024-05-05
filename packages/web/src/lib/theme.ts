import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

const monokai = createTheme({
  theme: 'monokai',
  settings: {
    background: 'transparent',
    backgroundImage: '',
    foreground: '#F8F8F2',
    caret: '#F92672',
    selection: '#49483E',
    selectionMatch: '#49483E',
    lineHighlight: 'rgba(73, 72, 62, 0.7)',
    gutterBorder: '1px solid #272822',
    gutterBackground: '#272822',
    gutterForeground: '#75715E',
  },
  styles: [
    { tag: t.comment, color: '#75715E' },
    { tag: t.variableName, color: '#F92672' },
    { tag: [t.string, t.special(t.brace)], color: '#E6DB74' },
    { tag: t.number, color: '#AE81FF' },
    { tag: t.bool, color: '#A6E22E' },
    { tag: t.null, color: '#A6E22E' },
    { tag: t.keyword, color: '#F92672' },
    { tag: t.operator, color: '#F92672' },
    { tag: t.className, color: '#A6E22E' },
  ],
});

const dracula = createTheme({
  theme: 'dracula',
  settings: {
    background: 'transparent',
    backgroundImage: '',
    foreground: '#F8F8F2',
    caret: '#FF79C6',
    selection: '#44475A',
    selectionMatch: '#44475A',
    lineHighlight: 'rgba(68, 71, 90, 0.7)',
    gutterBorder: '1px solid #282A36',
    gutterBackground: '#282A36',
    gutterForeground: '#6272A4',
  },
  styles: [
    { tag: t.comment, color: '#6272A4' },
    { tag: t.variableName, color: '#BD93F9' },
    { tag: [t.string, t.special(t.brace)], color: '#F1FA8C' },
    { tag: t.number, color: '#8BE9FD' },
    { tag: t.bool, color: '#FF79C6' },
    { tag: t.null, color: '#FF79C6' },
    { tag: t.keyword, color: '#FF79C6' },
    { tag: t.operator, color: '#FF79C6' },
    { tag: t.className, color: '#50FA7B' },
    { tag: t.definition(t.typeName), color: '#50FA7B' },
    { tag: t.typeName, color: '#50FA7B' },
  ],
});

const lightTest = createTheme({
  theme: 'light',
  settings: {
    background: 'transparent',
    backgroundImage: '',
    foreground: '#75baff',
    caret: '#5d00ff',
    selection: '#036dd626',
    selectionMatch: '#036dd626',
    lineHighlight: 'rgba(138, 145, 153, 0.7)',
    gutterBorder: '1px solid #ffffff10',
    gutterBackground: '#fff',
    gutterForeground: '#8a919966',
  },
  styles: [
    { tag: t.comment, color: '#787b8099' },
    { tag: t.variableName, color: '#0080ff' },
    { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
    { tag: t.number, color: '#5c6166' },
    { tag: t.bool, color: '#5c6166' },
    { tag: t.null, color: '#5c6166' },
    { tag: t.keyword, color: '#5c6166' },
    { tag: t.operator, color: '#5c6166' },
    { tag: t.className, color: '#5c6166' },
    { tag: t.definition(t.typeName), color: '#5c6166' },
    { tag: t.typeName, color: '#5c6166' },
    { tag: t.angleBracket, color: '#5c6166' },
    { tag: t.tagName, color: '#5c6166' },
    { tag: t.attributeName, color: '#5c6166' },
  ],
});

export const themes: Themes = {
  "lightTest": lightTest,
  "dracula": dracula,
  "monokai": monokai,
}

