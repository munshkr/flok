// Import global CSSs here...

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars.css";

export default function CustomApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}