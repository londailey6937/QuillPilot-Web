import { useState, useRef } from "react";
import mammoth from "mammoth";
import { ChapterAnalysis } from "@/types";
// import { AnalysisEngine } from "./AnalysisEngine"; // Removed unused import
import TextAreaInput from "./TextAreaInput";
import FileUploadButton from "./FileUploadButton";
import AnalyzeButton from "./AnalyzeButton";
import WordCounter from "./WordCounter";
import InfoCard from "./InfoCard";
import ErrorAlert from "./ErrorAlert";

// Export new auth components
export { AuthModal } from "./AuthModal";
export { UserMenu } from "./UserMenu";

/**
 * Props interface for ChapterInput component
 */
interface ChapterInputProps {
  /** Callback fired when analysis starts */
  onAnalysisStart: () => void;
  /** Callback fired when analysis completes with results */
  onAnalysisComplete: (analysis: ChapterAnalysis) => void;
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * ChapterInput Component
 *
 * Manages chapter text input, file upload, validation, and analysis initiation.
 * Provides user interface for inputting chapter content and triggering analysis.
 *
 * Parent: App
 * Children: TextAreaInput, FileUploadButton, AnalyzeButton, WordCounter, InfoCard, ErrorAlert
 *
 * @param {ChapterInputProps} props - Component props from parent
 * @returns {JSX.Element} Input form and information cards
 */
function ChapterInput({
  onAnalysisStart,
  onAnalysisComplete,
  isLoading,
}: ChapterInputProps): JSX.Element {
  // State management
  const [chapterText, setChapterText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates chapter text before analysis
   * Checks for minimum word count and content validity
   *
   * @returns {boolean} True if text is valid, false otherwise
   */
  const validateChapter = (): boolean => {
    if (!chapterText.trim()) {
      setError("Please enter chapter text to analyze");
      return false;
    }

    const wordCount = chapterText.trim().split(/\s+/).length;
    if (wordCount < 200) {
      setError(
        `Chapter should be at least 200 words (currently ${wordCount} words)`
      );
      return false;
    }

    setError(null);
    return true;
  };

  /**
   * Handles chapter analysis process
   * Validates input, shows progress, performs analysis, and calls completion callback
   */
  const handleAnalyze = async (): Promise<void> => {
    if (!validateChapter()) return;

    onAnalysisStart();
    setProgress("Analyzing chapter...");

    try {
      setProgress("Parsing content...");
      // Simulate API call delay for demonstration
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress("Extracting concepts...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress("Evaluating learning principles...");
      // In production, call actual analysis engine
      const mockAnalysis: ChapterAnalysis = {
        chapterId: `chapter-${Date.now()}`,
        timestamp: new Date(),
        overallScore: 72,
        principles: [],
        conceptAnalysis: {
          totalConceptsIdentified: 28,
          coreConceptCount: 8,
          conceptDensity: 3.5,
          novelConceptsPerSection: [3, 2, 4, 2],
          reviewPatterns: [],
          hierarchyBalance: 0.85,
          orphanConcepts: [],
        },
        structureAnalysis: {
          sectionCount: 4,
          avgSectionLength: 750,
          sectionLengthVariance: 0.35,
          pacing: "moderate",
          scaffolding: {
            hasIntroduction: true,
            hasProgression: true,
            hasSummary: true,
            hasReview: true,
            scaffoldingScore: 0.95,
          },
          transitionQuality: 0.8,
          conceptualization: "moderate",
        },
        recommendations: [],
        visualizations: {
          conceptMap: { nodes: [], links: [], clusters: [] },
          cognitiveLoadCurve: [],
          interleavingPattern: {
            conceptSequence: [],
            blockingSegments: [],
            blockingRatio: 0.4,
            topicSwitches: 8,
            avgBlockSize: 2,
            recommendation: "Good topic mixing detected",
          },
          reviewSchedule: {
            concepts: [],
            optimalSpacing: 0,
            currentAvgSpacing: 0,
          },
          principleScores: {
            principles: [],
            overallWeightedScore: 72,
            strongestPrinciples: [],
            weakestPrinciples: [],
          },
        },
        conceptGraph: {
          concepts: [],
          relationships: [],
          hierarchy: { core: [], supporting: [], detail: [] },
          sequence: [],
        },
      };

      setProgress("");
      onAnalysisComplete(mockAnalysis);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Analysis failed";
      setError(errorMessage);
      setProgress("");
    }
  };

  /**
   * Handles file upload from user's file system
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - File input change event
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    try {
      let extractedText = "";

      if (extension === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        extractedText = textResult.value;
      } else if (extension === "obt") {
        extractedText = await file.text();
      } else {
        setError("Please upload a .docx or .obt file");
        return;
      }

      if (!extractedText.trim()) {
        setError("Uploaded file does not contain readable text.");
        return;
      }

      setChapterText(extractedText);
      setError(null);
    } catch (readError) {
      console.error("File upload failed:", readError);
      setError("Failed to read file. Please try again.");
    } finally {
      event.target.value = "";
    }
  };

  /**
   * Clears all input and state
   */
  const handleClear = (): void => {
    setChapterText("");
    setError(null);
    setProgress("");
  };

  const wordCount = chapterText.trim().split(/\s+/).length;
  const isDisabled = isLoading || !chapterText.trim();

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Paste or Upload Your Chapter</h2>
            <div className="flex gap-2">
              <FileUploadButton
                onUpload={handleFileUpload}
                isDisabled={isLoading}
                fileInputRef={fileInputRef}
              />
              {chapterText && (
                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="btn-secondary"
                >
                  🗑️ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body space-y-4">
          {/* Error Alert */}
          {error && (
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          )}

          {/* Text Area Input */}
          <TextAreaInput
            value={chapterText}
            onChange={(value) => {
              setChapterText(value);
              setError(null);
            }}
            placeholder="Paste your chapter text here... (minimum 200 words)"
            disabled={isLoading}
          />

          {/* Word Counter */}
          <WordCounter count={wordCount} />

          {/* Analyze Button */}
          <AnalyzeButton
            onClick={handleAnalyze}
            disabled={isDisabled}
            isLoading={isLoading}
            progress={progress}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="🎓 What This Analyzes"
          items={[
            "Deep Processing & Elaboration",
            "Spaced Repetition",
            "Retrieval Practice",
            "Interleaving",
            "Dual Coding",
            "Generative Learning",
            "Metacognition",
            "Schema Building",
            "Cognitive Load",
            "Emotion & Relevance",
          ]}
        />

        <InfoCard
          title="📊 You'll Get"
          items={[
            "Overall pedagogical score",
            "Analysis of 10 principles",
            "Concept extraction",
            "Cognitive load analysis",
            "Interleaving patterns",
            "Prioritized recommendations",
            "Interactive visualizations",
            "Detailed evidence",
            "Export functionality",
          ]}
        />

        <InfoCard
          title="💡 Tips for Better Results"
          items={[
            "Include complete chapters",
            "Use clear section headings",
            "Include exercises/questions",
            "Use consistent formatting",
            "Minimum 200 words",
            "Optimal: 1000-5000 words",
            "Ensure proper structure",
            "Clear progression",
          ]}
        />
      </div>
    </div>
  );
}

export default ChapterInput;
export { HelpModal } from "./HelpModal";
export { ReferenceLibraryModal } from "./ReferenceLibraryModal";
export { NavigationMenu } from "./NavigationMenu";
export { WriterMode } from "./WriterMode";
export { AnimatedLogo } from "./AnimatedLogo";
