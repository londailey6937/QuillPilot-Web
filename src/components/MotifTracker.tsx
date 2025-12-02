import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface MotifOccurrence {
  text: string;
  location: number;
  chapter: number;
  context: string;
}

interface Motif {
  pattern: string;
  occurrences: MotifOccurrence[];
  significance: string;
  category: "image" | "phrase" | "symbol" | "theme";
}

interface MotifAnalysis {
  motifs: Motif[];
  recurringPhrases: Array<{ phrase: string; count: number }>;
  symbolism: Record<string, string[]>;
}

interface MotifTrackerProps {
  text: string;
  onClose: () => void;
  onOpenHelp?: () => void;
  onNavigate?: (position: number) => void;
}

export const MotifTracker: React.FC<MotifTrackerProps> = ({
  text,
  onClose,
  onOpenHelp,
  onNavigate,
}) => {
  const [analysis, setAnalysis] = useState<MotifAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getFilterButtonStyle = (active: boolean): React.CSSProperties => ({
    background: active ? palette.accent : palette.base,
    color: active ? "#ffffff" : palette.navy,
    border: `1px solid ${active ? palette.accent : palette.border}`,
  });

  const symbolDatabase: Record<string, string> = {
    light: "enlightenment, hope, knowledge, purity",
    darkness: "ignorance, evil, mystery, the unknown",
    water: "life, cleansing, change, the subconscious",
    fire: "passion, destruction, transformation, energy",
    mirror: "reflection, truth, self-awareness, duality",
    door: "opportunity, transition, choice, threshold",
    window: "perspective, observation, barrier, insight",
    blood: "life force, sacrifice, violence, family ties",
    rose: "love, beauty, passion, secrecy",
    crow: "death, intelligence, transformation, prophecy",
    dove: "peace, innocence, hope, spirit",
    snake: "temptation, danger, wisdom, rebirth",
    tree: "growth, life, connection, stability",
    road: "journey, choice, destiny, progress",
    storm: "conflict, chaos, change, emotional turmoil",
    sunrise: "new beginning, hope, revelation",
    sunset: "ending, reflection, transition",
    moon: "femininity, mystery, cycles, emotion",
    sun: "masculinity, life, power, clarity",
    shadow: "the unknown, fear, hidden aspects, duality",
    bridge: "connection, transition, overcoming obstacles",
    key: "solution, access, knowledge, control",
    sword: "power, conflict, justice, decision",
    heart: "love, emotion, center, compassion",
    chains: "bondage, oppression, limitation, connection",
  };

  const analyzeMotifs = (inputText: string): MotifAnalysis => {
    const chapters = inputText.split(/(?:Chapter|CHAPTER)\s+\d+/gi);
    const motifs: Motif[] = [];
    const phraseCount: Record<string, number> = {};
    const symbolism: Record<string, string[]> = {};

    // Find recurring phrases (3-5 words)
    const words = inputText.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const phrase3 = words.slice(i, i + 3).join(" ");
      const phrase4 = words.slice(i, i + 4).join(" ");
      const phrase5 = words.slice(i, i + 5).join(" ");

      if (phrase3.split(" ").every((w) => w.length > 2)) {
        phraseCount[phrase3] = (phraseCount[phrase3] || 0) + 1;
      }
      if (phrase4.split(" ").every((w) => w.length > 2)) {
        phraseCount[phrase4] = (phraseCount[phrase4] || 0) + 1;
      }
      if (phrase5.split(" ").every((w) => w.length > 2)) {
        phraseCount[phrase5] = (phraseCount[phrase5] || 0) + 1;
      }
    }

    // Filter for significant recurring phrases
    const recurringPhrases = Object.entries(phraseCount)
      .filter(([, count]) => count >= 3)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Detect symbolic imagery
    Object.entries(symbolDatabase).forEach(([symbol, meanings]) => {
      const regex = new RegExp(`\\b${symbol}\\b`, "gi");
      const matches = [...inputText.matchAll(regex)];

      if (matches.length >= 2) {
        const occurrences: MotifOccurrence[] = [];

        matches.forEach((match) => {
          const position = match.index || 0;
          const contextStart = Math.max(0, position - 100);
          const contextEnd = Math.min(inputText.length, position + 100);
          const context = inputText.substring(contextStart, contextEnd);

          // Find chapter
          let chapter = 0;
          let charCount = 0;
          for (let i = 0; i < chapters.length; i++) {
            charCount += chapters[i].length;
            if (charCount > position) {
              chapter = i;
              break;
            }
          }

          occurrences.push({
            text: match[0],
            location: position,
            chapter,
            context,
          });
        });

        motifs.push({
          pattern: symbol,
          occurrences,
          significance: meanings,
          category: "symbol",
        });

        symbolism[symbol] = meanings.split(", ");
      }
    });

    // Detect thematic phrases
    const themeKeywords = {
      identity: ["who am i", "who i am", "true self", "identity", "become"],
      betrayal: ["betrayed", "trust", "loyalty", "deceive", "lie"],
      redemption: ["redeem", "forgive", "atone", "second chance", "salvation"],
      sacrifice: ["sacrifice", "give up", "cost", "price", "lose"],
      power: ["power", "control", "dominate", "authority", "rule"],
      freedom: ["freedom", "free", "escape", "liberty", "independence"],
      revenge: ["revenge", "vengeance", "payback", "retribution"],
      love: ["love", "heart", "feel", "care", "passion"],
      death: ["death", "die", "end", "mortality", "perish"],
      justice: ["justice", "fair", "right", "wrong", "judge"],
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      let themeCount = 0;
      const occurrences: MotifOccurrence[] = [];

      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = [...inputText.matchAll(regex)];
        themeCount += matches.length;

        matches.forEach((match) => {
          const position = match.index || 0;
          const contextStart = Math.max(0, position - 80);
          const contextEnd = Math.min(inputText.length, position + 80);
          const context = inputText.substring(contextStart, contextEnd);

          let chapter = 0;
          let charCount = 0;
          for (let i = 0; i < chapters.length; i++) {
            charCount += chapters[i].length;
            if (charCount > position) {
              chapter = i;
              break;
            }
          }

          occurrences.push({
            text: match[0],
            location: position,
            chapter,
            context,
          });
        });
      });

      if (themeCount >= 5) {
        motifs.push({
          pattern: theme,
          occurrences: occurrences.slice(0, 10),
          significance: `Recurring theme of ${theme}`,
          category: "theme",
        });
      }
    });

    return {
      motifs: motifs.sort(
        (a, b) => b.occurrences.length - a.occurrences.length
      ),
      recurringPhrases,
      symbolism,
    };
  };

  useEffect(() => {
    const getFilterButtonStyle = (active: boolean): React.CSSProperties => ({
      background: active ? palette.accent : palette.base,
      color: active ? "#ffffff" : palette.navy,
      border: `1px solid ${active ? palette.accent : palette.border}`,
    });
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeMotifs(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 700);
  }, [text]);

  const getCategoryStyles = (category: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      symbol: { background: palette.base, borderColor: palette.border },
      theme: { background: palette.subtle, borderColor: palette.lightBorder },
      image: { background: palette.light, borderColor: palette.deep },
      phrase: { background: palette.hover, borderColor: palette.lightBorder },
    };
    return (
      styles[category as keyof typeof styles] || {
        background: palette.base,
        borderColor: palette.border,
      }
    );
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      symbol: "🔮",
      theme: "💭",
      image: "🎨",
      phrase: "💬",
    };
    return icons[category as keyof typeof icons] || "📝";
  };

  const filteredMotifs =
    selectedCategory === "all"
      ? analysis?.motifs
      : analysis?.motifs.filter((m) => m.category === selectedCategory);

  return (
    <div
      className="motif-tracker-modal"
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
        <h2 className="text-2xl font-bold text-black">
          🔮 Motif & Symbol Tracker
        </h2>
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
          <div className="animate-spin text-4xl mb-4">🔮</div>
          <div className="text-gray-600">Tracking motifs and symbols...</div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className="px-4 py-2 rounded transition-colors"
              style={getFilterButtonStyle(selectedCategory === "all")}
            >
              All ({analysis.motifs.length})
            </button>
            {["symbol", "theme", "phrase"].map((cat) => {
              const count = analysis.motifs.filter(
                (m) => m.category === cat
              ).length;
              return count > 0 ? (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded capitalize transition-colors"
                  style={getFilterButtonStyle(selectedCategory === cat)}
                >
                  {getCategoryIcon(cat)} {cat}s ({count})
                </button>
              ) : null;
            })}
          </div>

          {/* Recurring Phrases */}
          {analysis.recurringPhrases.length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                💬 Recurring Phrases
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {analysis.recurringPhrases.slice(0, 10).map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded border text-sm text-black"
                    style={{
                      background: palette.subtle,
                      borderColor: palette.border,
                    }}
                  >
                    <div className="font-semibold">"{phrase.phrase}"</div>
                    <div className="text-xs text-gray-600">
                      {phrase.count} times
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motifs */}
          {filteredMotifs && filteredMotifs.length > 0 ? (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                📚 Detected Motifs ({filteredMotifs.length})
              </h3>
              <div className="space-y-4">
                {filteredMotifs.map((motif, idx) => (
                  <div
                    key={idx}
                    className="border-2 rounded-lg p-4 text-black"
                    style={getCategoryStyles(motif.category)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getCategoryIcon(motif.category)}
                        </span>
                        <div>
                          <h4 className="font-bold text-lg capitalize">
                            {motif.pattern}
                          </h4>
                          <p className="text-sm">{motif.significance}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl">
                          {motif.occurrences.length}
                        </div>
                        <div className="text-xs">occurrences</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {motif.occurrences.slice(0, 3).map((occ, occIdx) => (
                        <div
                          key={occIdx}
                          className="p-2 rounded border cursor-pointer hover:shadow-md transition-shadow"
                          style={{
                            background: palette.subtle,
                            borderColor: palette.lightBorder,
                          }}
                          onClick={() => onNavigate && onNavigate(occ.location)}
                        >
                          <div className="text-xs text-gray-600 mb-1">
                            Chapter {occ.chapter + 1}
                          </div>
                          <div className="text-sm">
                            ...{occ.context.trim()}...
                          </div>
                        </div>
                      ))}
                      {motif.occurrences.length > 3 && (
                        <div className="text-xs text-gray-600 text-center">
                          + {motif.occurrences.length - 3} more occurrences
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No motifs found in selected category
            </div>
          )}

          {/* Symbolism Guide */}
          {Object.keys(analysis.symbolism).length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.subtle,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                🔮 Detected Symbolism
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(analysis.symbolism)
                  .slice(0, 8)
                  .map(([symbol, meanings]) => (
                    <div
                      key={symbol}
                      className="p-3 rounded border"
                      style={{
                        background: palette.base,
                        borderColor: palette.lightBorder,
                      }}
                    >
                      <div className="font-bold capitalize mb-1">{symbol}</div>
                      <div className="text-xs" style={{ color: palette.navy }}>
                        {meanings.join(", ")}
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
              💡 Thematic Insights
            </h3>
            <ul className="text-sm space-y-1" style={{ color: palette.navy }}>
              {analysis.motifs.length > 5 && (
                <li>• Rich symbolic language throughout the narrative</li>
              )}
              {analysis.recurringPhrases.length > 10 && (
                <li>• Strong thematic consistency with recurring phrases</li>
              )}
              {analysis.motifs.filter((m) => m.category === "theme").length >
                3 && <li>• Multiple interweaving themes create depth</li>}
              {Object.keys(analysis.symbolism).length > 5 && (
                <li>• Extensive use of symbolism enhances meaning</li>
              )}
            </ul>
          </div>

          {/* Genre-Specific Tools */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.base,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              🧭 Genre-Specific
            </h3>
            <ul className="text-sm space-y-2" style={{ color: palette.navy }}>
              <li>
                • <strong>Poetry Meter Analyzer:</strong> Scan rhythm and rhyme
                schemes
              </li>
              <li>
                • <strong>Non-Fiction Outline Generator:</strong> Structure
                arguments, evidence
              </li>
              <li>
                • <strong>Academic Citation Manager:</strong> Format references
                in APA/MLA/Chicago
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
