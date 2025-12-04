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
    minify: "esbuild",
    target: "es2020",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          "react-vendor": ["react", "react-dom"],
          // Document processing libraries (large)
          "mammoth-vendor": ["mammoth"],
          "docx-vendor": ["docx"],
          // DOMPurify for sanitization
          purify: ["dompurify"],
          // Analysis engine
          "analysis-engine": ["./src/components/AnalysisEngine.ts"],
          // Fiction analysis libraries
          "fiction-libs": [
            "./src/data/genreRegistry.ts",
            "./src/utils/fictionElementsAnalyzer.ts",
          ],
          // Visualization components
          visualization: ["./src/components/VisualizationComponents.tsx"],
          // Export utilities
          docxExport: ["./src/utils/docxExport.ts"],
          // Heavy modals - lazy loaded
          HelpModal: ["./src/components/HelpModal.tsx"],
          QuickStartModal: ["./src/components/QuickStartModal.tsx"],
          ReferenceLibraryModal: ["./src/components/ReferenceLibraryModal.tsx"],
          WritersReferenceModal: ["./src/components/WritersReferenceModal.tsx"],
          // Advanced tools panel components
          "advanced-tools": [
            "./src/components/AdvancedToolsPanel.tsx",
            "./src/components/AIWritingAssistant.tsx",
            "./src/components/DialogueEnhancer.tsx",
            "./src/components/ReadabilityAnalyzer.tsx",
            "./src/components/ClicheDetector.tsx",
            "./src/components/BeatSheetGenerator.tsx",
            "./src/components/POVChecker.tsx",
            "./src/components/EmotionTracker.tsx",
            "./src/components/MotifTracker.tsx",
            "./src/components/PoetryMeterAnalyzer.tsx",
          ],
          // Editor components
          "editor-core": [
            "./src/components/CustomEditor.tsx",
            "./src/components/DocumentEditor.tsx",
          ],
          // Chapter checker
          "chapter-checker": ["./src/components/ChapterCheckerV2.tsx"],
          // Document upload/processing
          "document-processing": ["./src/components/DocumentUploader.tsx"],
          // Character and world building
          "world-building": [
            "./src/components/CharacterNameGenerator.tsx",
            "./src/components/WorldBuildingNotebook.tsx",
            "./src/components/ImageMoodBoard.tsx",
          ],
          // Academic tools
          "academic-tools": [
            "./src/components/AcademicCitationManager.tsx",
            "./src/components/NonFictionOutlineGenerator.tsx",
          ],
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
