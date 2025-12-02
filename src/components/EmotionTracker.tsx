import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface EmotionData {
  emotion: string;
  intensity: number; // 0-100
  location: number;
  chapter: number;
}

interface EmotionAnalysis {
  emotionsByChapter: Record<number, EmotionData[]>;
  dominantEmotions: Record<string, number>;
  emotionalArc: Array<{
    chapter: number;
    averageIntensity: number;
    dominantEmotion: string;
  }>;
  tensionPoints: Array<{
    location: number;
    chapter: number;
    intensity: number;
    description: string;
  }>;
}

interface EmotionTrackerProps {
  text: string;
  onClose: () => void;
  onOpenHelp?: () => void;
  onNavigate?: (position: number) => void;
}

export const EmotionTracker: React.FC<EmotionTrackerProps> = ({
  text,
  onClose,
  onOpenHelp,
  onNavigate,
}) => {
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");

  const emotionKeywords: Record<
    string,
    { keywords: string[]; intensity: number }
  > = {
    joy: {
      keywords: [
        "happy",
        "joy",
        "delight",
        "pleased",
        "excited",
        "cheerful",
        "elated",
        "thrilled",
        "smile",
        "laugh",
        "grin",
      ],
      intensity: 60,
    },
    anger: {
      keywords: [
        "angry",
        "furious",
        "rage",
        "mad",
        "irate",
        "livid",
        "enraged",
        "fuming",
        "scream",
        "shout",
        "yell",
      ],
      intensity: 80,
    },
    fear: {
      keywords: [
        "afraid",
        "fear",
        "scared",
        "terrified",
        "panic",
        "dread",
        "anxious",
        "nervous",
        "worried",
        "trembl",
        "shak",
      ],
      intensity: 75,
    },
    sadness: {
      keywords: [
        "sad",
        "sorrow",
        "grief",
        "depress",
        "miserable",
        "despair",
        "melancholy",
        "cry",
        "weep",
        "tear",
        "sob",
      ],
      intensity: 70,
    },
    love: {
      keywords: [
        "love",
        "adore",
        "cherish",
        "affection",
        "passion",
        "tender",
        "caring",
        "devoted",
        "kiss",
        "embrace",
        "caress",
      ],
      intensity: 65,
    },
    tension: {
      keywords: [
        "tension",
        "suspense",
        "danger",
        "threat",
        "risk",
        "critical",
        "urgent",
        "desperate",
        "edge",
        "pressure",
        "climax",
      ],
      intensity: 85,
    },
    surprise: {
      keywords: [
        "surprise",
        "shock",
        "astonish",
        "amaze",
        "stun",
        "unexpected",
        "sudden",
        "gasp",
        "startle",
        "wow",
      ],
      intensity: 70,
    },
    disgust: {
      keywords: [
        "disgust",
        "revulsion",
        "repuls",
        "nausea",
        "sick",
        "revolting",
        "gross",
        "vile",
        "loath",
      ],
      intensity: 60,
    },
    hope: {
      keywords: [
        "hope",
        "optimis",
        "confidence",
        "faith",
        "belief",
        "trust",
        "expect",
        "aspire",
        "dream",
        "wish",
      ],
      intensity: 55,
    },
    despair: {
      keywords: [
        "despair",
        "hopeless",
        "defeated",
        "lost",
        "broken",
        "ruin",
        "devastat",
        "crush",
        "surrender",
        "give up",
      ],
      intensity: 90,
    },
  };

  const analyzeEmotions = (inputText: string): EmotionAnalysis => {
    // Split into chapters (assuming chapters are separated by chapter markers or significant breaks)
    const chapterPattern =
      /(?:Chapter|CHAPTER|Ch\.|CHapter)\s+\d+|(?:\n\n\n+)/gi;
    const chapters = inputText.split(chapterPattern);
    const emotionsByChapter: Record<number, EmotionData[]> = {};
    const dominantEmotions: Record<string, number> = {};
    const tensionPoints: EmotionAnalysis["tensionPoints"] = [];

    chapters.forEach((chapter, chapterIdx) => {
      emotionsByChapter[chapterIdx] = [];
      const paragraphs = chapter.split(/\n\n+/);
      let wordPosition = 0;

      paragraphs.forEach((para, paraIdx) => {
        const lowerPara = para.toLowerCase();

        Object.entries(emotionKeywords).forEach(([emotion, data]) => {
          let matchCount = 0;
          let totalIntensity = 0;

          data.keywords.forEach((keyword) => {
            const regex = new RegExp(`\\b${keyword}`, "gi");
            const matches = lowerPara.match(regex);
            if (matches) {
              matchCount += matches.length;
            }
          });

          if (matchCount > 0) {
            // Calculate intensity based on keyword count and base intensity
            const intensity = Math.min(100, data.intensity + matchCount * 10);

            emotionsByChapter[chapterIdx].push({
              emotion,
              intensity,
              location: wordPosition + paraIdx * 50,
              chapter: chapterIdx,
            });

            dominantEmotions[emotion] =
              (dominantEmotions[emotion] || 0) + matchCount;

            // Track high tension points
            if (emotion === "tension" && intensity > 80) {
              tensionPoints.push({
                location: wordPosition + paraIdx * 50,
                chapter: chapterIdx,
                intensity,
                description: para.substring(0, 100),
              });
            }
          }
        });

        wordPosition += para.split(/\s+/).length;
      });
    });

    // Calculate emotional arc
    const emotionalArc = Object.keys(emotionsByChapter).map((chapterNum) => {
      const chapterEmotions = emotionsByChapter[Number(chapterNum)];
      const avgIntensity =
        chapterEmotions.length > 0
          ? chapterEmotions.reduce((sum, e) => sum + e.intensity, 0) /
            chapterEmotions.length
          : 0;

      // Find dominant emotion in chapter
      const emotionCounts: Record<string, number> = {};
      chapterEmotions.forEach((e) => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      });

      const dominantEmotion =
        Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "neutral";

      return {
        chapter: Number(chapterNum),
        averageIntensity: Math.round(avgIntensity),
        dominantEmotion,
      };
    });

    return {
      emotionsByChapter,
      dominantEmotions,
      emotionalArc,
      tensionPoints: tensionPoints.sort((a, b) => b.intensity - a.intensity),
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeEmotions(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 700);
  }, [text]);

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      joy: "#fbbf24",
      anger: "#ef4444",
      fear: "#8b5cf6",
      sadness: "#3b82f6",
      love: "#ec4899",
      tension: "#f97316",
      surprise: "#06b6d4",
      disgust: "#84cc16",
      hope: "#10b981",
      despair: "#64748b",
    };
    return colors[emotion] || "#000000";
  };

  const getEmotionIcon = (emotion: string): string => {
    const icons: Record<string, string> = {
      joy: "😊",
      anger: "😠",
      fear: "😨",
      sadness: "😢",
      love: "❤️",
      tension: "⚡",
      surprise: "😲",
      disgust: "🤢",
      hope: "🌟",
      despair: "💔",
    };
    return icons[emotion] || "😐";
  };

  return (
    <div
      className="emotion-tracker-modal"
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
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">💖 Emotion Tracker</h2>
        <button
          onClick={onOpenHelp}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: palette.mutedText,
          }}
          title="Help"
        >
          ?
        </button>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">❤️</div>
          <div className="text-black">Analyzing emotional arcs...</div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Dominant Emotions */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.base,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              🎭 Dominant Emotions
            </h3>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(analysis.dominantEmotions)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([emotion, count]) => (
                  <div
                    key={emotion}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      background: palette.subtle,
                      borderColor: getEmotionColor(emotion),
                    }}
                    onClick={() => setSelectedEmotion(emotion)}
                  >
                    <span className="text-2xl">{getEmotionIcon(emotion)}</span>
                    <div>
                      <div className="font-bold capitalize">{emotion}</div>
                      <div className="text-sm text-black">
                        {count} occurrence{count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Emotional Arc Chart */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.light,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              📊 Emotional Arc
            </h3>
            <div className="space-y-3">
              {analysis.emotionalArc.map((arc, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="text-sm font-bold w-20 text-black">
                    Ch. {arc.chapter + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {getEmotionIcon(arc.dominantEmotion)}
                      </span>
                      <span className="text-sm capitalize text-black">
                        {arc.dominantEmotion}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-4"
                      style={{ background: palette.deep }}
                    >
                      <div
                        className="h-4 rounded-full transition-all"
                        style={{
                          width: `${arc.averageIntensity}%`,
                          backgroundColor: getEmotionColor(arc.dominantEmotion),
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-bold w-12 text-right text-black">
                    {arc.averageIntensity}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tension Points */}
          {analysis.tensionPoints.length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.hover,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                ⚡ High Tension Points ({analysis.tensionPoints.length})
              </h3>
              <div className="space-y-2">
                {analysis.tensionPoints.slice(0, 5).map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded border cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      background: palette.base,
                      borderColor: palette.lightBorder,
                    }}
                    onClick={() => onNavigate && onNavigate(point.location)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-black">
                        Chapter {point.chapter + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-black">
                          Intensity: {point.intensity}%
                        </div>
                        <div
                          className="w-16 h-2 rounded-full"
                          style={{ background: palette.deep }}
                        >
                          <div
                            className="h-2 bg-orange-500 rounded-full"
                            style={{ width: `${point.intensity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-black">
                      {point.description}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.light,
              borderColor: palette.lightBorder,
            }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              💡 Emotional Insights
            </h3>
            <ul className="text-sm space-y-1 text-black">
              {analysis.emotionalArc.length > 5 && (
                <li>
                  • Story has {analysis.emotionalArc.length} emotional sections
                </li>
              )}
              {analysis.tensionPoints.length > 3 && (
                <li>• Multiple high-tension moments drive the narrative</li>
              )}
              {Object.keys(analysis.dominantEmotions).length > 6 && (
                <li>• Rich emotional variety throughout the story</li>
              )}
              {analysis.dominantEmotions.tension > 10 && (
                <li>• High tension sustained throughout - gripping pace</li>
              )}
              {analysis.dominantEmotions.joy >
                analysis.dominantEmotions.sadness && (
                <li>• Overall positive emotional tone</li>
              )}
              {analysis.dominantEmotions.sadness >
                analysis.dominantEmotions.joy && (
                <li>• Story leans toward darker emotional territory</li>
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
