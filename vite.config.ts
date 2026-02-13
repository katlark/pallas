import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// const port = Math.floor(Math.random() * 9999);

export default defineConfig({
  // server: { port },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
