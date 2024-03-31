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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("@strudel/")) {
            return "strudel";
          } else if (id.includes("mercury-engine")) {
            return "mercury";
          } else if (id.includes("hydra-synth")) {
            return "hydra";
          } else if (id.includes("p5")) {
            return "p5";
          } else if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
