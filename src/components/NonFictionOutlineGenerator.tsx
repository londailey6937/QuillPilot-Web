import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface OutlineSection {
  id: string;
  type: "thesis" | "argument" | "evidence" | "counterargument" | "conclusion";
  title: string;
  content: string;
  supportingPoints: string[];
  order: number;
}

interface OutlineStructure {
  title: string;
  thesis: string;
  sections: OutlineSection[];
  recommendations: string[];
  structure:
    | "chronological"
    | "problem-solution"
    | "compare-contrast"
    | "cause-effect";
}

interface NonFictionOutlineGeneratorProps {
  text: string;
  onClose: () => void;
}

export const NonFictionOutlineGenerator: React.FC<
  NonFictionOutlineGeneratorProps
> = ({ text, onClose }) => {
  const [outline, setOutline] = useState<OutlineStructure | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [selectedView, setSelectedView] = useState<"outline" | "evidence">(
    "outline"
  );

  const generateOutline = (inputText: string): OutlineStructure => {
    const paragraphs = inputText
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 50);
    const sentences = inputText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    // Detect thesis statement (usually in first few paragraphs)
    let thesis = sentences[0] || "Main argument to be determined";
    const thesisIndicators = [
      "argue that",
      "this paper",
      "this essay",
      "I will show",
      "demonstrates that",
      "proves that",
    ];

    for (const sentence of sentences.slice(0, 10)) {
      for (const indicator of thesisIndicators) {
        if (sentence.toLowerCase().includes(indicator)) {
          thesis = sentence.trim();
          break;
        }
      }
    }

    // Detect structure type
    let structure: OutlineStructure["structure"] = "chronological";
    const problemWords = ["problem", "issue", "challenge", "solution"];
    const compareWords = [
      "compare",
      "contrast",
      "similar",
      "different",
      "however",
    ];
    const causeWords = [
      "because",
      "therefore",
      "thus",
      "result",
      "cause",
      "effect",
    ];

    const textLower = inputText.toLowerCase();
    const problemCount = problemWords.filter((w) =>
      textLower.includes(w)
    ).length;
    const compareCount = compareWords.filter((w) =>
      textLower.includes(w)
    ).length;
    const causeCount = causeWords.filter((w) => textLower.includes(w)).length;

    if (problemCount > 3) structure = "problem-solution";
    else if (compareCount > 3) structure = "compare-contrast";
    else if (causeCount > 3) structure = "cause-effect";

    // Extract sections
    const sections: OutlineSection[] = [];
    let sectionId = 0;

    paragraphs.forEach((para, idx) => {
      const lowerPara = para.toLowerCase();
      let type: OutlineSection["type"] = "argument";

      // Detect section type
      if (
        lowerPara.includes("however") ||
        lowerPara.includes("critics argue") ||
        lowerPara.includes("on the other hand")
      ) {
        type = "counterargument";
      } else if (
        lowerPara.includes("in conclusion") ||
        lowerPara.includes("to summarize") ||
        idx > paragraphs.length - 3
      ) {
        type = "conclusion";
      } else if (
        lowerPara.includes("for example") ||
        lowerPara.includes("evidence") ||
        lowerPara.includes("study shows") ||
        lowerPara.includes("research")
      ) {
        type = "evidence";
      }

      // Extract supporting points (look for lists, bullet points, or multiple sentences)
      const supportingPoints: string[] = [];
      const parasSentences = para
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 15);

      if (parasSentences.length > 2) {
        supportingPoints.push(
          ...parasSentences.slice(0, 3).map((s) => s.trim())
        );
      }

      // Generate title from first sentence
      const title = parasSentences[0]
        ? parasSentences[0].trim().substring(0, 80) + "..."
        : `Section ${idx + 1}`;

      sections.push({
        id: `section-${sectionId++}`,
        type,
        title,
        content: para.substring(0, 200) + "...",
        supportingPoints,
        order: idx,
      });
    });

    // Generate recommendations
    const recommendations: string[] = [];
    const argumentCount = sections.filter((s) => s.type === "argument").length;
    const evidenceCount = sections.filter((s) => s.type === "evidence").length;
    const counterCount = sections.filter(
      (s) => s.type === "counterargument"
    ).length;

    if (argumentCount < 3) {
      recommendations.push(
        "Consider adding more main arguments to support your thesis"
      );
    }
    if (evidenceCount < argumentCount) {
      recommendations.push(
        "Each argument should be supported by concrete evidence or examples"
      );
    }
    if (counterCount === 0) {
      recommendations.push(
        "Address potential counterarguments to strengthen your position"
      );
    }
    if (sections.length < 5) {
      recommendations.push("Expand your outline with more detailed sections");
    }
    if (
      !sections.some(
        (s) =>
          s.type === "conclusion" ||
          s.title.toLowerCase().includes("conclusion")
      )
    ) {
      recommendations.push(
        "Add a clear conclusion that summarizes your arguments"
      );
    }

    return {
      title: "Non-Fiction Outline",
      thesis,
      sections: sections.slice(0, 15),
      recommendations,
      structure,
    };
  };

  useEffect(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateOutline(text);
      setOutline(result);
      setIsGenerating(false);
    }, 900);
  }, [text]);

  const getSectionIcon = (type: OutlineSection["type"]): string => {
    const icons = {
      thesis: "🎯",
      argument: "💡",
      evidence: "📊",
      counterargument: "⚖️",
      conclusion: "🏁",
    };
    return icons[type];
  };

  const getSectionStyle = (
    type: OutlineSection["type"]
  ): React.CSSProperties => {
    const styles: Record<OutlineSection["type"], React.CSSProperties> = {
      thesis: {
        background: palette.accent + "20",
        borderColor: palette.accent,
      },
      argument: { background: palette.base, borderColor: palette.border },
      evidence: {
        background: palette.subtle,
        borderColor: palette.lightBorder,
      },
      counterargument: {
        background: palette.hover,
        borderColor: palette.border,
      },
      conclusion: {
        background: palette.light,
        borderColor: palette.lightBorder,
      },
    };
    return styles[type];
  };

  return (
    <div
      className="outline-generator-modal"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: palette.base,
        border: `2px solid ${palette.border}`,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        maxWidth: "900px",
        maxHeight: "85vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black">
          📝 Non-Fiction Outline Generator
        </h2>
      </div>

      {isGenerating ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">📝</div>
          <div className="text-gray-600">Generating outline structure...</div>
        </div>
      ) : outline ? (
        <div className="space-y-6">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView("outline")}
              className="px-4 py-2 rounded transition-colors"
              style={{
                background:
                  selectedView === "outline" ? palette.accent : palette.base,
                color: selectedView === "outline" ? "#ffffff" : palette.navy,
                border: `1px solid ${
                  selectedView === "outline" ? palette.accent : palette.border
                }`,
              }}
            >
              📋 Outline
            </button>
            <button
              onClick={() => setSelectedView("evidence")}
              className="px-4 py-2 rounded transition-colors"
              style={{
                background:
                  selectedView === "evidence" ? palette.accent : palette.base,
                color: selectedView === "evidence" ? "#ffffff" : palette.navy,
                border: `1px solid ${
                  selectedView === "evidence" ? palette.accent : palette.border
                }`,
              }}
            >
              📊 Evidence Map
            </button>
          </div>

          {/* Structure Type */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm" style={{ color: palette.mutedText }}>
                  Detected Structure:
                </div>
                <div
                  className="font-bold text-lg capitalize"
                  style={{ color: palette.navy }}
                >
                  {outline.structure.replace("-", " ")}
                </div>
              </div>
              <div
                className="px-3 py-1 rounded text-sm font-semibold"
                style={{
                  background: palette.base,
                  border: `1px solid ${palette.border}`,
                  color: palette.navy,
                }}
              >
                {outline.sections.length} Sections
              </div>
            </div>
          </div>

          {/* Thesis Statement */}
          <div
            className="border-2 rounded-lg p-4"
            style={{
              background: palette.light,
              borderColor: palette.accent,
            }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              🎯 Thesis Statement
            </h3>
            <p className="text-sm" style={{ color: palette.navy }}>
              {outline.thesis}
            </p>
          </div>

          {selectedView === "outline" ? (
            /* Outline View */
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                📚 Outline Structure
              </h3>
              <div className="space-y-3">
                {outline.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="border-2 rounded-lg p-4"
                    style={getSectionStyle(section.type)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getSectionIcon(section.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div
                              className="font-semibold text-xs uppercase mb-1"
                              style={{ color: palette.mutedText }}
                            >
                              {section.type.replace("-", " ")}
                            </div>
                            <div
                              className="font-bold"
                              style={{ color: palette.navy }}
                            >
                              {idx + 1}. {section.title}
                            </div>
                          </div>
                        </div>
                        {section.supportingPoints.length > 0 && (
                          <ul
                            className="text-sm space-y-1 mt-2"
                            style={{ color: palette.navy }}
                          >
                            {section.supportingPoints.map((point, pidx) => (
                              <li key={pidx}>• {point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Evidence Map View */
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                📊 Evidence & Arguments Map
              </h3>
              <div className="space-y-4">
                <div
                  className="p-3 rounded border"
                  style={{
                    background: palette.subtle,
                    borderColor: palette.lightBorder,
                  }}
                >
                  <div
                    className="font-semibold mb-2"
                    style={{ color: palette.navy }}
                  >
                    Arguments:{" "}
                    {
                      outline.sections.filter((s) => s.type === "argument")
                        .length
                    }
                  </div>
                  <div
                    className="space-y-1 text-sm"
                    style={{ color: palette.navy }}
                  >
                    {outline.sections
                      .filter((s) => s.type === "argument")
                      .map((s, idx) => (
                        <div key={s.id}>• {s.title}</div>
                      ))}
                  </div>
                </div>

                <div
                  className="p-3 rounded border"
                  style={{
                    background: palette.light,
                    borderColor: palette.lightBorder,
                  }}
                >
                  <div
                    className="font-semibold mb-2"
                    style={{ color: palette.navy }}
                  >
                    Evidence:{" "}
                    {
                      outline.sections.filter((s) => s.type === "evidence")
                        .length
                    }
                  </div>
                  <div
                    className="space-y-1 text-sm"
                    style={{ color: palette.navy }}
                  >
                    {outline.sections
                      .filter((s) => s.type === "evidence")
                      .map((s, idx) => (
                        <div key={s.id}>• {s.title}</div>
                      ))}
                  </div>
                </div>

                <div
                  className="p-3 rounded border"
                  style={{
                    background: palette.hover,
                    borderColor: palette.border,
                  }}
                >
                  <div
                    className="font-semibold mb-2"
                    style={{ color: palette.navy }}
                  >
                    Counterarguments:{" "}
                    {
                      outline.sections.filter(
                        (s) => s.type === "counterargument"
                      ).length
                    }
                  </div>
                  <div
                    className="space-y-1 text-sm"
                    style={{ color: palette.navy }}
                  >
                    {outline.sections
                      .filter((s) => s.type === "counterargument")
                      .map((s, idx) => (
                        <div key={s.id}>• {s.title}</div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {outline.recommendations.length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.light,
                borderColor: palette.lightBorder,
              }}
            >
              <h3 className="font-bold text-lg mb-2 text-black">
                💡 Recommendations
              </h3>
              <ul className="text-sm space-y-1" style={{ color: palette.navy }}>
                {outline.recommendations.map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Structure Guide */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              📚 Structure Guide
            </h3>
            <div className="text-sm space-y-2" style={{ color: palette.navy }}>
              <div>
                <strong>Problem-Solution:</strong> Identify problem → Analyze
                causes → Present solution
              </div>
              <div>
                <strong>Compare-Contrast:</strong> Identify subjects → Show
                similarities → Highlight differences
              </div>
              <div>
                <strong>Cause-Effect:</strong> Present situation → Explain
                causes → Show effects
              </div>
              <div>
                <strong>Chronological:</strong> Events in time order → Context
                for each period
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
