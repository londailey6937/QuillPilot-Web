import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface DialogueAnalysis {
  naturalFlow: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  subtext: {
    detected: boolean;
    examples: string[];
    suggestions: string[];
  };
  characterVoice: {
    consistency: number;
    issues: string[];
    suggestions: string[];
  };
  tags: {
    overused: string[];
    suggestions: string[];
  };
}

interface DialogueEnhancerProps {
  text: string;
  characterName?: string;
  onClose: () => void;
}

export const DialogueEnhancer: React.FC<DialogueEnhancerProps> = ({
  text,
  characterName,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<DialogueAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const analyzeDialogue = (dialogueText: string): DialogueAnalysis => {
    const lines = dialogueText.split("\n").filter((l) => l.trim());
    const dialogueLines = lines.filter(
      (l) => l.includes('"') || l.includes("'")
    );

    // Natural Flow Analysis
    const flowIssues: string[] = [];
    const flowSuggestions: string[] = [];
    let flowScore = 100;

    dialogueLines.forEach((line) => {
      // Check for overly long dialogue
      const dialogueMatch = line.match(/["'](.+?)["']/);
      if (dialogueMatch) {
        const dialogue = dialogueMatch[1];
        if (dialogue.split(" ").length > 40) {
          flowIssues.push("Dialogue is too long - consider breaking it up");
          flowSuggestions.push(
            "Split lengthy dialogue with action beats or reactions"
          );
          flowScore -= 15;
        }

        // Check for unnatural formality
        if (dialogue.match(/\b(shall|whom|whilst|furthermore)\b/i)) {
          flowIssues.push("Dialogue may be too formal");
          flowSuggestions.push(
            "Use contractions and casual language for natural speech"
          );
          flowScore -= 10;
        }

        // Check for contractions (natural speech uses them)
        const noContractions =
          dialogue.match(/\b(do not|cannot|will not|should not)\b/gi)?.length ||
          0;
        if (noContractions > 2) {
          flowIssues.push("Missing contractions makes dialogue stiff");
          flowSuggestions.push(
            "Use contractions: don't, can't, won't, shouldn't"
          );
          flowScore -= 10;
        }
      }
    });

    // Subtext Analysis
    const subtextDetected = dialogueText.match(
      /\b(but|however|though|actually|really|just|maybe|perhaps)\b/gi
    )
      ? true
      : false;
    const subtextExamples: string[] = [];
    const subtextSuggestions: string[] = [];

    if (!subtextDetected) {
      subtextSuggestions.push(
        "Add subtext by having characters say less than they mean"
      );
      subtextSuggestions.push(
        "Use deflection, lies, or incomplete truths to create depth"
      );
    } else {
      dialogueLines.forEach((line) => {
        if (line.match(/\b(fine|whatever|sure|okay)\b/i)) {
          subtextExamples.push(
            'Simple words like "fine" or "whatever" often carry subtext'
          );
        }
      });
    }

    // Character Voice Analysis
    const voiceIssues: string[] = [];
    const voiceSuggestions: string[] = [];
    let voiceConsistency = 100;

    // Check for speech patterns
    const hasFillerWords = dialogueText.match(/\b(uh|um|like|you know)\b/gi);
    const hasDialect = dialogueText.match(/ain't|gonna|wanna|kinda/gi);
    const hasUniquePhrasings = dialogueText.match(
      /\b(reckon|suppose|figure)\b/gi
    );

    if (!hasFillerWords && !hasDialect && !hasUniquePhrasings) {
      voiceIssues.push("Dialogue lacks distinct character voice");
      voiceSuggestions.push("Add unique speech patterns or verbal tics");
      voiceSuggestions.push(
        "Consider regional dialect or educational background"
      );
      voiceConsistency -= 20;
    }

    // Check dialogue tags
    const tags =
      dialogueText.match(/\b(said|asked|replied|responded)\b/gi) || [];
    const overusedTags: string[] = [];
    const tagSuggestions: string[] = [];

    const tagCounts: Record<string, number> = {};
    tags.forEach((tag) => {
      const lower = tag.toLowerCase();
      tagCounts[lower] = (tagCounts[lower] || 0) + 1;
    });

    Object.entries(tagCounts).forEach(([tag, count]) => {
      if (count > 5) {
        overusedTags.push(`"${tag}" used ${count} times`);
      }
    });

    if (overusedTags.length > 0) {
      tagSuggestions.push("Vary dialogue tags with action beats");
      tagSuggestions.push("Sometimes omit tags entirely when context is clear");
    }

    // Check for adverbs in dialogue tags
    const adverbTags = dialogueText.match(/\b(said|asked)\s+\w+ly\b/gi) || [];
    if (adverbTags.length > 2) {
      tagSuggestions.push(
        "Avoid adverbs in dialogue tags - show emotion through the dialogue itself"
      );
    }

    return {
      naturalFlow: {
        score: Math.max(0, flowScore),
        issues: flowIssues,
        suggestions: flowSuggestions,
      },
      subtext: {
        detected: subtextDetected,
        examples: subtextExamples,
        suggestions: subtextSuggestions,
      },
      characterVoice: {
        consistency: Math.max(0, voiceConsistency),
        issues: voiceIssues,
        suggestions: voiceSuggestions,
      },
      tags: {
        overused: overusedTags,
        suggestions: tagSuggestions,
      },
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeDialogue(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 500);
  }, [text]);

  return (
    <div
      className="dialogue-enhancer-modal"
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
        maxWidth: "700px",
        maxHeight: "80vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black">💬 Dialogue Enhancer</h2>
      </div>

      {characterName && (
        <div className="mb-4 text-sm text-gray-600">
          Analyzing dialogue for: <strong>{characterName}</strong>
        </div>
      )}

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">🎭</div>
          <div className="text-gray-600">Analyzing dialogue...</div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Natural Flow */}
          <div
            className="border rounded-lg p-4"
            style={{ background: palette.base, borderColor: palette.border }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              🎭 Natural Flow
            </h3>
            <div className="mb-2">
              <div className="text-sm text-gray-600 mb-1">Score:</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${analysis.naturalFlow.score}%` }}
                />
              </div>
              <div className="text-right text-sm font-bold text-blue-700">
                {analysis.naturalFlow.score}%
              </div>
            </div>
            {analysis.naturalFlow.issues.length > 0 && (
              <div className="mb-2">
                <div className="text-sm font-semibold text-red-700 mb-1">
                  Issues:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.naturalFlow.issues.map((issue, idx) => (
                    <li key={idx} className="text-red-600">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.naturalFlow.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-green-700 mb-1">
                  Suggestions:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.naturalFlow.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-green-600">
                      ✓ {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Subtext */}
          <div
            className="border rounded-lg p-4"
            style={{ background: palette.base, borderColor: palette.border }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">🎯 Subtext</h3>
            <div className="mb-2">
              <div className="text-sm">
                Subtext detected:{" "}
                <strong
                  className={
                    analysis.subtext.detected
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {analysis.subtext.detected ? "Yes" : "No"}
                </strong>
              </div>
            </div>
            {analysis.subtext.examples.length > 0 && (
              <div className="mb-2">
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: palette.accent }}
                >
                  Examples:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.subtext.examples.map((example, idx) => (
                    <li
                      key={idx}
                      className="text-sm"
                      style={{ color: palette.accentDark }}
                    >
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.subtext.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-green-700 mb-1">
                  Suggestions:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.subtext.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-green-600">
                      ✓ {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Character Voice */}
          <div
            className="border rounded-lg p-4"
            style={{ background: palette.base, borderColor: palette.border }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              👤 Character Voice
            </h3>
            <div className="mb-2">
              <div className="text-sm text-gray-600 mb-1">
                Consistency Score:
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-amber-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${analysis.characterVoice.consistency}%`,
                  }}
                />
              </div>
              <div className="text-right text-sm font-bold text-amber-700">
                {analysis.characterVoice.consistency}%
              </div>
            </div>
            {analysis.characterVoice.issues.length > 0 && (
              <div className="mb-2">
                <div className="text-sm font-semibold text-red-700 mb-1">
                  Issues:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.characterVoice.issues.map((issue, idx) => (
                    <li key={idx} className="text-red-600">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.characterVoice.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-green-700 mb-1">
                  Suggestions:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.characterVoice.suggestions.map(
                    (suggestion, idx) => (
                      <li key={idx} className="text-green-600">
                        ✓ {suggestion}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Dialogue Tags */}
          {(analysis.tags.overused.length > 0 ||
            analysis.tags.suggestions.length > 0) && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-2 text-black">
                🏷️ Dialogue Tags
              </h3>
              {analysis.tags.overused.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm font-semibold text-red-700 mb-1">
                    Overused Tags:
                  </div>
                  <ul className="text-sm space-y-1">
                    {analysis.tags.overused.map((tag, idx) => (
                      <li key={idx} className="text-red-600">
                        • {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.tags.suggestions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-green-700 mb-1">
                    Suggestions:
                  </div>
                  <ul className="text-sm space-y-1">
                    {analysis.tags.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-green-600">
                        ✓ {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No dialogue found to analyze
        </div>
      )}
    </div>
  );
};
