import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Debug: Log env vars during build (check Vercel build logs)
console.log("🔍 BUILD ENV CHECK:");
console.log("  VITE_SUPABASE_URL exists:", !!process.env.VITE_SUPABASE_URL);
console.log(
  "  VITE_SUPABASE_URL starts with https:",
  process.env.VITE_SUPABASE_URL?.startsWith("https://")
);
console.log(
  "  VITE_SUPABASE_ANON_KEY exists:",
  !!process.env.VITE_SUPABASE_ANON_KEY
);
console.log(
  "  VITE_SUPABASE_ANON_KEY length:",
  process.env.VITE_SUPABASE_ANON_KEY?.length || 0
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Use esbuild default minify to avoid requiring optional terser dependency
    minify: true,
    chunkSizeWarningLimit: 1000, // Increase limit for document processing libraries
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          "react-vendor": ["react", "react-dom"],
          // Split document processing libraries separately
          "mammoth-vendor": ["mammoth"],
          "docx-vendor": ["docx"],
          // Large evaluators and analysis engine
          "analysis-engine": ["./src/components/AnalysisEngine.ts"],
          // Fiction analysis libraries
          "fiction-libs": [
            "./src/data/genreRegistry.ts",
            "./src/utils/fictionElementsAnalyzer.ts",
          ],
          // Visualization and UI components
          visualization: ["./src/components/VisualizationComponents.tsx"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
    coverage: {
      provider: "v8",
    },
  },
});
