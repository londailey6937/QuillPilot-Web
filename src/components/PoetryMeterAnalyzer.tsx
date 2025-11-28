import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface MeterPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

interface RhymeScheme {
  scheme: string;
  pattern: string[];
  quality: "perfect" | "slant" | "eye";
}

interface PoetryAnalysis {
  lineCount: number;
  stanzaCount: number;
  meterAnalysis: {
    dominantMeter: string;
    confidence: number;
    linePatterns: Array<{ line: string; pattern: string; feet: number }>;
  };
  rhymeScheme: RhymeScheme[];
  syllableCount: number[];
  musicalDevices: {
    alliteration: string[];
    assonance: string[];
    consonance: string[];
  };
}

interface PoetryMeterAnalyzerProps {
  text: string;
  onClose: () => void;
}

export const PoetryMeterAnalyzer: React.FC<PoetryMeterAnalyzerProps> = ({
  text,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<PoetryAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const meterPatterns: MeterPattern[] = [
    {
      name: "Iambic",
      pattern: "unstressed-STRESSED",
      description: "da-DUM (like a heartbeat)",
      example: "Shall I compare thee to a summer's day?",
    },
    {
      name: "Trochaic",
      pattern: "STRESSED-unstressed",
      description: "DUM-da (opposite of iambic)",
      example: "Tiger, tiger, burning bright",
    },
    {
      name: "Anapestic",
      pattern: "unstressed-unstressed-STRESSED",
      description: "da-da-DUM (galloping rhythm)",
      example: "'Twas the night before Christmas",
    },
    {
      name: "Dactylic",
      pattern: "STRESSED-unstressed-unstressed",
      description: "DUM-da-da (waltz-like)",
      example: "This is the forest primeval",
    },
    {
      name: "Spondaic",
      pattern: "STRESSED-STRESSED",
      description: "DUM-DUM (emphasis)",
      example: "Stop! Look!",
    },
  ];

  const analyzePoetry = (inputText: string): PoetryAnalysis => {
    const lines = inputText
      .split(/\n/)
      .filter((line) => line.trim().length > 0);
    const stanzas = inputText.split(/\n\n+/).filter((s) => s.trim().length > 0);

    // Syllable counting (simplified)
    const countSyllables = (word: string): number => {
      word = word.toLowerCase().replace(/[^a-z]/g, "");
      if (word.length <= 3) return 1;
      const vowels = word.match(/[aeiouy]+/g);
      let count = vowels ? vowels.length : 0;
      if (word.endsWith("e")) count--;
      return Math.max(1, count);
    };

    // Analyze syllable count per line
    const syllableCount = lines.map((line) => {
      const words = line.split(/\s+/);
      return words.reduce((sum, word) => sum + countSyllables(word), 0);
    });

    // Detect meter patterns
    const linePatterns = lines.slice(0, 20).map((line) => {
      const syllables = syllableCount[lines.indexOf(line)];
      let pattern = "Free Verse";
      let feet = 0;

      // Detect common meters by syllable count
      if (syllables === 10) {
        pattern = "Iambic Pentameter";
        feet = 5;
      } else if (syllables === 14) {
        pattern = "Iambic Heptameter";
        feet = 7;
      } else if (syllables === 8) {
        pattern = "Iambic Tetrameter";
        feet = 4;
      } else if (syllables === 12) {
        pattern = "Iambic Hexameter";
        feet = 6;
      } else if (syllables % 2 === 0) {
        pattern = "Likely Iambic";
        feet = syllables / 2;
      } else if (syllables % 3 === 0) {
        pattern = "Possibly Anapestic/Dactylic";
        feet = syllables / 3;
      }

      return { line, pattern, feet };
    });

    // Determine dominant meter
    const patternCounts: Record<string, number> = {};
    linePatterns.forEach((lp) => {
      patternCounts[lp.pattern] = (patternCounts[lp.pattern] || 0) + 1;
    });
    const dominantMeter =
      Object.entries(patternCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "Free Verse";
    const confidence =
      ((patternCounts[dominantMeter] || 0) / linePatterns.length) * 100;

    // Detect rhyme scheme
    const getLastWord = (line: string): string => {
      const words = line.trim().split(/\s+/);
      return words[words.length - 1].toLowerCase().replace(/[^a-z]/g, "");
    };

    const rhymeSounds = (word1: string, word2: string): boolean => {
      if (word1.length < 2 || word2.length < 2) return false;
      const end1 = word1.slice(-2);
      const end2 = word2.slice(-2);
      return end1 === end2 || word1.slice(-3) === word2.slice(-3);
    };

    const rhymeScheme: RhymeScheme[] = [];
    const schemeLetters: string[] = [];
    let currentLetter = 65; // 'A'

    lines.slice(0, 20).forEach((line, idx) => {
      const lastWord = getLastWord(line);
      let foundRhyme = false;

      for (let i = 0; i < idx; i++) {
        const prevWord = getLastWord(lines[i]);
        if (rhymeSounds(lastWord, prevWord)) {
          schemeLetters[idx] = schemeLetters[i];
          foundRhyme = true;
          break;
        }
      }

      if (!foundRhyme) {
        schemeLetters[idx] = String.fromCharCode(currentLetter++);
      }
    });

    // Group rhyme scheme by stanzas
    let currentStanza: string[] = [];
    lines.slice(0, 20).forEach((line, idx) => {
      currentStanza.push(schemeLetters[idx]);
      if (line.trim() === "" || idx === lines.length - 1) {
        if (currentStanza.length > 0) {
          rhymeScheme.push({
            scheme: currentStanza.join(""),
            pattern: currentStanza,
            quality: "perfect",
          });
        }
        currentStanza = [];
      }
    });

    // Detect musical devices
    const alliteration: string[] = [];
    const assonance: string[] = [];
    const consonance: string[] = [];

    lines.forEach((line) => {
      const words = line.toLowerCase().split(/\s+/);

      // Alliteration (same starting consonant)
      for (let i = 0; i < words.length - 1; i++) {
        if (
          words[i][0] === words[i + 1][0] &&
          /[bcdfghjklmnpqrstvwxyz]/.test(words[i][0])
        ) {
          alliteration.push(`${words[i]} ${words[i + 1]}`);
        }
      }

      // Assonance (repeated vowel sounds)
      const vowelPattern = /[aeiou]+/g;
      words.forEach((word) => {
        const vowels = word.match(vowelPattern);
        if (vowels && vowels.length >= 2) {
          assonance.push(word);
        }
      });
    });

    return {
      lineCount: lines.length,
      stanzaCount: stanzas.length,
      meterAnalysis: {
        dominantMeter,
        confidence,
        linePatterns,
      },
      rhymeScheme,
      syllableCount,
      musicalDevices: {
        alliteration: alliteration.slice(0, 10),
        assonance: assonance.slice(0, 10),
        consonance: consonance.slice(0, 10),
      },
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzePoetry(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 800);
  }, [text]);

  return (
    <div
      className="poetry-analyzer-modal"
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
          📖 Poetry Meter Analyzer
        </h2>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">📖</div>
          <div className="text-gray-600">Analyzing rhythm and rhyme...</div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div className="text-sm" style={{ color: palette.mutedText }}>
                Lines
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: palette.navy }}
              >
                {analysis.lineCount}
              </div>
            </div>
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div className="text-sm" style={{ color: palette.mutedText }}>
                Stanzas
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: palette.navy }}
              >
                {analysis.stanzaCount}
              </div>
            </div>
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div className="text-sm" style={{ color: palette.mutedText }}>
                Avg Syllables
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: palette.navy }}
              >
                {(
                  analysis.syllableCount.reduce((a, b) => a + b, 0) /
                  analysis.syllableCount.length
                ).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Meter Analysis */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              🎵 Meter Analysis
            </h3>
            <div
              className="mb-4 p-3 rounded border"
              style={{
                background: palette.base,
                borderColor: palette.lightBorder,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div
                    className="font-bold text-lg"
                    style={{ color: palette.navy }}
                  >
                    {analysis.meterAnalysis.dominantMeter}
                  </div>
                  <div className="text-sm" style={{ color: palette.mutedText }}>
                    Dominant meter pattern
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: palette.accent }}
                  >
                    {analysis.meterAnalysis.confidence.toFixed(0)}%
                  </div>
                  <div className="text-xs" style={{ color: palette.mutedText }}>
                    confidence
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="font-semibold mb-2"
                style={{ color: palette.navy }}
              >
                Line-by-Line Analysis:
              </div>
              {analysis.meterAnalysis.linePatterns
                .slice(0, 8)
                .map((lp, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded border text-sm"
                    style={{
                      background: palette.base,
                      borderColor: palette.lightBorder,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1" style={{ color: palette.navy }}>
                        {lp.line}
                      </div>
                      <div
                        className="text-xs font-semibold ml-2 px-2 py-1 rounded"
                        style={{
                          background: palette.hover,
                          color: palette.navy,
                        }}
                      >
                        {lp.pattern}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Rhyme Scheme */}
          {analysis.rhymeScheme.length > 0 && (
            <div
              className="border rounded-lg p-4"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <h3 className="font-bold text-lg mb-3 text-black">
                🎭 Rhyme Scheme
              </h3>
              <div className="space-y-2">
                {analysis.rhymeScheme.map((rs, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded border"
                    style={{
                      background: palette.subtle,
                      borderColor: palette.lightBorder,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: palette.accent }}
                      >
                        {rs.scheme}
                      </div>
                      <div className="text-sm" style={{ color: palette.navy }}>
                        Stanza {idx + 1} • {rs.pattern.length} lines
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Musical Devices */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.light,
              borderColor: palette.lightBorder,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              🎼 Musical Devices
            </h3>
            <div className="space-y-3">
              {analysis.musicalDevices.alliteration.length > 0 && (
                <div>
                  <div
                    className="font-semibold mb-1"
                    style={{ color: palette.navy }}
                  >
                    Alliteration:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.musicalDevices.alliteration.map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          background: palette.base,
                          border: `1px solid ${palette.border}`,
                          color: palette.navy,
                        }}
                      >
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meter Reference Guide */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              📚 Meter Reference Guide
            </h3>
            <div className="space-y-2">
              {meterPatterns.map((meter, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border text-sm"
                  style={{
                    background: palette.base,
                    borderColor: palette.lightBorder,
                    color: palette.navy,
                  }}
                >
                  <div className="font-bold">{meter.name}:</div>
                  <div>{meter.description}</div>
                  <div
                    className="text-xs italic"
                    style={{ color: palette.mutedText }}
                  >
                    Example: "{meter.example}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
