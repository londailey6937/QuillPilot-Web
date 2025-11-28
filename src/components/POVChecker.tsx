import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface POVIssue {
  type: "head-hopping" | "inconsistent" | "unclear" | "shift";
  location: number;
  excerpt: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface POVAnalysis {
  dominantPOV:
    | "first"
    | "second"
    | "third-limited"
    | "third-omniscient"
    | "mixed";
  povConsistency: number; // 0-100
  issues: POVIssue[];
  characterPerspectives: Record<string, number>;
  recommendations: string[];
}

interface POVCheckerProps {
  text: string;
  onClose: () => void;
  onNavigate?: (position: number) => void;
}

export const POVChecker: React.FC<POVCheckerProps> = ({
  text,
  onClose,
  onNavigate,
}) => {
  const [analysis, setAnalysis] = useState<POVAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const analyzePOV = (inputText: string): POVAnalysis => {
    const paragraphs = inputText.split(/\n\n+/);
    const issues: POVIssue[] = [];
    const characterPerspectives: Record<string, number> = {};

    // POV indicators
    const firstPersonPronouns = /\b(I|me|my|mine|we|us|our|ours)\b/gi;
    const secondPersonPronouns = /\b(you|your|yours)\b/gi;
    const thirdPersonPronouns =
      /\b(he|him|his|she|her|hers|they|them|their)\b/gi;

    // Thought indicators
    const internalThoughts =
      /\b(thought|wondered|realized|knew|felt|remembered|believed)\b/gi;
    const directThoughts = /['"][^'"]*\b(I|my|me)\b[^'"]*['"]/gi;

    let firstPersonCount = 0;
    let secondPersonCount = 0;
    let thirdPersonCount = 0;
    let currentPOV: "first" | "second" | "third" | "unknown" = "unknown";
    let previousPOV: "first" | "second" | "third" | "unknown" = "unknown";

    paragraphs.forEach((para, idx) => {
      const firstMatches = [...para.matchAll(firstPersonPronouns)].length;
      const secondMatches = [...para.matchAll(secondPersonPronouns)].length;
      const thirdMatches = [...para.matchAll(thirdPersonPronouns)].length;

      firstPersonCount += firstMatches;
      secondPersonCount += secondMatches;
      thirdPersonCount += thirdMatches;

      // Determine paragraph POV
      if (firstMatches > thirdMatches && firstMatches > secondMatches) {
        currentPOV = "first";
      } else if (thirdMatches > firstMatches && thirdMatches > secondMatches) {
        currentPOV = "third";
      } else if (secondMatches > firstMatches && secondMatches > thirdMatches) {
        currentPOV = "second";
      } else {
        currentPOV = "unknown";
      }

      // Check for POV shifts
      if (
        previousPOV !== "unknown" &&
        currentPOV !== "unknown" &&
        previousPOV !== currentPOV &&
        idx > 0
      ) {
        issues.push({
          type: "shift",
          location: idx,
          excerpt: para.substring(0, 150),
          description: `POV shifts from ${previousPOV} person to ${currentPOV} person`,
          severity: "high",
        });
      }

      // Check for head-hopping in third person
      if (currentPOV === "third") {
        const thoughtMatches = [...para.matchAll(internalThoughts)];
        if (thoughtMatches.length > 2) {
          // Check if multiple characters' thoughts in same paragraph
          const characters = new Set<string>();
          const namePattern =
            /\b([A-Z][a-z]+)\s+(thought|wondered|realized|knew|felt)/g;
          const characterThoughts = [...para.matchAll(namePattern)];

          characterThoughts.forEach((match) => {
            const charName = match[1];
            characters.add(charName);
            characterPerspectives[charName] =
              (characterPerspectives[charName] || 0) + 1;
          });

          if (characters.size > 1) {
            issues.push({
              type: "head-hopping",
              location: idx,
              excerpt: para.substring(0, 150),
              description: `Multiple characters' thoughts in one paragraph: ${Array.from(
                characters
              ).join(", ")}`,
              severity: "high",
            });
          }
        }
      }

      // Check for unclear POV
      if (currentPOV === "third") {
        // Look for deep POV markers mixed with distant narration
        const deepPOVMarkers = /\b(felt like|seemed to|appeared to)\b/gi;
        const distantMarkers = /\b(the man|the woman|the person)\b/gi;
        const deepCount = [...para.matchAll(deepPOVMarkers)].length;
        const distantCount = [...para.matchAll(distantMarkers)].length;

        if (deepCount > 0 && distantCount > 0) {
          issues.push({
            type: "inconsistent",
            location: idx,
            excerpt: para.substring(0, 150),
            description: "Mixing deep and distant POV styles",
            severity: "medium",
          });
        }
      }

      previousPOV = currentPOV;
    });

    // Determine dominant POV
    let dominantPOV: POVAnalysis["dominantPOV"] = "mixed";
    const total = firstPersonCount + secondPersonCount + thirdPersonCount;

    if (total > 0) {
      const firstPercent = (firstPersonCount / total) * 100;
      const secondPercent = (secondPersonCount / total) * 100;
      const thirdPercent = (thirdPersonCount / total) * 100;

      if (firstPercent > 60) {
        dominantPOV = "first";
      } else if (secondPercent > 60) {
        dominantPOV = "second";
      } else if (thirdPercent > 60) {
        // Determine if limited or omniscient
        const multipleCharacters =
          Object.keys(characterPerspectives).length > 1;
        dominantPOV = multipleCharacters ? "third-omniscient" : "third-limited";
      }
    }

    // Calculate consistency score
    let consistencyScore = 100;
    issues.forEach((issue) => {
      if (issue.severity === "high") consistencyScore -= 15;
      else if (issue.severity === "medium") consistencyScore -= 8;
      else consistencyScore -= 3;
    });
    consistencyScore = Math.max(0, consistencyScore);

    // Generate recommendations
    const recommendations: string[] = [];

    if (issues.filter((i) => i.type === "head-hopping").length > 0) {
      recommendations.push(
        "Avoid head-hopping: Stay in one character's perspective per scene or chapter"
      );
    }

    if (issues.filter((i) => i.type === "shift").length > 2) {
      recommendations.push(
        "POV shifts should be intentional and clearly marked (chapter breaks, scene breaks)"
      );
    }

    if (dominantPOV === "mixed") {
      recommendations.push(
        "Consider choosing a consistent POV throughout your story"
      );
    }

    if (Object.keys(characterPerspectives).length > 5) {
      recommendations.push(
        "Multiple POV characters detected - ensure each has distinct voice and purpose"
      );
    }

    if (consistencyScore < 70) {
      recommendations.push(
        "Review POV consistency - readers may find perspective shifts confusing"
      );
    } else if (consistencyScore > 90) {
      recommendations.push("✓ POV is consistent and well-maintained");
    }

    return {
      dominantPOV,
      povConsistency: consistencyScore,
      issues: issues.sort((a, b) => a.location - b.location),
      characterPerspectives,
      recommendations,
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzePOV(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 600);
  }, [text]);

  const getSeverityStyles = (severity: string): React.CSSProperties => {
    if (severity === "high") {
      return { background: palette.hover, borderColor: "#ef4444" };
    }
    if (severity === "medium") {
      return { background: palette.base, borderColor: "#f59e0b" };
    }
    return { background: palette.light, borderColor: "#3b82f6" };
  };

  const getSeverityChipStyles = (
    severity: POVIssue["severity"]
  ): React.CSSProperties => {
    if (severity === "high") {
      return {
        background: "rgba(239, 68, 68, 0.12)",
        color: palette.danger,
        border: `1px solid rgba(239, 68, 68, 0.4)`,
      };
    }

    if (severity === "medium") {
      return {
        background: "rgba(245, 158, 11, 0.12)",
        color: palette.warning,
        border: `1px solid rgba(245, 158, 11, 0.4)`,
      };
    }

    return {
      background: "rgba(16, 185, 129, 0.12)",
      color: palette.success,
      border: `1px solid rgba(16, 185, 129, 0.4)`,
    };
  };

  const getPOVLabel = (pov: POVAnalysis["dominantPOV"]): string => {
    const labels = {
      first: "First Person (I, we)",
      second: "Second Person (you)",
      "third-limited": "Third Person Limited (one character's perspective)",
      "third-omniscient": "Third Person Omniscient (multiple perspectives)",
      mixed: "Mixed POV",
    };
    return labels[pov];
  };

  return (
    <div
      className="pov-checker-modal"
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
        maxWidth: "800px",
        maxHeight: "85vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black">👁️ POV Checker</h2>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">🔍</div>
          <div className="text-gray-600">Analyzing point of view...</div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* POV Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div className="text-sm text-gray-600 mb-1">Dominant POV</div>
              <div
                className="text-xl font-bold"
                style={{ color: palette.navy }}
              >
                {getPOVLabel(analysis.dominantPOV)}
              </div>
            </div>
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.light,
                borderColor: palette.border,
              }}
            >
              <div className="text-sm text-gray-600 mb-1">
                Consistency Score
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: palette.success }}
              >
                {analysis.povConsistency}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${analysis.povConsistency}%`,
                    background: palette.success,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Character Perspectives */}
          {Object.keys(analysis.characterPerspectives).length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.subtle,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-2 text-black">
                🎭 Character Perspectives
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.characterPerspectives)
                  .sort(([, a], [, b]) => b - a)
                  .map(([char, count]) => (
                    <div
                      key={char}
                      className="flex justify-between items-center p-2 rounded border"
                      style={{
                        background: palette.base,
                        borderColor: palette.lightBorder,
                      }}
                    >
                      <span className="font-semibold">{char}</span>
                      <span className="text-sm text-gray-600">
                        {count} instance{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {analysis.issues.length > 0 ? (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.hover,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                ⚠️ POV Issues ({analysis.issues.length})
              </h3>
              <div className="space-y-3">
                {analysis.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow text-black"
                    style={getSeverityStyles(issue.severity)}
                    onClick={() => onNavigate && onNavigate(issue.location)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">
                            {issue.type.toUpperCase()}
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded font-semibold"
                            style={getSeverityChipStyles(issue.severity)}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-sm">{issue.description}</p>
                      </div>
                    </div>
                    <div
                      className="text-sm p-2 rounded border mt-2"
                      style={{
                        background: palette.base,
                        borderColor: palette.lightBorder,
                      }}
                    >
                      {issue.excerpt}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-xl font-bold text-green-600 mb-2">
                No POV Issues Detected!
              </div>
              <div className="text-gray-600">
                Your point of view is consistent and well-maintained
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
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
              <ul className="space-y-1" style={{ color: palette.navy }}>
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm">
                    {rec.startsWith("✓") ? rec : `• ${rec}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* POV Guide */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              📚 POV Quick Guide
            </h3>
            <div className="text-sm space-y-2" style={{ color: palette.navy }}>
              <div>
                <strong>First Person:</strong> Intimate, limited to one
                character's knowledge
              </div>
              <div>
                <strong>Third Limited:</strong> Follows one character closely,
                shows their thoughts
              </div>
              <div>
                <strong>Third Omniscient:</strong> Can show multiple characters'
                thoughts and perspectives
              </div>
              <div>
                <strong>Head-hopping:</strong> Switching between characters'
                thoughts too quickly (usually a mistake)
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
