import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface ClicheDetection {
  phrase: string;
  count: number;
  locations: number[];
  alternatives: string[];
  category: string;
}

interface ClicheDetectorProps {
  text: string;
  onClose: () => void;
  onReplace?: (oldPhrase: string, newPhrase: string) => void;
}

export const ClicheDetector: React.FC<ClicheDetectorProps> = ({
  text,
  onClose,
  onReplace,
}) => {
  const [detections, setDetections] = useState<ClicheDetection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const clicheDatabase: Record<
    string,
    { alternatives: string[]; category: string }
  > = {
    "at the end of the day": {
      alternatives: [
        "ultimately",
        "in conclusion",
        "finally",
        "when all is said and done",
      ],
      category: "filler",
    },
    "low-hanging fruit": {
      alternatives: [
        "easy target",
        "simple solution",
        "obvious choice",
        "straightforward option",
      ],
      category: "business",
    },
    "think outside the box": {
      alternatives: [
        "be creative",
        "innovate",
        "find novel solutions",
        "approach differently",
      ],
      category: "business",
    },
    "time will tell": {
      alternatives: [
        "we'll see",
        "the future will reveal",
        "it remains to be seen",
      ],
      category: "vague",
    },
    "it is what it is": {
      alternatives: [
        "we must accept this",
        "this is the reality",
        "we can't change this",
      ],
      category: "resignation",
    },
    "avoid like the plague": {
      alternatives: [
        "avoid completely",
        "stay away from",
        "shun",
        "keep clear of",
      ],
      category: "comparison",
    },
    "crystal clear": {
      alternatives: [
        "obvious",
        "evident",
        "transparent",
        "unambiguous",
        "plain",
      ],
      category: "description",
    },
    "piece of cake": {
      alternatives: [
        "easy",
        "simple",
        "effortless",
        "straightforward",
        "uncomplicated",
      ],
      category: "comparison",
    },
    "ballpark figure": {
      alternatives: [
        "estimate",
        "approximation",
        "rough number",
        "general idea",
      ],
      category: "business",
    },
    "in this day and age": {
      alternatives: [
        "today",
        "currently",
        "now",
        "in modern times",
        "nowadays",
      ],
      category: "time",
    },
    "at this point in time": {
      alternatives: ["now", "currently", "at present", "today"],
      category: "time",
    },
    "when push comes to shove": {
      alternatives: [
        "ultimately",
        "if necessary",
        "in the end",
        "when it matters",
      ],
      category: "action",
    },
    "more than meets the eye": {
      alternatives: [
        "hidden depths",
        "complexity beneath",
        "not as simple as it seems",
      ],
      category: "mystery",
    },
    "blood ran cold": {
      alternatives: [
        "felt sudden fear",
        "was terrified",
        "froze with dread",
        "panic gripped",
      ],
      category: "emotion",
    },
    "breath caught in throat": {
      alternatives: ["gasped", "was shocked", "froze", "felt sudden surprise"],
      category: "emotion",
    },
    "heart skipped a beat": {
      alternatives: [
        "was startled",
        "felt sudden emotion",
        "was caught off guard",
      ],
      category: "emotion",
    },
    "butterflies in stomach": {
      alternatives: [
        "felt nervous",
        "was anxious",
        "felt anticipation",
        "was uneasy",
      ],
      category: "emotion",
    },
    "at a loss for words": {
      alternatives: [
        "speechless",
        "silent",
        "couldn't respond",
        "had nothing to say",
      ],
      category: "emotion",
    },
    "last but not least": {
      alternatives: ["finally", "lastly", "to conclude"],
      category: "filler",
    },
    "needless to say": {
      alternatives: ["obviously", "clearly", "of course"],
      category: "filler",
    },
    "for all intents and purposes": {
      alternatives: ["essentially", "practically", "effectively", "in effect"],
      category: "filler",
    },
    "the fact of the matter": {
      alternatives: ["actually", "in truth", "the reality is", "simply put"],
      category: "filler",
    },
    "on the same page": {
      alternatives: [
        "in agreement",
        "aligned",
        "understanding each other",
        "united",
      ],
      category: "business",
    },
    "paradigm shift": {
      alternatives: [
        "fundamental change",
        "major transformation",
        "complete reversal",
      ],
      category: "business",
    },
    "game changer": {
      alternatives: [
        "revolutionary",
        "transformative",
        "groundbreaking",
        "innovative",
      ],
      category: "business",
    },
    "move the needle": {
      alternatives: ["make progress", "create impact", "advance", "improve"],
      category: "business",
    },
    "boil the ocean": {
      alternatives: ["attempt the impossible", "overreach", "be too ambitious"],
      category: "business",
    },
    "circle back": {
      alternatives: ["return to", "revisit", "discuss later", "follow up"],
      category: "business",
    },
    "deep dive": {
      alternatives: [
        "thorough analysis",
        "detailed examination",
        "comprehensive review",
      ],
      category: "business",
    },
    "take it offline": {
      alternatives: ["discuss privately", "talk later", "continue elsewhere"],
      category: "business",
    },
    "raining cats and dogs": {
      alternatives: [
        "pouring rain",
        "heavy rain",
        "downpour",
        "torrential rain",
      ],
      category: "weather",
    },
    "fit as a fiddle": {
      alternatives: ["healthy", "in good shape", "well", "robust"],
      category: "health",
    },
    "read between the lines": {
      alternatives: [
        "understand implications",
        "detect subtext",
        "infer meaning",
      ],
      category: "understanding",
    },
    "the ball is in your court": {
      alternatives: ["it's your decision", "your turn", "up to you now"],
      category: "responsibility",
    },
    "blessing in disguise": {
      alternatives: [
        "unexpected benefit",
        "hidden advantage",
        "fortunate outcome",
      ],
      category: "irony",
    },
    "wake-up call": {
      alternatives: ["warning", "alert", "realization", "eye-opener"],
      category: "awareness",
    },
    "tip of the iceberg": {
      alternatives: [
        "small part",
        "beginning",
        "surface indication",
        "mere hint",
      ],
      category: "scope",
    },
  };

  const detectCliches = (inputText: string): ClicheDetection[] => {
    const detectedCliches: ClicheDetection[] = [];
    const lowerText = inputText.toLowerCase();

    Object.entries(clicheDatabase).forEach(([phrase, data]) => {
      const regex = new RegExp(
        phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      const matches = [...inputText.matchAll(regex)];

      if (matches.length > 0) {
        const locations = matches.map((m) => m.index || 0);
        detectedCliches.push({
          phrase,
          count: matches.length,
          locations,
          alternatives: data.alternatives,
          category: data.category,
        });
      }
    });

    // Sort by count (most common first)
    return detectedCliches.sort((a, b) => b.count - a.count);
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const results = detectCliches(text);
      setDetections(results);
      setIsAnalyzing(false);
    }, 500);
  }, [text]);

  const filteredDetections =
    filter === "all"
      ? detections
      : detections.filter((d) => d.category === filter);

  const categories = [
    "all",
    ...Array.from(new Set(detections.map((d) => d.category))),
  ];

  const getCategoryStyle = (category: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      filler: {
        background: palette.base,
        borderColor: palette.border,
        color: palette.navy,
      },
      business: {
        background: palette.subtle,
        borderColor: palette.lightBorder,
        color: palette.navy,
      },
      emotion: {
        background: palette.hover,
        borderColor: palette.accent,
        color: palette.accentDark,
      },
      description: {
        background: palette.light,
        borderColor: palette.border,
        color: palette.navy,
      },
      comparison: {
        background: palette.deep,
        borderColor: palette.border,
        color: palette.navy,
      },
      time: {
        background: palette.subtle,
        borderColor: palette.lightBorder,
        color: palette.navy,
      },
      action: {
        background: palette.hover,
        borderColor: palette.info,
        color: palette.navy,
      },
    };
    return (
      styles[category] || {
        background: palette.base,
        borderColor: palette.border,
        color: palette.navy,
      }
    );
  };

  return (
    <div
      className="cliche-detector-modal"
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
        maxHeight: "80vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black">🚫 Cliché Detector</h2>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">🔍</div>
          <div className="text-gray-600">Analyzing text for clichés...</div>
        </div>
      ) : (
        <>
          {detections.length > 0 && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{
                background: palette.hover,
                border: `1px solid ${palette.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-3xl font-bold"
                  style={{ color: palette.accent }}
                >
                  {detections.length}
                </span>
                <span className="text-gray-700">
                  cliché{detections.length !== 1 ? "s" : ""} detected
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Total occurrences:{" "}
                {detections.reduce((sum, d) => sum + d.count, 0)}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Filter by category:
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-3 py-1.5 rounded text-sm border transition-colors"
                  style={{
                    background: filter === cat ? palette.accent : palette.base,
                    color: filter === cat ? "#ffffff" : palette.navy,
                    borderColor:
                      filter === cat ? palette.accent : palette.border,
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {cat !== "all" &&
                    ` (${detections.filter((d) => d.category === cat).length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredDetections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <div
                className="text-xl font-bold mb-2"
                style={{ color: palette.navy }}
              >
                No clichés detected!
              </div>
              <div className="text-gray-600">
                Your writing is fresh and original
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDetections.map((detection, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{
                    background: palette.base,
                    borderColor: palette.border,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-red-600">
                          "{detection.phrase}"
                        </h3>
                        <span
                          className="px-2 py-1 rounded text-xs border"
                          style={getCategoryStyle(detection.category)}
                        >
                          {detection.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Found {detection.count} time
                        {detection.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      💡 Better alternatives:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {detection.alternatives.map((alt, altIdx) => (
                        <button
                          key={altIdx}
                          onClick={() => {
                            if (onReplace) {
                              onReplace(detection.phrase, alt);
                            }
                          }}
                          className="px-3 py-1.5 rounded text-sm transition-colors"
                          style={{
                            background: palette.subtle,
                            border: `1px solid ${palette.lightBorder}`,
                            color: palette.navy,
                          }}
                          title={`Replace with "${alt}"`}
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {onReplace && (
                    <div className="text-xs text-gray-500 italic">
                      Click an alternative to replace in your text
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {detections.length > 0 && (
            <div
              className="mt-6 p-4 rounded-lg"
              style={{
                background: palette.light,
                border: `1px solid ${palette.lightBorder}`,
              }}
            >
              <h3 className="font-bold text-black mb-2">📚 Writing Tips</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Clichés weaken your writing by making it predictable</li>
                <li>• Fresh, specific language creates stronger impact</li>
                <li>• Show rather than tell using concrete details</li>
                <li>
                  • Create your own metaphors instead of using common ones
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
