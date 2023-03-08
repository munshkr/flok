import { defineConfig } from "vite";
import { splitVendorChunkPlugin } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), splitVendorChunkPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: [
            "codemirror",
            "@codemirror/commands",
            "@codemirror/lang-javascript",
            "@codemirror/state",
            "@codemirror/theme-one-dark",
            "@codemirror/view",
          ],
          yjs: [
            "yjs",
            "y-codemirror.next",
            "y-indexeddb",
            "y-webrtc",
            "y-websocket",
          ],
        },
      },
    },
  },
});
