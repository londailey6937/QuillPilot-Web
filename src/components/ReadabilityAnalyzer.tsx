import React from "react";
import { creamPalette as palette } from "../styles/palette";

interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFogIndex: number;
  smogIndex: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  totalSentences: number;
  totalWords: number;
  totalSyllables: number;
  complexWords: number;
  readingLevel: string;
  readingTime: string;
}

interface ReadabilityAnalyzerProps {
  text: string;
  onClose: () => void;
  onOpenHelp?: () => void;
}

export const ReadabilityAnalyzer: React.FC<ReadabilityAnalyzerProps> = ({
  text,
  onClose,
  onOpenHelp,
}) => {
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");

    const syllableMatches = word.match(/[aeiouy]{1,2}/g);
    return syllableMatches ? syllableMatches.length : 1;
  };

  const calculateMetrics = (inputText: string): ReadabilityMetrics => {
    // Split into sentences
    const sentences = inputText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const totalSentences = sentences.length;

    // Split into words
    const words = inputText
      .split(/\s+/)
      .filter((w) => w.trim().length > 0)
      .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
      .filter((w) => w.length > 0);
    const totalWords = words.length;

    // Count syllables
    let totalSyllables = 0;
    let complexWords = 0; // Words with 3+ syllables
    words.forEach((word) => {
      const syllables = countSyllables(word);
      totalSyllables += syllables;
      if (syllables >= 3) complexWords++;
    });

    const averageWordsPerSentence = totalWords / totalSentences;
    const averageSyllablesPerWord = totalSyllables / totalWords;

    // Flesch Reading Ease (0-100, higher = easier)
    const fleschReadingEase =
      206.835 -
      1.015 * averageWordsPerSentence -
      84.6 * averageSyllablesPerWord;

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade =
      0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;

    // Gunning Fog Index
    const percentComplexWords = (complexWords / totalWords) * 100;
    const gunningFogIndex =
      0.4 * (averageWordsPerSentence + percentComplexWords);

    // SMOG Index
    const smogIndex =
      1.043 * Math.sqrt(complexWords * (30 / totalSentences)) + 3.1291;

    // Determine reading level
    let readingLevel = "";
    if (fleschReadingEase >= 90) readingLevel = "5th Grade";
    else if (fleschReadingEase >= 80) readingLevel = "6th Grade";
    else if (fleschReadingEase >= 70) readingLevel = "7th Grade";
    else if (fleschReadingEase >= 60) readingLevel = "8th-9th Grade";
    else if (fleschReadingEase >= 50) readingLevel = "10th-12th Grade";
    else if (fleschReadingEase >= 30) readingLevel = "College";
    else readingLevel = "College Graduate";

    // Calculate reading time (average adult reads 238 words per minute)
    const readingTimeMinutes = Math.ceil(totalWords / 238);
    const readingTime =
      readingTimeMinutes < 1 ? "< 1 min" : `${readingTimeMinutes} min`;

    return {
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      gunningFogIndex: Math.round(gunningFogIndex * 10) / 10,
      smogIndex: Math.round(smogIndex * 10) / 10,
      averageSentenceLength: Math.round(averageWordsPerSentence * 10) / 10,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100,
      totalSentences,
      totalWords,
      totalSyllables,
      complexWords,
      readingLevel,
      readingTime,
    };
  };

  const metrics = calculateMetrics(text);

  const getScoreColor = (score: number): string => {
    if (score >= 70) return palette.navy;
    if (score >= 50) return palette.warning;
    if (score >= 30) return palette.info;
    return palette.danger;
  };

  const getGradeColor = (grade: number): string => {
    if (grade <= 8) return palette.navy;
    if (grade <= 12) return palette.warning;
    if (grade <= 16) return palette.info;
    return palette.danger;
  };

  return (
    <div
      className="readability-analyzer-modal"
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
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#111827]">
          📊 Readability Metrics
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="p-4 rounded-lg border"
          style={{ background: palette.base, borderColor: palette.border }}
        >
          <div className="text-sm text-[#111827] mb-1">Total Words</div>
          <div className="text-3xl font-bold" style={{ color: palette.accent }}>
            {metrics.totalWords.toLocaleString()}
          </div>
        </div>
        <div
          className="p-4 rounded-lg border"
          style={{ background: palette.subtle, borderColor: palette.border }}
        >
          <div className="text-sm text-[#111827] mb-1">Reading Time</div>
          <div className="text-3xl font-bold" style={{ color: palette.navy }}>
            {metrics.readingTime}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Flesch Reading Ease */}
        <div
          className="border rounded-lg p-4"
          style={{ background: palette.base, borderColor: palette.border }}
        >
          <h3 className="font-bold text-lg mb-2 text-[#111827]">
            📖 Flesch Reading Ease
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div
              className="text-3xl font-bold"
              style={{ color: getScoreColor(metrics.fleschReadingEase) }}
            >
              {metrics.fleschReadingEase}
            </div>
            <div className="text-right">
              <div className="text-sm text-[#111827]">Reading Level:</div>
              <div className="font-bold text-[#111827]">
                {metrics.readingLevel}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(100, metrics.fleschReadingEase)}%`,
                background: palette.accent,
              }}
            />
          </div>
          <div className="text-xs text-[#111827]">
            100 = Very Easy | 60-70 = Standard | 0 = Very Difficult
          </div>
        </div>

        {/* Flesch-Kincaid Grade Level */}
        <div
          className="border rounded-lg p-4"
          style={{ background: palette.subtle, borderColor: palette.border }}
        >
          <h3 className="font-bold text-lg mb-2 text-[#111827]">
            🎓 Flesch-Kincaid Grade
          </h3>
          <div className="flex items-center justify-between">
            <div
              className="text-3xl font-bold"
              style={{ color: getGradeColor(metrics.fleschKincaidGrade) }}
            >
              {metrics.fleschKincaidGrade}
            </div>
            <div className="text-sm text-[#111827]">
              U.S. school grade level required to understand the text
            </div>
          </div>
        </div>

        {/* Gunning Fog Index */}
        <div
          className="border rounded-lg p-4"
          style={{ background: palette.base, borderColor: palette.border }}
        >
          <h3 className="font-bold text-lg mb-2 text-[#111827]">
            🌫️ Gunning Fog Index
          </h3>
          <div className="flex items-center justify-between">
            <div
              className="text-3xl font-bold"
              style={{ color: getGradeColor(metrics.gunningFogIndex) }}
            >
              {metrics.gunningFogIndex}
            </div>
            <div className="text-sm text-[#111827]">
              Years of formal education needed
            </div>
          </div>
        </div>

        {/* SMOG Index */}
        <div
          className="border rounded-lg p-4"
          style={{ background: palette.subtle, borderColor: palette.border }}
        >
          <h3 className="font-bold text-lg mb-2 text-[#111827]">
            📚 SMOG Index
          </h3>
          <div className="flex items-center justify-between">
            <div
              className="text-3xl font-bold"
              style={{ color: getGradeColor(metrics.smogIndex) }}
            >
              {metrics.smogIndex}
            </div>
            <div className="text-sm text-[#111827]">
              Grade level for 100% comprehension
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div
          className="border rounded-lg p-4"
          style={{ background: palette.base, borderColor: palette.border }}
        >
          <h3 className="font-bold text-lg mb-3 text-[#111827]">
            📈 Detailed Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#111827]">Total Sentences:</span>
              <span className="font-bold ml-2 text-[#111827]">
                {metrics.totalSentences}
              </span>
            </div>
            <div>
              <span className="text-[#111827]">Total Syllables:</span>
              <span className="font-bold ml-2 text-[#111827]">
                {metrics.totalSyllables}
              </span>
            </div>
            <div>
              <span className="text-[#111827]">Avg Words/Sentence:</span>
              <span className="font-bold ml-2 text-[#111827]">
                {metrics.averageWordsPerSentence}
              </span>
            </div>
            <div>
              <span className="text-[#111827]">Avg Syllables/Word:</span>
              <span className="font-bold ml-2 text-[#111827]">
                {metrics.averageSyllablesPerWord}
              </span>
            </div>
            <div>
              <span className="text-[#111827]">Complex Words (3+ syl):</span>
              <span className="font-bold ml-2 text-[#111827]">
                {metrics.complexWords}
              </span>
            </div>
            <div>
              <span className="text-[#111827]">Complex Word %:</span>
              <span className="font-bold ml-2 text-[#111827]">
                {Math.round((metrics.complexWords / metrics.totalWords) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div
          className="border rounded-lg p-4"
          style={{ background: palette.light, borderColor: palette.border }}
        >
          <h3 className="font-bold text-lg mb-2 text-[#111827]">
            💡 Recommendations
          </h3>
          <ul className="text-sm space-y-2">
            {metrics.averageWordsPerSentence > 25 && (
              <li className="text-[#111827]">
                • Shorten sentences (average is{" "}
                {metrics.averageWordsPerSentence} words)
              </li>
            )}
            {metrics.complexWords / metrics.totalWords > 0.15 && (
              <li className="text-[#111827]">
                • Reduce complex words for easier reading
              </li>
            )}
            {metrics.fleschReadingEase < 50 && (
              <li className="text-[#111827]">
                • Text is difficult - consider simplifying language
              </li>
            )}
            {metrics.fleschKincaidGrade > 12 && (
              <li className="text-[#111827]">
                • Grade level is high - consider your target audience
              </li>
            )}
            {metrics.averageWordsPerSentence <= 15 &&
              metrics.fleschReadingEase >= 70 && (
                <li style={{ color: palette.success }}>
                  ✓ Text is clear and easy to read!
                </li>
              )}
          </ul>
        </div>
      </div>
    </div>
  );
};
