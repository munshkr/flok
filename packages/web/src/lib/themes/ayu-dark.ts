import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

export const ayuDark = createTheme({
  theme: 'dark',
  settings: {
    background: 'transparent',
    backgroundImage: '',
    foreground: '#B3B1AD',
    caret: '#FFCC66',
    selection: '#253340',
    selectionMatch: '#253340',
    lineHighlight: 'rgba(37, 52, 64, 0.7)',
    gutterBorder: '1px solid #0A0E14',
    gutterBackground: '#0A0E14',
    gutterForeground: '#4E5561',
  },
  styles: [
    { tag: t.comment, color: '#4E5561' },
    { tag: t.variableName, color: '#FFCC66' },
    { tag: [t.string, t.special(t.brace)], color: '#BAE67E' },
    { tag: t.number, color: '#D4BFFF' },
    { tag: t.bool, color: '#FF8F40' },
    { tag: t.null, color: '#FF8F40' },
    { tag: t.keyword, color: '#FF8F40' },
    { tag: t.operator, color: '#FF8F40' },
    { tag: t.className, color: '#5CCFE6' },
    { tag: t.definition(t.typeName), color: '#5CCFE6' },
    { tag: t.typeName, color: '#5CCFE6' },
  ],
});
