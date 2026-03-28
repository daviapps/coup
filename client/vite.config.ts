import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // build: {
  //   lib: {
  //     entry: "src/main.tsx",
  //     formats: ["es"], // ES modules are best for modern Vite apps
  //     fileName: (format) => `main.${format}.js`,
  //   },
  //   rollupOptions: {
  //     // THIS IS THE KEY PART:
  //     external: ["react", "react-dom", "react/jsx-runtime"],
  //     output: {
  //       globals: {
  //         react: "React",
  //         "react-dom": "ReactDOM",
  //         "react/jsx-runtime": "jsxRuntime",
  //       },
  //     },
  //   },
  // },
});
