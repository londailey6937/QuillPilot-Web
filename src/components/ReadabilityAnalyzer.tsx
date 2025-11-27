import React from "react";

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
}

export const ReadabilityAnalyzer: React.FC<ReadabilityAnalyzerProps> = ({
  text,
  onClose,
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
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 30) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: number): string => {
    if (grade <= 8) return "text-green-600";
    if (grade <= 12) return "text-yellow-600";
    if (grade <= 16) return "text-orange-600";
    return "text-red-600";
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
        background: "#fef5e7",
        border: "2px solid #e0c392",
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
        <h2 className="text-2xl font-bold text-gray-800">
          📊 Readability Metrics
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-600 mb-1">Total Words</div>
          <div className="text-3xl font-bold text-blue-600">
            {metrics.totalWords.toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Reading Time</div>
          <div className="text-3xl font-bold text-purple-600">
            {metrics.readingTime}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Flesch Reading Ease */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="font-bold text-lg mb-2">📖 Flesch Reading Ease</h3>
          <div className="flex items-center justify-between mb-2">
            <div
              className={`text-3xl font-bold ${getScoreColor(
                metrics.fleschReadingEase
              )}`}
            >
              {metrics.fleschReadingEase}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Reading Level:</div>
              <div className="font-bold text-gray-800">
                {metrics.readingLevel}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.fleschReadingEase)}%` }}
            />
          </div>
          <div className="text-xs text-gray-600">
            100 = Very Easy | 60-70 = Standard | 0 = Very Difficult
          </div>
        </div>

        {/* Flesch-Kincaid Grade Level */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h3 className="font-bold text-lg mb-2">🎓 Flesch-Kincaid Grade</h3>
          <div className="flex items-center justify-between">
            <div
              className={`text-3xl font-bold ${getGradeColor(
                metrics.fleschKincaidGrade
              )}`}
            >
              {metrics.fleschKincaidGrade}
            </div>
            <div className="text-sm text-gray-600">
              U.S. school grade level required to understand the text
            </div>
          </div>
        </div>

        {/* Gunning Fog Index */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="font-bold text-lg mb-2">🌫️ Gunning Fog Index</h3>
          <div className="flex items-center justify-between">
            <div
              className={`text-3xl font-bold ${getGradeColor(
                metrics.gunningFogIndex
              )}`}
            >
              {metrics.gunningFogIndex}
            </div>
            <div className="text-sm text-gray-600">
              Years of formal education needed
            </div>
          </div>
        </div>

        {/* SMOG Index */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-teal-50 to-cyan-50">
          <h3 className="font-bold text-lg mb-2">📚 SMOG Index</h3>
          <div className="flex items-center justify-between">
            <div
              className={`text-3xl font-bold ${getGradeColor(
                metrics.smogIndex
              )}`}
            >
              {metrics.smogIndex}
            </div>
            <div className="text-sm text-gray-600">
              Grade level for 100% comprehension
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-lg mb-3">📈 Detailed Statistics</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Total Sentences:</span>
              <span className="font-bold ml-2">{metrics.totalSentences}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Syllables:</span>
              <span className="font-bold ml-2">{metrics.totalSyllables}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Words/Sentence:</span>
              <span className="font-bold ml-2">
                {metrics.averageWordsPerSentence}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Avg Syllables/Word:</span>
              <span className="font-bold ml-2">
                {metrics.averageSyllablesPerWord}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Complex Words (3+ syl):</span>
              <span className="font-bold ml-2">{metrics.complexWords}</span>
            </div>
            <div>
              <span className="text-gray-600">Complex Word %:</span>
              <span className="font-bold ml-2">
                {Math.round((metrics.complexWords / metrics.totalWords) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-lg mb-2 text-blue-900">
            💡 Recommendations
          </h3>
          <ul className="text-sm space-y-2">
            {metrics.averageWordsPerSentence > 25 && (
              <li className="text-gray-700">
                • Shorten sentences (average is{" "}
                {metrics.averageWordsPerSentence} words)
              </li>
            )}
            {metrics.complexWords / metrics.totalWords > 0.15 && (
              <li className="text-gray-700">
                • Reduce complex words for easier reading
              </li>
            )}
            {metrics.fleschReadingEase < 50 && (
              <li className="text-gray-700">
                • Text is difficult - consider simplifying language
              </li>
            )}
            {metrics.fleschKincaidGrade > 12 && (
              <li className="text-gray-700">
                • Grade level is high - consider your target audience
              </li>
            )}
            {metrics.averageWordsPerSentence <= 15 &&
              metrics.fleschReadingEase >= 70 && (
                <li className="text-green-700">
                  ✓ Text is clear and easy to read!
                </li>
              )}
          </ul>
        </div>
      </div>
    </div>
  );
};
