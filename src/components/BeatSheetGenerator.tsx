import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface StoryBeat {
  name: string;
  description: string;
  location: number;
  excerpt: string;
  expectedPosition: number; // percentage of story
  actualPosition: number; // percentage of story
  confidence: number; // 0-100
}

interface BeatSheetAnalysis {
  structure: "three-act" | "five-act" | "hero-journey" | "unknown";
  beats: StoryBeat[];
  totalWords: number;
  pacing: {
    act1: number;
    act2: number;
    act3: number;
  };
  recommendations: string[];
}

interface BeatSheetGeneratorProps {
  text: string;
  onClose: () => void;
  onNavigate?: (position: number) => void;
}

export const BeatSheetGenerator: React.FC<BeatSheetGeneratorProps> = ({
  text,
  onClose,
  onNavigate,
}) => {
  const [analysis, setAnalysis] = useState<BeatSheetAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [structureType, setStructureType] = useState<
    "three-act" | "five-act" | "hero-journey"
  >("three-act");
  const structureButtonStyle = (active: boolean): React.CSSProperties => ({
    background: active ? palette.accent : palette.base,
    color: active ? "#ffffff" : palette.navy,
    border: `1px solid ${active ? palette.accent : palette.border}`,
  });

  const detectStoryBeats = (
    inputText: string,
    structure: "three-act" | "five-act" | "hero-journey"
  ): BeatSheetAnalysis => {
    const words = inputText.split(/\s+/);
    const totalWords = words.length;
    const beats: StoryBeat[] = [];

    // Define beat patterns for different structures
    const beatPatterns: Record<
      string,
      Array<{
        name: string;
        description: string;
        keywords: string[];
        position: number;
      }>
    > = {
      "three-act": [
        {
          name: "Opening Image",
          description: "The beginning of the story",
          keywords: ["begin", "start", "first", "once", "introduce"],
          position: 0,
        },
        {
          name: "Inciting Incident",
          description: "Event that sets the story in motion",
          keywords: [
            "sudden",
            "unexpected",
            "arrived",
            "discovered",
            "learned",
            "revealed",
            "changed",
            "when",
          ],
          position: 12,
        },
        {
          name: "Lock In / Point of No Return",
          description: "Protagonist commits to the journey",
          keywords: [
            "decided",
            "must",
            "had to",
            "committed",
            "agreed",
            "couldn't",
            "no choice",
          ],
          position: 25,
        },
        {
          name: "Midpoint",
          description: "Major turning point or revelation",
          keywords: [
            "realized",
            "discovered",
            "truth",
            "everything changed",
            "understood",
            "revelation",
            "twist",
          ],
          position: 50,
        },
        {
          name: "All Is Lost",
          description: "Lowest point for the protagonist",
          keywords: [
            "failed",
            "lost",
            "defeated",
            "hopeless",
            "death",
            "destroyed",
            "never",
            "impossible",
          ],
          position: 75,
        },
        {
          name: "Climax",
          description: "Final confrontation",
          keywords: [
            "final",
            "last",
            "confronted",
            "faced",
            "battle",
            "showdown",
            "ultimate",
          ],
          position: 88,
        },
        {
          name: "Resolution",
          description: "Story wraps up",
          keywords: [
            "finally",
            "end",
            "at last",
            "peace",
            "settled",
            "concluded",
            "ever after",
          ],
          position: 95,
        },
      ],
      "five-act": [
        {
          name: "Exposition",
          description: "Setting and character introduction",
          keywords: ["introduce", "lived", "was", "known", "ordinary"],
          position: 0,
        },
        {
          name: "Rising Action",
          description: "Conflict develops",
          keywords: [
            "began",
            "started",
            "conflict",
            "problem",
            "tension",
            "complicated",
          ],
          position: 20,
        },
        {
          name: "Climax",
          description: "Highest point of action",
          keywords: [
            "peak",
            "highest",
            "most",
            "critical",
            "crucial",
            "decisive",
          ],
          position: 50,
        },
        {
          name: "Falling Action",
          description: "Aftermath of climax",
          keywords: ["after", "following", "consequence", "result", "outcome"],
          position: 75,
        },
        {
          name: "Denouement",
          description: "Resolution and conclusion",
          keywords: ["finally", "end", "concluded", "settled", "peace"],
          position: 90,
        },
      ],
      "hero-journey": [
        {
          name: "Ordinary World",
          description: "Hero's normal life",
          keywords: ["ordinary", "normal", "usual", "everyday", "routine"],
          position: 0,
        },
        {
          name: "Call to Adventure",
          description: "Hero receives a challenge",
          keywords: ["call", "summon", "quest", "mission", "challenge"],
          position: 10,
        },
        {
          name: "Refusal of the Call",
          description: "Hero hesitates",
          keywords: ["refused", "hesitated", "doubt", "fear", "uncertain"],
          position: 15,
        },
        {
          name: "Meeting the Mentor",
          description: "Hero finds guidance",
          keywords: [
            "mentor",
            "teacher",
            "guide",
            "wisdom",
            "learned",
            "taught",
          ],
          position: 20,
        },
        {
          name: "Crossing the Threshold",
          description: "Hero enters the special world",
          keywords: ["crossed", "entered", "journey", "left", "ventured"],
          position: 25,
        },
        {
          name: "Tests, Allies, Enemies",
          description: "Hero faces challenges",
          keywords: [
            "test",
            "trial",
            "challenge",
            "ally",
            "enemy",
            "friend",
            "foe",
          ],
          position: 40,
        },
        {
          name: "Ordeal",
          description: "Greatest challenge",
          keywords: [
            "ordeal",
            "crisis",
            "death",
            "greatest",
            "hardest",
            "worst",
          ],
          position: 60,
        },
        {
          name: "Reward",
          description: "Hero seizes the prize",
          keywords: ["reward", "prize", "gained", "won", "achieved"],
          position: 70,
        },
        {
          name: "The Road Back",
          description: "Hero returns to ordinary world",
          keywords: ["return", "back", "home", "journey back"],
          position: 80,
        },
        {
          name: "Resurrection",
          description: "Final test",
          keywords: [
            "final",
            "last",
            "ultimate",
            "reborn",
            "transformed",
            "changed",
          ],
          position: 90,
        },
        {
          name: "Return with Elixir",
          description: "Hero brings back wisdom",
          keywords: ["wisdom", "lesson", "changed", "growth", "treasure"],
          position: 95,
        },
      ],
    };

    const patterns = beatPatterns[structure];

    // Search for beats
    patterns.forEach((pattern) => {
      let bestMatch: {
        position: number;
        excerpt: string;
        score: number;
      } | null = null;
      const expectedWordPosition = (pattern.position / 100) * totalWords;
      const searchStart = Math.max(
        0,
        Math.floor(expectedWordPosition - totalWords * 0.1)
      );
      const searchEnd = Math.min(
        totalWords,
        Math.floor(expectedWordPosition + totalWords * 0.1)
      );

      for (let i = searchStart; i < searchEnd; i++) {
        const contextStart = Math.max(0, i - 50);
        const contextEnd = Math.min(totalWords, i + 50);
        const context = words.slice(contextStart, contextEnd).join(" ");
        const lowerContext = context.toLowerCase();

        let score = 0;
        pattern.keywords.forEach((keyword) => {
          if (lowerContext.includes(keyword)) {
            score += 10;
            // Bonus for proximity to expected position
            const distanceFromExpected = Math.abs(i - expectedWordPosition);
            const proximityBonus = Math.max(
              0,
              10 - (distanceFromExpected / totalWords) * 100
            );
            score += proximityBonus;
          }
        });

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = {
            position: i,
            excerpt: context.substring(0, 200),
            score,
          };
        }
      }

      if (bestMatch) {
        beats.push({
          name: pattern.name,
          description: pattern.description,
          location: bestMatch.position,
          excerpt: bestMatch.excerpt,
          expectedPosition: pattern.position,
          actualPosition: (bestMatch.position / totalWords) * 100,
          confidence: Math.min(100, bestMatch.score * 2),
        });
      }
    });

    // Calculate pacing
    const act1End = totalWords * 0.25;
    const act2End = totalWords * 0.75;
    const act1Words = Math.floor(act1End);
    const act2Words = Math.floor(act2End - act1End);
    const act3Words = Math.floor(totalWords - act2End);

    const recommendations: string[] = [];

    // Analyze structure
    if (beats.length < patterns.length * 0.5) {
      recommendations.push(
        "Consider adding more clear story beats to strengthen structure"
      );
    }

    beats.forEach((beat) => {
      const deviation = Math.abs(beat.actualPosition - beat.expectedPosition);
      if (deviation > 15) {
        recommendations.push(
          `"${beat.name}" may be positioned unusually (expected ~${
            beat.expectedPosition
          }%, found at ${Math.round(beat.actualPosition)}%)`
        );
      }
    });

    // Check act balance
    const act1Percent = (act1Words / totalWords) * 100;
    const act2Percent = (act2Words / totalWords) * 100;
    if (act1Percent > 30) {
      recommendations.push("Act 1 may be too long - consider tightening setup");
    }
    if (act2Percent < 40) {
      recommendations.push(
        "Act 2 may be too short - consider expanding conflict development"
      );
    }

    return {
      structure,
      beats: beats.sort((a, b) => a.location - b.location),
      totalWords,
      pacing: {
        act1: act1Words,
        act2: act2Words,
        act3: act3Words,
      },
      recommendations,
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = detectStoryBeats(text, structureType);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 800);
  }, [text, structureType]);

  return (
    <div
      className="beat-sheet-modal"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fef5e7",
        border: "2px solid #e0c392",
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
          📖 Beat Sheet Generator
        </h2>
      </div>

      {/* Structure Type Selector */}
      <div className="mb-4">
        <div className="text-sm text-black mb-2">Story Structure:</div>
        <div className="flex gap-2">
          <button
            onClick={() => setStructureType("three-act")}
            className="px-4 py-2 rounded transition-colors"
            style={structureButtonStyle(structureType === "three-act")}
          >
            Three-Act
          </button>
          <button
            onClick={() => setStructureType("five-act")}
            className="px-4 py-2 rounded transition-colors"
            style={structureButtonStyle(structureType === "five-act")}
          >
            Five-Act
          </button>
          <button
            onClick={() => setStructureType("hero-journey")}
            className="px-4 py-2 rounded transition-colors"
            style={structureButtonStyle(structureType === "hero-journey")}
          >
            Hero's Journey
          </button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <div className="text-gray-600">Analyzing story structure...</div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Story Timeline */}
          <div
            className="border rounded-lg p-4"
            style={{ background: palette.base, borderColor: palette.border }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              📊 Story Timeline
            </h3>
            <div
              className="relative h-16 rounded-lg overflow-hidden"
              style={{
                background: palette.base,
                border: `2px solid ${palette.border}`,
              }}
            >
              {analysis.beats.map((beat, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 w-1 transition-all cursor-pointer"
                  style={{
                    left: `${beat.actualPosition}%`,
                    background: palette.accent,
                  }}
                  title={`${beat.name} (${Math.round(beat.actualPosition)}%)`}
                  onClick={() => onNavigate && onNavigate(beat.location)}
                >
                  <div
                    className="absolute top-full mt-1 text-xs whitespace-nowrap transform -translate-x-1/2 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity"
                    style={{
                      background: palette.navy,
                      color: "#ffffff",
                    }}
                  >
                    {beat.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Pacing Breakdown */}
          <div
            className="border rounded-lg p-4"
            style={{ background: palette.subtle, borderColor: palette.border }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              ⏱️ Pacing Analysis
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: palette.navy }}
                >
                  {Math.round(
                    (analysis.pacing.act1 / analysis.totalWords) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-black">Act 1 (Setup)</div>
                <div className="text-xs text-black">
                  {analysis.pacing.act1.toLocaleString()} words
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: palette.navy }}
                >
                  {Math.round(
                    (analysis.pacing.act2 / analysis.totalWords) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-black">Act 2 (Conflict)</div>
                <div className="text-xs text-black">
                  {analysis.pacing.act2.toLocaleString()} words
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: palette.navy }}
                >
                  {Math.round(
                    (analysis.pacing.act3 / analysis.totalWords) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-black">Act 3 (Resolution)</div>
                <div className="text-xs text-black">
                  {analysis.pacing.act3.toLocaleString()} words
                </div>
              </div>
            </div>
          </div>

          {/* Story Beats */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-black">
              🎬 Detected Story Beats
            </h3>
            <div className="space-y-3">
              {analysis.beats.map((beat, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  style={{
                    background: palette.base,
                    borderColor: palette.border,
                  }}
                  onClick={() => onNavigate && onNavigate(beat.location)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-black">{beat.name}</h4>
                      <p className="text-sm text-black">{beat.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-black">
                        {Math.round(beat.actualPosition)}%
                      </div>
                      <div className="text-xs text-black">
                        Confidence: {beat.confidence}%
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-sm p-2 rounded border"
                    style={{
                      background: palette.subtle,
                      borderColor: palette.lightBorder,
                    }}
                  >
                    {beat.excerpt}...
                  </div>
                  {Math.abs(beat.actualPosition - beat.expectedPosition) >
                    10 && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: palette.info }}
                    >
                      ⚠️ Expected around {beat.expectedPosition}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{ background: palette.light, borderColor: palette.border }}
            >
              <h3 className="font-bold text-lg mb-2 text-black">
                💡 Recommendations
              </h3>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
