/**
 * Visual Analysis Enhancements
 * Advanced visualization tools for manuscript analysis
 */

export interface EmotionalIntensity {
  position: number; // Character position in text
  intensity: number; // 0-100 emotional intensity
  emotion: string; // Primary emotion detected
  context: string; // Surrounding text
}

export interface EmotionHeatmapResult {
  dataPoints: EmotionalIntensity[];
  averageIntensity: number;
  peaks: EmotionalIntensity[]; // High intensity moments
  valleys: EmotionalIntensity[]; // Low intensity moments
  emotionBreakdown: Map<string, number>; // emotion -> count
  pacingIssues: string[];
}

export interface POVInstance {
  position: number;
  povType: "first" | "second" | "third-limited" | "third-omniscient";
  character: string | null; // POV character if identifiable
  sentence: string;
}

export interface POVConsistencyResult {
  dominantPOV: string;
  povShifts: POVInstance[];
  shiftCount: number;
  consistency: number; // 0-100, higher = more consistent
  potentialHeadHops: POVInstance[];
  recommendations: string[];
}

export interface ClicheInstance {
  cliche: string;
  position: number;
  context: string;
  severity: "mild" | "moderate" | "severe";
  alternative: string;
}

export interface ClicheDetectionResult {
  instances: ClicheInstance[];
  count: number;
  density: number; // Clichés per 1000 words
  categories: Map<string, number>; // Category -> count
}

export interface FilteringWord {
  word: string;
  position: number;
  sentence: string;
  suggestion: string;
}

export interface FilteringWordsResult {
  instances: FilteringWord[];
  count: number;
  density: number;
  byType: Map<string, number>; // Word type -> count
}

export interface BackstorySection {
  start: number;
  end: number;
  length: number;
  indicators: string[]; // Words/phrases that triggered detection
  severity: "light" | "moderate" | "heavy";
}

export interface BackstoryDensityResult {
  sections: BackstorySection[];
  totalBackstoryLength: number;
  percentage: number; // % of manuscript that's backstory
  openingChaptersBackstory: number; // First 3 chapters
  distribution: number[]; // Backstory % per section
  warnings: string[];
}

/**
 * Emotion keywords for intensity detection
 */
const EMOTION_KEYWORDS = {
  joy: [
    "happy",
    "joy",
    "delight",
    "ecstatic",
    "thrilled",
    "cheerful",
    "elated",
    "jubilant",
    "laugh",
    "smile",
    "grin",
    "celebrate",
  ],
  sadness: [
    "sad",
    "sorrow",
    "grief",
    "mourn",
    "cry",
    "weep",
    "tears",
    "despair",
    "heartbreak",
    "melancholy",
    "depressed",
    "miserable",
  ],
  anger: [
    "angry",
    "rage",
    "fury",
    "furious",
    "mad",
    "livid",
    "irate",
    "enraged",
    "hostile",
    "resentment",
    "hatred",
    "wrath",
  ],
  fear: [
    "fear",
    "afraid",
    "scared",
    "terrified",
    "panic",
    "dread",
    "horror",
    "anxiety",
    "nervous",
    "worried",
    "alarmed",
    "frightened",
  ],
  love: [
    "love",
    "adore",
    "cherish",
    "affection",
    "passion",
    "devoted",
    "tender",
    "romantic",
    "intimate",
    "beloved",
    "sweetheart",
    "kiss",
  ],
  tension: [
    "tense",
    "suspense",
    "anticipation",
    "urgent",
    "rush",
    "danger",
    "threat",
    "chase",
    "pursue",
    "escape",
    "conflict",
    "confrontation",
  ],
};

/**
 * Common writing clichés
 */
const CLICHES = [
  {
    phrase: "it was a dark and stormy night",
    category: "opening",
    severity: "severe" as const,
    alternative: "Start with action or a unique atmospheric detail",
  },
  {
    phrase: "eyes sparkled like diamonds",
    category: "description",
    severity: "severe" as const,
    alternative: "Use a fresh, specific comparison",
  },
  {
    phrase: "time stood still",
    category: "description",
    severity: "moderate" as const,
    alternative: "Describe the moment with sensory details",
  },
  {
    phrase: "butterflies in (her|his|their) stomach",
    category: "emotion",
    severity: "moderate" as const,
    alternative: "Show physical sensations uniquely",
  },
  {
    phrase: "heart skipped a beat",
    category: "emotion",
    severity: "moderate" as const,
    alternative: "Describe the physiological response specifically",
  },
  {
    phrase: "a needle in a haystack",
    category: "comparison",
    severity: "mild" as const,
    alternative: "Create a fresh metaphor",
  },
  {
    phrase: "easier said than done",
    category: "idiom",
    severity: "mild" as const,
    alternative: "Show the difficulty through action",
  },
  {
    phrase: "the calm before the storm",
    category: "description",
    severity: "moderate" as const,
    alternative: "Describe the specific atmosphere",
  },
  {
    phrase: "blood ran cold",
    category: "emotion",
    severity: "moderate" as const,
    alternative: "Show fear through unique physical reactions",
  },
  {
    phrase: "white as a ghost",
    category: "description",
    severity: "moderate" as const,
    alternative: "Use a specific, original comparison",
  },
];

/**
 * Filtering words that weaken prose
 */
const FILTERING_WORDS = {
  perception: ["saw", "seen", "see", "sees", "seeing"],
  hearing: ["heard", "hear", "hears", "hearing"],
  thought: [
    "thought",
    "think",
    "thinks",
    "thinking",
    "wondered",
    "wonder",
    "wonders",
    "wondering",
  ],
  feeling: ["felt", "feel", "feels", "feeling"],
  realization: [
    "realized",
    "realize",
    "realizes",
    "realizing",
    "noticed",
    "notice",
    "notices",
    "noticing",
  ],
  watching: ["watched", "watch", "watches", "watching"],
  seeming: [
    "seemed",
    "seem",
    "seems",
    "seeming",
    "appeared",
    "appear",
    "appears",
  ],
};

/**
 * Backstory indicator phrases
 */
const BACKSTORY_INDICATORS = [
  "remembered",
  "recalled",
  "thought back",
  "years ago",
  "months ago",
  "used to",
  "had been",
  "had always",
  "in the past",
  "before",
  "once upon a time",
  "flashback",
  "memory",
  "memories",
];

/**
 * Analyze emotional intensity throughout manuscript
 */
export function analyzeEmotionHeatmap(text: string): EmotionHeatmapResult {
  const dataPoints: EmotionalIntensity[] = [];
  const emotionCounts = new Map<string, number>();

  // Split into chunks (paragraphs or fixed character length)
  const chunkSize = 500; // characters
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, Math.min(i + chunkSize, text.length)));
  }

  let position = 0;

  chunks.forEach((chunk) => {
    const lowerChunk = chunk.toLowerCase();
    let maxIntensity = 0;
    let primaryEmotion = "neutral";

    // Check each emotion category
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      const matches = keywords.filter((keyword) =>
        lowerChunk.includes(keyword)
      ).length;

      const intensity = Math.min(100, matches * 20);

      if (intensity > maxIntensity) {
        maxIntensity = intensity;
        primaryEmotion = emotion;
      }

      if (matches > 0) {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + matches);
      }
    }

    dataPoints.push({
      position,
      intensity: maxIntensity,
      emotion: primaryEmotion,
      context: chunk.substring(0, 100) + "...",
    });

    position += chunkSize;
  });

  // Calculate averages and find peaks/valleys
  const averageIntensity =
    dataPoints.reduce((sum, dp) => sum + dp.intensity, 0) / dataPoints.length ||
    0;

  const peaks = dataPoints
    .filter((dp) => dp.intensity > averageIntensity * 1.5)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 5);

  const valleys = dataPoints
    .filter((dp) => dp.intensity < averageIntensity * 0.5)
    .sort((a, b) => a.intensity - b.intensity)
    .slice(0, 5);

  // Identify pacing issues
  const pacingIssues: string[] = [];

  if (averageIntensity < 20) {
    pacingIssues.push(
      "Overall emotional intensity is low - consider adding more tension"
    );
  }

  if (valleys.length > dataPoints.length * 0.4) {
    pacingIssues.push(
      "Too many low-intensity sections - manuscript may feel flat"
    );
  }

  // Check for monotony (consecutive similar intensities)
  let monotonyCount = 0;
  for (let i = 1; i < dataPoints.length; i++) {
    if (Math.abs(dataPoints[i].intensity - dataPoints[i - 1].intensity) < 10) {
      monotonyCount++;
    }
  }

  if (monotonyCount > dataPoints.length * 0.5) {
    pacingIssues.push("Emotional intensity too consistent - vary the pacing");
  }

  return {
    dataPoints,
    averageIntensity,
    peaks,
    valleys,
    emotionBreakdown: emotionCounts,
    pacingIssues,
  };
}

/**
 * Detect POV consistency and shifts
 */
export function analyzePOVConsistency(text: string): POVConsistencyResult {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const povInstances: POVInstance[] = [];
  const povCounts = new Map<string, number>();

  sentences.forEach((sentence, idx) => {
    const trimmed = sentence.trim().toLowerCase();
    let povType: POVInstance["povType"] | null = null;

    // First person indicators
    if (/\b(i|me|my|mine|we|us|our|ours)\b/.test(trimmed)) {
      povType = "first";
    }
    // Second person indicators (less common in fiction)
    else if (/\byou\b/.test(trimmed) && !/\bthank you\b/.test(trimmed)) {
      povType = "second";
    }
    // Third person omniscient indicators (narrator knows all thoughts)
    else if (
      /\b(everyone|no one|all of them) (knew|thought|felt|realized)\b/.test(
        trimmed
      )
    ) {
      povType = "third-omniscient";
    }
    // Third person limited (default for third person)
    else if (/\b(he|she|they|him|her|them|his|hers|their)\b/.test(trimmed)) {
      povType = "third-limited";
    }

    if (povType) {
      const position = text.indexOf(sentence);
      povInstances.push({
        position,
        povType,
        character: null,
        sentence: sentence.trim(),
      });

      povCounts.set(povType, (povCounts.get(povType) || 0) + 1);
    }
  });

  // Determine dominant POV
  let dominantPOV = "unknown";
  let maxCount = 0;

  for (const [pov, count] of povCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      dominantPOV = pov;
    }
  }

  // Find POV shifts
  const povShifts: POVInstance[] = [];
  for (let i = 1; i < povInstances.length; i++) {
    if (povInstances[i].povType !== povInstances[i - 1].povType) {
      povShifts.push(povInstances[i]);
    }
  }

  // Calculate consistency score
  const consistency = maxCount > 0 ? (maxCount / povInstances.length) * 100 : 0;

  // Detect potential head-hopping (rapid POV changes in same scene)
  const potentialHeadHops: POVInstance[] = [];
  for (let i = 1; i < povShifts.length; i++) {
    const prevShift = povShifts[i - 1];
    const currShift = povShifts[i];

    // If shifts occur within 1000 characters, might be head-hopping
    if (currShift.position - prevShift.position < 1000) {
      potentialHeadHops.push(currShift);
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (consistency < 80) {
    recommendations.push(
      "POV consistency is low - consider sticking to one POV"
    );
  }

  if (potentialHeadHops.length > 0) {
    recommendations.push(
      `${potentialHeadHops.length} potential head-hopping instances detected - maintain POV within scenes`
    );
  }

  if (povShifts.length > 10) {
    recommendations.push(
      "Many POV shifts detected - ensure each shift is intentional"
    );
  }

  return {
    dominantPOV,
    povShifts,
    shiftCount: povShifts.length,
    consistency,
    potentialHeadHops,
    recommendations,
  };
}

/**
 * Detect common writing clichés
 */
export function detectCliches(text: string): ClicheDetectionResult {
  const instances: ClicheInstance[] = [];
  const categories = new Map<string, number>();
  const lowerText = text.toLowerCase();

  CLICHES.forEach((cliche) => {
    const pattern = new RegExp(cliche.phrase, "gi");
    let match;

    while ((match = pattern.exec(lowerText)) !== null) {
      const position = match.index;
      const contextStart = Math.max(0, position - 50);
      const contextEnd = Math.min(text.length, position + 100);
      const context = text.substring(contextStart, contextEnd);

      instances.push({
        cliche: match[0],
        position,
        context,
        severity: cliche.severity,
        alternative: cliche.alternative,
      });

      categories.set(
        cliche.category,
        (categories.get(cliche.category) || 0) + 1
      );
    }
  });

  const wordCount = text.split(/\s+/).length;
  const density = wordCount > 0 ? (instances.length / wordCount) * 1000 : 0;

  return {
    instances,
    count: instances.length,
    density,
    categories,
  };
}

/**
 * Detect filtering words that weaken prose
 */
export function detectFilteringWords(text: string): FilteringWordsResult {
  const instances: FilteringWord[] = [];
  const byType = new Map<string, number>();
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase();

    for (const [type, words] of Object.entries(FILTERING_WORDS)) {
      words.forEach((word) => {
        const pattern = new RegExp(`\\b${word}\\b`, "gi");

        if (pattern.test(lowerSentence)) {
          const position = text.indexOf(sentence);

          let suggestion = "";
          switch (type) {
            case "perception":
              suggestion =
                "Show what is seen directly instead of filtering through 'saw'";
              break;
            case "hearing":
              suggestion = "Present sounds directly instead of 'heard'";
              break;
            case "thought":
              suggestion = "Use italics or close POV to show thoughts directly";
              break;
            case "feeling":
              suggestion =
                "Show emotions through actions and physical sensations";
              break;
            case "realization":
              suggestion = "Show the realization through character reaction";
              break;
            case "watching":
              suggestion = "Describe the action directly";
              break;
            case "seeming":
              suggestion =
                "State what is or describe the appearance specifically";
              break;
          }

          instances.push({
            word,
            position,
            sentence: sentence.trim(),
            suggestion,
          });

          byType.set(type, (byType.get(type) || 0) + 1);
        }
      });
    }
  });

  const wordCount = text.split(/\s+/).length;
  const density = wordCount > 0 ? (instances.length / wordCount) * 1000 : 0;

  return {
    instances,
    count: instances.length,
    density,
    byType,
  };
}

/**
 * Analyze backstory density and distribution
 */
export function analyzeBackstoryDensity(text: string): BackstoryDensityResult {
  const sections: BackstorySection[] = [];
  const lowerText = text.toLowerCase();
  const warnings: string[] = [];

  // Find backstory sections
  let currentSection: BackstorySection | null = null;
  let position = 0;

  const words = text.split(/\s+/);
  const wordsPerSection = 1000; // Check every 1000 words

  for (let i = 0; i < words.length; i += wordsPerSection) {
    const sectionText = words
      .slice(i, Math.min(i + wordsPerSection, words.length))
      .join(" ");
    const sectionLower = sectionText.toLowerCase();

    const indicators: string[] = [];
    let indicatorCount = 0;

    BACKSTORY_INDICATORS.forEach((indicator) => {
      const occurrences = (sectionLower.match(new RegExp(indicator, "g")) || [])
        .length;
      if (occurrences > 0) {
        indicators.push(indicator);
        indicatorCount += occurrences;
      }
    });

    if (indicatorCount > 2) {
      const severity: BackstorySection["severity"] =
        indicatorCount > 8
          ? "heavy"
          : indicatorCount > 4
          ? "moderate"
          : "light";

      sections.push({
        start: position,
        end: position + sectionText.length,
        length: sectionText.length,
        indicators,
        severity,
      });
    }

    position += sectionText.length;
  }

  const totalBackstoryLength = sections.reduce((sum, s) => sum + s.length, 0);
  const percentage = (totalBackstoryLength / text.length) * 100;

  // Check opening chapters (first 20% of manuscript)
  const openingLength = text.length * 0.2;
  const openingBackstory = sections
    .filter((s) => s.start < openingLength)
    .reduce((sum, s) => sum + s.length, 0);
  const openingChaptersBackstory = (openingBackstory / openingLength) * 100;

  // Generate warnings
  if (openingChaptersBackstory > 30) {
    warnings.push(
      "High backstory density in opening (>30%) - consider starting with action"
    );
  }

  if (percentage > 25) {
    warnings.push(
      "Overall backstory percentage high (>25%) - consider weaving in more gradually"
    );
  }

  const heavySections = sections.filter((s) => s.severity === "heavy").length;
  if (heavySections > 3) {
    warnings.push(
      `${heavySections} heavy backstory sections detected - break up exposition`
    );
  }

  // Calculate distribution
  const distribution: number[] = [];
  const segmentCount = 10;
  const segmentSize = text.length / segmentCount;

  for (let i = 0; i < segmentCount; i++) {
    const segmentStart = i * segmentSize;
    const segmentEnd = (i + 1) * segmentSize;

    const segmentBackstory = sections
      .filter((s) => s.start >= segmentStart && s.start < segmentEnd)
      .reduce((sum, s) => sum + s.length, 0);

    distribution.push((segmentBackstory / segmentSize) * 100);
  }

  return {
    sections,
    totalBackstoryLength,
    percentage,
    openingChaptersBackstory,
    distribution,
    warnings,
  };
}
