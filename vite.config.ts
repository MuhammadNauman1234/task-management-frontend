import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: true, // Auto-open browser
    hmr: {
      port: 8081, // Separate port for HMR
    },
  },
  plugins: [
    react({
      // Enable fast refresh and optimizations
      tsDecorators: true,
      devTarget: "es2022",
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: "es2020",
    outDir: "dist",
    sourcemap: mode === "development",
    minify: "terser",
    rollupOptions: {
      output: {
        // Better chunk splitting
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          routing: ["react-router-dom"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          state: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          utils: ["clsx", "tailwind-merge", "date-fns", "lucide-react"],
        },
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev startup
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "redux-persist",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "date-fns",
      "lucide-react",
    ],
  },
  define: {
    // Define global constants
    __DEV__: mode === "development",
  },
}));
