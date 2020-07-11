// Import global CSSs here...

import "normalize.css";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars.css";

export default function CustomApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}