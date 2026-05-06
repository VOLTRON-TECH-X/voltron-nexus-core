// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig as defineViteConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const build = {
  chunkSizeWarningLimit: 1500,
};

const isVercel = process.env.VERCEL === "1";

export default isVercel
  ? defineViteConfig({
      plugins: [tailwindcss(), tsConfigPaths({ projects: ["./tsconfig.json"] }), tanstackStart(), nitro({ preset: "vercel" }), viteReact()],
      build,
    })
  : defineLovableConfig({
  vite: {
    build,
  },
});
