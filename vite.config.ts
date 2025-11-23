import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
});
