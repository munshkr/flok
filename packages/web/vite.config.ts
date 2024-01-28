import react from "@vitejs/plugin-react";
import path from "path";
import Unfonts from "unplugin-fonts/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    react(),
    Unfonts({
      google: {
        families: ["Inter", "Inconsolata"],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks: {
          yjs: [
            "yjs",
            "y-websocket",
            "y-webrtc",
            // "y-protocols",
            "y-indexeddb",
            "y-codemirror.next",
          ],
          "radix-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-menubar",
            "@radix-ui/react-toast",
          ],
          codemirror: [
            "codemirror",
            "@codemirror/lang-javascript",
            "@codemirror/state",
            "@codemirror/theme-one-dark",
            "@codemirror/view",
          ],
          hydra: ["hydra-synth"],
          mercury: ["mercury-engine"],
        },
      },
    },
  },
});
