import React, { useState, useRef, useEffect } from "react";
import type { ChapterAnalysis } from "@/types";
import { exportToHtml } from "@/utils/htmlExport";

interface WriterModeProps {
  extractedText: string;
  analysisResult: ChapterAnalysis | null;
  onTextChange?: (newText: string) => void;
  fileName?: string;
}

export const WriterMode: React.FC<WriterModeProps> = ({
  extractedText,
  analysisResult,
  onTextChange,
  fileName,
}) => {
  const [editableText, setEditableText] = useState(extractedText);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompactView, setIsCompactView] = useState(false);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<string>("");
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Responsive layout detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsCompactView(width < 1024); // Tablet and below
      // Auto-collapse sidebar on smaller screens
      if (width < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update editable text when source changes
  useEffect(() => {
    setEditableText(extractedText);
  }, [extractedText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditableText(newText);
    onTextChange?.(newText);
  };

  // Get recommendations from analysis
  const recommendations = analysisResult?.recommendations || [];
  const concepts = analysisResult?.conceptGraph?.concepts || [];
  const principleScores = analysisResult?.principles || [];

  // Debug logging
  // Analysis data loaded

  // Helper to highlight text issues based on principles
  const getTextIssues = () => {
    const issues: Array<{
      type: string;
      message: string;
      category: string;
      priority: "high" | "medium" | "low";
    }> = [];

    // Add recommendations as suggestions
    recommendations.forEach((rec) => {
      issues.push({
        type: "recommendation",
        message: rec.description,
        category: rec.category,
        priority: rec.priority,
      });
    });

    return issues;
  };

  const textIssues = getTextIssues();

  // Generate AI-driven template based on analysis issues
  const generateAITemplate = () => {
    setIsGeneratingTemplate(true);

    try {
      const spacingPrinciple = principleScores.find((p) =>
        p.principle.toLowerCase().includes("spacing")
      );
      const dualCodingPrinciple = principleScores.find(
        (p) =>
          p.principle.toLowerCase().includes("dual") ||
          p.principle.toLowerCase().includes("coding")
      );

      const hasSpacingIssues = spacingPrinciple && spacingPrinciple.score < 70;
      const hasDualCodingIssues =
        dualCodingPrinciple && dualCodingPrinciple.score < 70;

      let template = `# ENHANCED CHAPTER TEMPLATE\n# Generated based on analysis results\n\n`;

      // Add intro section
      template += `## SECTION 1: INTRODUCTION\n`;
      template += `[WRITER: Introduce the main topic. Mention 2-3 key concepts that will be covered.]\n\n`;
      template += `Key Concepts to Introduce:\n`;
      concepts.slice(0, 3).forEach((c) => {
        template += `- ${c.name}: [BRIEF DEFINITION]\n`;
      });
      template += `\n---\n\n`;

      // Add concept development sections
      const coreConceptsToAddress = concepts
        .filter((c) => c.importance === "core")
        .slice(0, 3);
      coreConceptsToAddress.forEach((concept, idx) => {
        template += `## SECTION ${idx + 2}: ${concept.name.toUpperCase()}\n\n`;

        if (hasDualCodingIssues) {
          template += `### Visual Element Needed\n`;
          template += `[WRITER: Add a diagram, chart, or visual representation of "${concept.name}"]\n`;
          template += `[CLAUDE: Suggest what type of visual would work best - flowchart, diagram, table, etc.]\n\n`;
        }

        template += `### Explanation\n`;
        template += `[WRITER: Explain "${concept.name}" in clear, concrete terms]\n\n`;
        template += `[CLAUDE: Provide 2-3 real-world examples that illustrate "${concept.name}"]\n\n`;

        if (hasSpacingIssues) {
          template += `### Quick Review\n`;
          template += `[WRITER: Add a brief review question or summary statement about "${concept.name}"]\n\n`;
        }

        template += `---\n\n`;
      });

      // Add spacing/reinforcement section
      if (hasSpacingIssues) {
        template += `## SECTION ${
          coreConceptsToAddress.length + 2
        }: CONCEPT CONNECTIONS\n\n`;
        template += `[WRITER: Connect the concepts introduced earlier. Show how they relate.]\n\n`;
        template += `Concepts to Reinforce:\n`;
        concepts.slice(0, 5).forEach((c) => {
          template += `- ${c.name}: [MENTION IN NEW CONTEXT]\n`;
        });
        template += `\n---\n\n`;
      }

      // Add application section
      template += `## SECTION ${
        hasSpacingIssues
          ? coreConceptsToAddress.length + 3
          : coreConceptsToAddress.length + 2
      }: PRACTICAL APPLICATION\n\n`;
      template += `[WRITER: Provide a real-world scenario or problem that uses these concepts]\n\n`;
      template += `[CLAUDE: Generate a worked example showing how to apply the concepts]\n\n`;

      if (hasDualCodingIssues) {
        template += `[VISUAL: Add a step-by-step diagram or process flow]\n\n`;
      }

      template += `---\n\n`;

      // Add summary with spaced retrieval
      template += `## FINAL SECTION: SUMMARY & RETRIEVAL PRACTICE\n\n`;
      template += `### Key Takeaways\n`;
      concepts.slice(0, 5).forEach((c) => {
        template += `- ${c.name}: [ONE-SENTENCE SUMMARY]\n`;
      });
      template += `\n`;

      template += `### Self-Check Questions\n`;
      template += `[WRITER: Create 3-5 questions that require recalling the key concepts]\n\n`;
      template += `1. [QUESTION ABOUT CORE CONCEPT]\n`;
      template += `2. [QUESTION CONNECTING TWO CONCEPTS]\n`;
      template += `3. [APPLICATION QUESTION]\n\n`;

      // Add analysis summary
      template += `\n---\n\n`;
      template += `## ANALYSIS INSIGHTS\n\n`;
      if (hasSpacingIssues) {
        template += `⚠️ **Spacing Issue Detected**: Score ${Math.round(
          spacingPrinciple?.score || 0
        )}/100\n`;
        template += `   Action: Revisit key concepts multiple times at increasing intervals\n\n`;
      }
      if (hasDualCodingIssues) {
        template += `⚠️ **Dual Coding Issue Detected**: Score ${Math.round(
          dualCodingPrinciple?.score || 0
        )}/100\n`;
        template += `   Action: Add visual elements (diagrams, charts, tables) for complex concepts\n\n`;
      }

      template += `\n---\n\n`;
      template += `## NEXT STEPS\n\n`;
      template += `1. Fill in the [WRITER] sections with your content\n`;
      template += `2. Use Claude API to generate content for [CLAUDE] sections (if connected)\n`;
      template += `3. Add visual elements where marked [VISUAL]\n`;
      template += `4. Review and refine the complete chapter\n`;
      template += `5. Export when satisfied\n`;

      setGeneratedTemplate(template);
      setIsTemplateMode(true);
      setEditableText(template);
      onTextChange?.(template);
    } catch (error) {
      console.error("Error generating template:", error);
      alert("Error generating template. Please try again.");
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const handleExport = () => {
    if (!editableText.trim()) {
      alert("Nothing to export yet. Add content before exporting.");
      return;
    }

    try {
      exportToHtml({
        text: editableText,
        fileName: fileName || "writer-mode-draft",
        analysis: analysisResult || undefined,
      });
    } catch (error) {
      console.error("WriterMode export failed", error);
      alert("Failed to export draft. Please try again.");
    }
  };

  return (
    <div
      className="writer-mode flex flex-col bg-white"
      style={{ height: "100vh", width: "100%" }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-start md:items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Writer Mode
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Edit your text based on learning principle recommendations
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen
                ? isCompactView
                  ? "◀"
                  : "◀ Hide Analysis"
                : isCompactView
                ? "▶"
                : "▶ Show Analysis"}
            </button>
            {analysisResult && (
              <button
                className="px-3 md:px-4 py-2 bg-white text-gray-600 rounded-full border-2 border-gray-600 hover:border-gray-700 hover:text-gray-700 transition-colors text-sm md:text-base whitespace-nowrap disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={generateAITemplate}
                disabled={isGeneratingTemplate}
              >
                {isGeneratingTemplate ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    {isCompactView ? "..." : "Generating..."}
                  </span>
                ) : (
                  <span>
                    {isCompactView ? "🤖 Template" : "🤖 Generate AI Template"}
                  </span>
                )}
              </button>
            )}
            <button
              className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base whitespace-nowrap"
              onClick={handleExport}
            >
              {isCompactView ? "Export" : "Export Text"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{
          maxWidth: "100%",
          width: "100%",
          flexDirection: isCompactView && isSidebarOpen ? "column" : "row",
        }}
      >
        {/* Text Editor - Expands to full width when sidebar closed */}
        <div
          className="flex flex-col transition-all duration-300"
          style={{
            width: isCompactView ? "100%" : isSidebarOpen ? "65%" : "100%",
            maxWidth: isCompactView ? "100%" : isSidebarOpen ? "65%" : "100%",
            minHeight: isCompactView && isSidebarOpen ? "50%" : "auto",
            flex: isCompactView && isSidebarOpen ? "1 1 50%" : undefined,
          }}
        >
          {isTemplateMode && (
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-semibold text-sm">
                    AI Template Mode Active
                  </p>
                  <p className="text-xs opacity-90">
                    Fill in [WRITER] sections manually or connect to Claude API
                    for [CLAUDE] sections
                  </p>
                </div>
              </div>
              <button
                className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors"
                onClick={() => {
                  if (
                    confirm(
                      "Exit template mode? Your template will be preserved in the editor."
                    )
                  ) {
                    setIsTemplateMode(false);
                  }
                }}
              >
                Exit Template
              </button>
            </div>
          )}
          <div className="bg-gray-100 px-3 md:px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 text-sm md:text-base">
                Editable Text
              </h3>
              <p className="text-xs text-gray-500">
                {editableText.length.toLocaleString()} characters •{" "}
                {editableText
                  .split(/\s+/)
                  .filter(Boolean)
                  .length.toLocaleString()}{" "}
                words
              </p>
            </div>
          </div>
          <div
            className="flex-1 overflow-auto p-4 md:p-6 lg:p-8"
            style={{ minHeight: 0 }}
          >
            <textarea
              ref={textAreaRef}
              value={editableText}
              onChange={handleTextChange}
              className="w-full p-4 md:p-6 lg:p-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base leading-relaxed shadow-sm"
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: isCompactView ? "16px" : "17px",
                lineHeight: "1.8",
                maxWidth: isSidebarOpen ? "100%" : "1200px",
                margin: isSidebarOpen ? "0" : "0 auto",
                minHeight: "100%",
                height: "auto",
              }}
              placeholder="Your text will appear here..."
              spellCheck={true}
            />
          </div>
        </div>

        {/* Suggestions Panel - Collapsible Right Sidebar */}
        {isSidebarOpen && (
          <div
            className="flex flex-col bg-gray-50 transition-all duration-300"
            style={{
              width: isCompactView ? "100%" : "35%",
              maxWidth: isCompactView ? "100%" : "35%",
              borderLeft: isCompactView ? "none" : "1px solid #e5e7eb",
              borderTop: isCompactView ? "1px solid #e5e7eb" : "none",
              flex: isCompactView ? "1 1 50%" : undefined,
              minHeight: isCompactView ? "300px" : "auto",
            }}
          >
            <div className="bg-gray-100 px-3 md:px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm md:text-base">
                Suggestions & Analysis
              </h3>
            </div>

            <div className="flex-1 overflow-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {/* Principle Scores Summary */}
              {principleScores.length > 0 && (
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-xs md:text-sm text-gray-900 mb-2 md:mb-3">
                    Learning Principle Scores
                  </h4>
                  <div className="space-y-1.5 md:space-y-2">
                    {principleScores.map((ps, idx) => {
                      const roundedScore = Math.round(Number(ps.score));
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-gray-700 font-medium">
                            {ps.principle}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  roundedScore >= 80
                                    ? "bg-green-500"
                                    : roundedScore >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${roundedScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-900 w-8 text-right">
                              {roundedScore}/100
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {textIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs md:text-sm text-gray-900 mb-2">
                    Recommendations ({textIssues.length})
                  </h4>
                  {textIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 md:p-3 rounded-lg border-l-4 cursor-pointer transition-all ${
                        selectedSuggestion === idx
                          ? "bg-blue-50 border-blue-500 shadow-md"
                          : issue.priority === "high"
                          ? "bg-red-50 border-red-500 hover:shadow-md"
                          : issue.priority === "medium"
                          ? "bg-yellow-50 border-yellow-500 hover:shadow-md"
                          : "bg-gray-50 border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedSuggestion(idx)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600 uppercase">
                          {issue.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            issue.priority === "high"
                              ? "bg-red-200 text-red-800"
                              : issue.priority === "medium"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{issue.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Concept Summary */}
              {concepts.length > 0 && (
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-xs md:text-sm text-gray-900 mb-2 md:mb-3">
                    Concepts Identified ({concepts.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {concepts.slice(0, 15).map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {concept.name}
                      </span>
                    ))}
                    {concepts.length > 15 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{concepts.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {textIssues.length === 0 && !analysisResult && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No analysis results yet.</p>
                  <p className="text-xs mt-1">
                    Run analysis to see suggestions here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
