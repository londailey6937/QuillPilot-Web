/**
 * Comprehensive Fiction Elements Analyzer
 * Analyzes 12 core elements that shape fiction writing
 */

export interface FictionElementScore {
  element: string;
  score: number; // 0-100
  presence: "strong" | "moderate" | "weak" | "absent";
  details: string[];
  insights: string[];
}

export interface FictionElementsResult {
  elements: FictionElementScore[];
  overallBalance: number; // 0-100, how well-balanced the elements are
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Analyze all 12 core fiction elements
 */
export function analyzeFictionElements(text: string): FictionElementsResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const elements: FictionElementScore[] = [
    analyzeCharacters(text, lowerText, words),
    analyzeSetting(text, lowerText, words),
    analyzeTime(text, lowerText, words, sentences),
    analyzePlot(text, lowerText, words),
    analyzeConflict(text, lowerText, words),
    analyzeTheme(text, lowerText, words),
    analyzeVoice(text, sentences, paragraphs),
    analyzeGenreElements(lowerText, words),
    analyzeStructure(text, paragraphs, sentences),
    analyzePacing(text, sentences, paragraphs),
    analyzeWorldbuilding(lowerText, words),
    analyzeEmotionalCore(text, lowerText, words),
  ];

  const overallBalance = calculateBalance(elements);
  const strengths = identifyStrengths(elements);
  const weaknesses = identifyWeaknesses(elements);
  const recommendations = generateRecommendations(
    elements,
    strengths,
    weaknesses
  );

  return {
    elements,
    overallBalance,
    strengths,
    weaknesses,
    recommendations,
  };
}

// 1. CHARACTER ANALYSIS
function analyzeCharacters(
  text: string,
  lowerText: string,
  words: string[]
): FictionElementScore {
  const characterIndicators = [
    "protagonist",
    "antagonist",
    "character",
    "hero",
    "villain",
    "friend",
    "ally",
    "enemy",
    "she",
    "he",
    "they",
    "her",
    "his",
    "their",
    "him",
    "them",
  ];

  const arcIndicators = [
    "changed",
    "realized",
    "learned",
    "grew",
    "became",
    "transformed",
    "discovered",
  ];
  const dialogueCount = (text.match(/["']/g) || []).length / 2; // Rough dialogue estimate

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  // Count character-related words
  const charCount = countKeywords(lowerText, characterIndicators);
  score += Math.min(30, charCount * 2);

  // Check for character development
  const arcCount = countKeywords(lowerText, arcIndicators);
  if (arcCount > 3) {
    score += 20;
    insights.push("Character development language detected");
  }

  // Dialogue presence
  if (dialogueCount > 10) {
    score += 15;
    details.push(`~${Math.floor(dialogueCount)} dialogue exchanges`);
  }

  // Proper names (capitalized words that appear multiple times)
  const properNames = extractProperNames(text);
  if (properNames.length > 2) {
    score += 20;
    details.push(`${properNames.length} recurring character names`);
  } else if (properNames.length > 0) {
    score += 10;
    details.push(`${properNames.length} character name(s)`);
  }

  // Character action verbs
  const actionVerbs = [
    "walked",
    "ran",
    "grabbed",
    "looked",
    "turned",
    "spoke",
    "whispered",
    "shouted",
    "smiled",
    "frowned",
  ];
  const actionCount = countKeywords(lowerText, actionVerbs);
  score += Math.min(15, actionCount);

  const presence = getPresenceLevel(score);
  if (score < 40)
    insights.push("Consider deepening character presence and actions");
  if (dialogueCount < 5)
    insights.push("More dialogue could enhance character voice");

  return {
    element: "Characters",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 2. SETTING ANALYSIS
function analyzeSetting(
  text: string,
  lowerText: string,
  words: string[]
): FictionElementScore {
  const locationWords = [
    "room",
    "house",
    "street",
    "city",
    "town",
    "village",
    "forest",
    "mountain",
    "ocean",
    "building",
    "office",
    "home",
    "place",
    "space",
    "world",
    "land",
    "kingdom",
    "planet",
  ];

  const sensoryWords = [
    "smell",
    "scent",
    "odor",
    "aroma",
    "sound",
    "noise",
    "quiet",
    "loud",
    "soft",
    "warm",
    "cold",
    "hot",
    "cool",
    "bright",
    "dark",
    "light",
    "shadow",
    "rough",
    "smooth",
    "soft",
    "hard",
    "texture",
  ];

  const weatherWords = [
    "rain",
    "sun",
    "cloud",
    "wind",
    "storm",
    "snow",
    "fog",
    "mist",
  ];

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const locationCount = countKeywords(lowerText, locationWords);
  score += Math.min(30, locationCount * 3);
  if (locationCount > 5) details.push("Multiple location references");

  const sensoryCount = countKeywords(lowerText, sensoryWords);
  score += Math.min(40, sensoryCount * 4);
  if (sensoryCount > 8) {
    details.push("Rich sensory details");
    insights.push("Strong immersive setting");
  }

  const weatherCount = countKeywords(lowerText, weatherWords);
  if (weatherCount > 2) {
    score += 15;
    details.push("Environmental atmosphere present");
  }

  // Check for specific place descriptions
  const descriptivePatterns =
    /\b(stood|sat|located|nestled|perched|overlooked)\b/g;
  const descriptiveCount = (lowerText.match(descriptivePatterns) || []).length;
  score += Math.min(15, descriptiveCount * 5);

  const presence = getPresenceLevel(score);
  if (score < 40)
    insights.push("Setting could be more vivid—add sensory details");
  if (sensoryCount < 3)
    insights.push("Consider incorporating more sensory descriptions");

  return {
    element: "Setting",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 3. TIME ANALYSIS
function analyzeTime(
  text: string,
  lowerText: string,
  words: string[],
  sentences: string[]
): FictionElementScore {
  const timeWords = [
    "morning",
    "afternoon",
    "evening",
    "night",
    "dawn",
    "dusk",
    "midnight",
    "noon",
    "yesterday",
    "today",
    "tomorrow",
    "now",
    "then",
    "later",
    "earlier",
    "before",
    "after",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
    "century",
  ];

  const timeTransitions = [
    "meanwhile",
    "later",
    "earlier",
    "suddenly",
    "eventually",
    "finally",
    "soon",
  ];
  const pastTenseMarkers = /\b(was|were|had|did|went|came|saw)\b/g;
  const presentTenseMarkers = /\b(is|are|has|does|goes|comes|sees)\b/g;

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const timeCount = countKeywords(lowerText, timeWords);
  score += Math.min(35, timeCount * 3);
  if (timeCount > 5) details.push("Clear temporal markers");

  const transitionCount = countKeywords(lowerText, timeTransitions);
  score += Math.min(25, transitionCount * 8);
  if (transitionCount > 2) {
    details.push("Time transitions present");
    insights.push("Good temporal flow");
  }

  // Tense consistency check
  const pastCount = (lowerText.match(pastTenseMarkers) || []).length;
  const presentCount = (lowerText.match(presentTenseMarkers) || []).length;
  const dominantTense = pastCount > presentCount ? "past" : "present";
  const tenseRatio =
    Math.min(pastCount, presentCount) / Math.max(pastCount, presentCount, 1);

  if (tenseRatio > 0.3 && sentences.length > 10) {
    insights.push("Mixed tenses detected—verify this is intentional");
  } else {
    score += 20;
    details.push(`Consistent ${dominantTense} tense`);
  }

  // Duration indicators
  if (lowerText.includes("years") || lowerText.includes("months")) {
    score += 10;
    details.push("Long time span indicated");
  }

  const presence = getPresenceLevel(score);
  if (score < 40) insights.push("Add more temporal context to ground readers");

  return {
    element: "Time",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 4. PLOT ANALYSIS
function analyzePlot(
  text: string,
  lowerText: string,
  words: string[]
): FictionElementScore {
  const incitingWords = [
    "suddenly",
    "unexpected",
    "discovered",
    "arrived",
    "appeared",
    "broke",
    "changed",
  ];
  const tensionWords = [
    "but",
    "however",
    "although",
    "despite",
    "yet",
    "still",
    "nevertheless",
  ];
  const climaxWords = [
    "finally",
    "ultimate",
    "confronted",
    "faced",
    "battle",
    "showdown",
    "moment",
  ];
  const resolutionWords = [
    "resolved",
    "ended",
    "concluded",
    "finished",
    "peace",
    "finally",
    "at last",
  ];

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const incitingCount = countKeywords(lowerText, incitingWords);
  if (incitingCount > 0) {
    score += 20;
    details.push("Inciting events present");
  }

  const tensionCount = countKeywords(lowerText, tensionWords);
  score += Math.min(30, tensionCount * 3);
  if (tensionCount > 5) insights.push("Good use of complication and contrast");

  const climaxCount = countKeywords(lowerText, climaxWords);
  if (climaxCount > 0) {
    score += 25;
    details.push("Climactic moments detected");
  }

  const resolutionCount = countKeywords(lowerText, resolutionWords);
  if (resolutionCount > 0) {
    score += 15;
    details.push("Resolution elements present");
  }

  // Action density
  const actionVerbs = [
    "grabbed",
    "ran",
    "jumped",
    "fought",
    "escaped",
    "chased",
    "attacked",
    "defended",
  ];
  const actionCount = countKeywords(lowerText, actionVerbs);
  score += Math.min(10, actionCount * 2);

  const presence = getPresenceLevel(score);
  if (score < 40) insights.push("Plot structure could be more defined");
  if (incitingCount === 0)
    insights.push("Consider a stronger inciting incident");

  return {
    element: "Plot",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 5. CONFLICT ANALYSIS
function analyzeConflict(
  text: string,
  lowerText: string,
  words: string[]
): FictionElementScore {
  const conflictWords = [
    "fight",
    "struggle",
    "conflict",
    "battle",
    "argue",
    "disagree",
    "oppose",
    "resist",
    "against",
    "versus",
    "enemy",
    "threat",
    "danger",
    "problem",
    "obstacle",
    "challenge",
  ];

  const emotionalConflict = [
    "torn",
    "conflicted",
    "confused",
    "uncertain",
    "doubt",
    "fear",
    "anger",
    "frustration",
  ];
  const tensionWords = ["tension", "pressure", "stress", "strain", "anxiety"];

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const conflictCount = countKeywords(lowerText, conflictWords);
  score += Math.min(40, conflictCount * 4);
  if (conflictCount > 5) {
    details.push("Strong external conflict");
    insights.push("Clear antagonistic forces");
  }

  const emotionalCount = countKeywords(lowerText, emotionalConflict);
  score += Math.min(30, emotionalCount * 5);
  if (emotionalCount > 3) {
    details.push("Internal conflict present");
    insights.push("Good psychological depth");
  }

  const tensionCount = countKeywords(lowerText, tensionWords);
  if (tensionCount > 2) {
    score += 20;
    details.push("Tension explicitly developed");
  }

  // Dialogue conflict (questions and exclamations often indicate conflict)
  const questions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  if (questions + exclamations > 5) {
    score += 10;
    details.push("Dramatic dialogue present");
  }

  const presence = getPresenceLevel(score);
  if (score < 40)
    insights.push(
      "Conflict could be more pronounced—what opposes the protagonist?"
    );
  if (emotionalCount === 0 && conflictCount === 0) {
    insights.push("Consider adding both internal and external conflict");
  }

  return {
    element: "Conflict",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 6. THEME ANALYSIS (simplified - full version exists in themeAnalyzer.ts)
function analyzeTheme(
  text: string,
  lowerText: string,
  words: string[]
): FictionElementScore {
  const themeWords = [
    "love",
    "death",
    "truth",
    "justice",
    "freedom",
    "power",
    "identity",
    "hope",
    "loss",
    "redemption",
    "sacrifice",
    "betrayal",
    "loyalty",
    "honor",
    "change",
  ];

  const symbolWords = [
    "symbol",
    "represent",
    "metaphor",
    "meaning",
    "significance",
  ];

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const themeCount = countKeywords(lowerText, themeWords);
  score += Math.min(50, themeCount * 4);

  // Find which themes appear
  const detectedThemes = themeWords.filter((theme) =>
    lowerText.includes(theme)
  );
  if (detectedThemes.length > 0) {
    details.push(`Themes: ${detectedThemes.slice(0, 3).join(", ")}`);
    if (detectedThemes.length > 3) {
      insights.push("Multiple thematic threads detected");
    }
  }

  const symbolCount = countKeywords(lowerText, symbolWords);
  if (symbolCount > 0) {
    score += 25;
    details.push("Symbolic language present");
  }

  // Repetition check (thematic words appearing multiple times)
  const wordFrequency: Record<string, number> = {};
  words.forEach((word) => {
    if (word.length > 5) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });

  const repeatedWords = Object.entries(wordFrequency).filter(
    ([_, count]) => count > 3
  ).length;

  if (repeatedWords > 2) {
    score += 25;
    insights.push("Recurring concepts suggest thematic depth");
  }

  const presence = getPresenceLevel(score);
  if (score < 40)
    insights.push(
      "Theme could be more developed through recurring symbols or ideas"
    );

  return {
    element: "Theme",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 7. VOICE ANALYSIS
function analyzeVoice(
  text: string,
  sentences: string[],
  paragraphs: string[]
): FictionElementScore {
  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  // Sentence length variation
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
  const avgLength =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce(
      (sum, len) => sum + Math.pow(len - avgLength, 2),
      0
    ) / sentenceLengths.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 8) {
    score += 25;
    details.push("Varied sentence rhythm");
    insights.push("Good sentence-level pacing");
  } else if (stdDev < 4) {
    insights.push("Sentence length is very consistent—consider varying rhythm");
    score += 10;
  } else {
    score += 20;
  }

  // First vs third person detection
  const firstPerson = (text.match(/\b(I|me|my|we|us|our)\b/gi) || []).length;
  const thirdPerson = (text.match(/\b(he|she|they|him|her|them)\b/gi) || [])
    .length;

  if (firstPerson > thirdPerson) {
    details.push("First person narration");
    score += 20;
  } else if (thirdPerson > firstPerson) {
    details.push("Third person narration");
    score += 20;
  }

  // Distinctive word choices
  const lowerText = text.toLowerCase();
  const sophisticatedWords = [
    "ephemeral",
    "ubiquitous",
    "ineffable",
    "serendipity",
    "melancholy",
    "luminous",
  ];
  const sophisticatedCount = countKeywords(lowerText, sophisticatedWords);

  if (avgLength > 20) {
    score += 15;
    details.push("Lyrical, complex style");
  } else if (avgLength < 12) {
    score += 15;
    details.push("Concise, minimalist style");
  } else {
    score += 20;
    details.push("Balanced prose style");
  }

  // Imagery and vivid language
  const imageryWords = ["like", "as if", "seemed", "appeared", "resembled"];
  const imageryCount = countKeywords(lowerText, imageryWords);
  if (imageryCount > 3) {
    score += 20;
    details.push("Rich in simile and metaphor");
  }

  const presence = getPresenceLevel(score);

  return {
    element: "Voice",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 8. GENRE ELEMENTS (simplified - full version in tropeAnalyzer.ts)
function analyzeGenreElements(
  lowerText: string,
  words: string[]
): FictionElementScore {
  const genres: Record<string, string[]> = {
    Fantasy: [
      "magic",
      "spell",
      "dragon",
      "wizard",
      "sword",
      "kingdom",
      "quest",
    ],
    SciFi: [
      "space",
      "ship",
      "alien",
      "technology",
      "future",
      "robot",
      "planet",
    ],
    Romance: ["love", "heart", "kiss", "passion", "romance", "together"],
    Thriller: ["danger", "threat", "chase", "escape", "suspect", "murder"],
    Horror: [
      "fear",
      "terror",
      "scream",
      "blood",
      "dark",
      "monster",
      "nightmare",
    ],
    Mystery: [
      "clue",
      "detective",
      "investigate",
      "suspect",
      "mystery",
      "solve",
    ],
  };

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  let maxCount = 0;
  let dominantGenre = "General Fiction";

  Object.entries(genres).forEach(([genre, keywords]) => {
    const count = countKeywords(lowerText, keywords);
    if (count > maxCount) {
      maxCount = count;
      dominantGenre = genre;
    }
  });

  if (maxCount > 5) {
    score += 60;
    details.push(`Strong ${dominantGenre} elements`);
    insights.push(`Clear genre markers for ${dominantGenre}`);
  } else if (maxCount > 2) {
    score += 40;
    details.push(`${dominantGenre} indicators present`);
  } else {
    score += 20;
    details.push("Genre-neutral or literary fiction");
    insights.push("No dominant genre markers—intentional?");
  }

  // Multiple genre blending
  const genreCounts = Object.entries(genres)
    .map(([genre, keywords]) => ({
      genre,
      count: countKeywords(lowerText, keywords),
    }))
    .filter((g) => g.count > 2);

  if (genreCounts.length > 1) {
    score += 20;
    insights.push(
      `Genre blending detected: ${genreCounts.map((g) => g.genre).join(", ")}`
    );
  }

  const presence = getPresenceLevel(score);

  return {
    element: "Genre & Subgenre",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 9. STRUCTURE ANALYSIS
function analyzeStructure(
  text: string,
  paragraphs: string[],
  sentences: string[]
): FictionElementScore {
  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const paraCount = paragraphs.length;
  const sentCount = sentences.length;

  // Paragraph organization
  if (paraCount > 5) {
    score += 25;
    details.push(`${paraCount} paragraphs`);
  } else {
    score += 15;
    details.push(`${paraCount} paragraph(s)`);
    if (paraCount < 3)
      insights.push("Consider breaking into more paragraphs for readability");
  }

  // Scene breaks (often indicated by paragraph spacing)
  const longGaps = text.split(/\n\n\n+/).length - 1;
  if (longGaps > 0) {
    score += 15;
    details.push(`${longGaps} scene break(s)`);
  }

  // Beginning, middle, end structure
  const thirds = Math.floor(sentCount / 3);
  if (sentCount > 15) {
    score += 30;
    insights.push("Sufficient length for three-act structure");
  } else {
    score += 20;
  }

  // Sentence variety within structure
  const avgParaLength = sentCount / paraCount;
  if (avgParaLength > 3 && avgParaLength < 8) {
    score += 20;
    details.push("Balanced paragraph density");
  } else if (avgParaLength > 8) {
    score += 10;
    insights.push("Long paragraphs—consider varying length for rhythm");
  } else {
    score += 15;
    details.push("Short, punchy paragraphs");
  }

  // Chapter or section markers
  if (text.includes("Chapter") || text.includes("CHAPTER")) {
    score += 10;
    details.push("Chapter divisions present");
  }

  const presence = getPresenceLevel(score);

  return {
    element: "Structure",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 10. PACING ANALYSIS (simplified - full version in spacingInsights.ts)
function analyzePacing(
  text: string,
  sentences: string[],
  paragraphs: string[]
): FictionElementScore {
  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
  const avgSentenceLength =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;

  // Fast-paced indicators
  const shortSentences = sentenceLengths.filter((len) => len < 10).length;
  const longSentences = sentenceLengths.filter((len) => len > 25).length;

  if (shortSentences > sentences.length * 0.4) {
    score += 30;
    details.push("Fast pacing (short sentences)");
    insights.push("Brisk narrative momentum");
  } else if (longSentences > sentences.length * 0.3) {
    score += 25;
    details.push("Slow, immersive pacing");
    insights.push("Contemplative, detailed style");
  } else {
    score += 35;
    details.push("Varied pacing");
    insights.push("Good balance of speed and detail");
  }

  // Action vs description balance
  const lowerText = text.toLowerCase();
  const actionWords = [
    "ran",
    "jumped",
    "grabbed",
    "rushed",
    "burst",
    "exploded",
    "attacked",
  ];
  const descriptiveWords = [
    "was",
    "were",
    "seemed",
    "appeared",
    "looked",
    "felt",
  ];

  const actionCount = countKeywords(lowerText, actionWords);
  const descriptiveCount = countKeywords(lowerText, descriptiveWords);

  if (actionCount > descriptiveCount) {
    score += 25;
    details.push("Action-driven pacing");
  } else if (descriptiveCount > actionCount * 2) {
    score += 20;
    details.push("Description-heavy pacing");
    insights.push("Consider adding more active scenes");
  } else {
    score += 30;
    details.push("Balanced action and description");
  }

  // Dialogue as pacing tool
  const dialogueMarkers = (text.match(/["']/g) || []).length / 2;
  if (dialogueMarkers > 10) {
    score += 10;
    insights.push("Dialogue adds dynamic pacing");
  }

  const presence = getPresenceLevel(score);

  return {
    element: "Pacing",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 11. WORLDBUILDING ANALYSIS
function analyzeWorldbuilding(
  lowerText: string,
  words: string[]
): FictionElementScore {
  const worldWords = [
    "kingdom",
    "empire",
    "city",
    "world",
    "realm",
    "land",
    "nation",
    "planet",
    "culture",
    "society",
    "people",
    "custom",
    "tradition",
    "law",
    "rule",
    "magic",
    "technology",
    "system",
    "power",
    "energy",
    "force",
  ];

  const historyWords = [
    "ancient",
    "history",
    "legend",
    "myth",
    "past",
    "once",
    "ago",
    "before",
  ];
  const cultureWords = [
    "ritual",
    "ceremony",
    "belief",
    "religion",
    "god",
    "worship",
    "sacred",
  ];

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const worldCount = countKeywords(lowerText, worldWords);
  score += Math.min(40, worldCount * 3);
  if (worldCount > 8) {
    details.push("Rich world description");
    insights.push("Detailed worldbuilding present");
  }

  const historyCount = countKeywords(lowerText, historyWords);
  if (historyCount > 3) {
    score += 25;
    details.push("Historical depth");
  }

  const cultureCount = countKeywords(lowerText, cultureWords);
  if (cultureCount > 2) {
    score += 20;
    details.push("Cultural elements");
  }

  // Proper nouns (places, systems, etc.)
  const capitalWords = (lowerText.match(/[A-Z][a-z]+/g) || []).length;
  if (capitalWords > 10) {
    score += 15;
    details.push("Multiple named entities");
  }

  const presence = getPresenceLevel(score);
  if (score < 30) {
    insights.push(
      "Worldbuilding is minimal—appropriate for realistic or character-driven fiction"
    );
  }
  if (worldCount === 0) {
    details.push("Contemporary or minimal setting");
  }

  return {
    element: "Worldbuilding",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// 12. EMOTIONAL CORE ANALYSIS
function analyzeEmotionalCore(
  text: string,
  lowerText: string,
  words: string[]
): FictionElementScore {
  const emotionWords = [
    "love",
    "hate",
    "fear",
    "joy",
    "sadness",
    "anger",
    "hope",
    "despair",
    "happy",
    "sad",
    "afraid",
    "angry",
    "worried",
    "excited",
    "nervous",
    "relieved",
    "grief",
    "pain",
    "suffering",
    "comfort",
    "warmth",
    "tenderness",
  ];

  const empathyWords = [
    "felt",
    "understood",
    "realized",
    "knew",
    "sensed",
    "recognized",
  ];
  const vulnerabilityWords = [
    "vulnerable",
    "weak",
    "exposed",
    "raw",
    "broken",
    "hurt",
    "wounded",
  ];
  const connectionWords = [
    "together",
    "alone",
    "connected",
    "apart",
    "bond",
    "relationship",
  ];

  let score = 0;
  const details: string[] = [];
  const insights: string[] = [];

  const emotionCount = countKeywords(lowerText, emotionWords);
  score += Math.min(40, emotionCount * 3);
  if (emotionCount > 8) {
    details.push("Strong emotional content");
    insights.push("Rich emotional landscape");
  } else if (emotionCount < 3) {
    insights.push(
      "Limited emotional language—consider deepening character feelings"
    );
  }

  const empathyCount = countKeywords(lowerText, empathyWords);
  if (empathyCount > 3) {
    score += 25;
    details.push("Emotional awareness present");
  }

  const vulnerabilityCount = countKeywords(lowerText, vulnerabilityWords);
  if (vulnerabilityCount > 0) {
    score += 20;
    details.push("Emotional vulnerability shown");
    insights.push("Characters reveal authentic humanity");
  }

  const connectionCount = countKeywords(lowerText, connectionWords);
  if (connectionCount > 2) {
    score += 15;
    details.push("Relationship focus");
  }

  // Internal monologue (often indicates emotional depth)
  const thoughtWords = [
    "thought",
    "wondered",
    "considered",
    "realized",
    "remembered",
  ];
  const thoughtCount = countKeywords(lowerText, thoughtWords);
  if (thoughtCount > 3) {
    score += 10;
    insights.push("Internal reflection adds depth");
  }

  const presence = getPresenceLevel(score);
  if (score < 40) {
    insights.push(
      "Emotional core could be strengthened—what do characters truly feel?"
    );
  }

  return {
    element: "Emotional Core",
    score: Math.min(100, score),
    presence,
    details,
    insights,
  };
}

// HELPER FUNCTIONS

function countKeywords(text: string, keywords: string[]): number {
  let count = 0;
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, "gi");
    count += (text.match(regex) || []).length;
  });
  return count;
}

function extractProperNames(text: string): string[] {
  const words = text.split(/\s+/);
  const nameFrequency: Record<string, number> = {};

  words.forEach((word) => {
    // Capitalized words that aren't at start of sentences
    if (/^[A-Z][a-z]{2,}$/.test(word) && word.length > 3) {
      nameFrequency[word] = (nameFrequency[word] || 0) + 1;
    }
  });

  // Names appearing 2+ times
  return Object.entries(nameFrequency)
    .filter(([_, count]) => count >= 2)
    .map(([name]) => name);
}

function getPresenceLevel(
  score: number
): "strong" | "moderate" | "weak" | "absent" {
  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "weak";
  return "absent";
}

function calculateBalance(elements: FictionElementScore[]): number {
  const scores = elements.map((e) => e.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) /
    scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = better balance
  // Convert to 0-100 score where 100 is perfect balance
  const balanceScore = Math.max(0, 100 - stdDev * 2);
  return Math.round(balanceScore);
}

function identifyStrengths(elements: FictionElementScore[]): string[] {
  return elements
    .filter((e) => e.score >= 70)
    .map((e) => e.element)
    .slice(0, 3);
}

function identifyWeaknesses(elements: FictionElementScore[]): string[] {
  return elements
    .filter((e) => e.score < 40)
    .map((e) => e.element)
    .slice(0, 3);
}

function generateRecommendations(
  elements: FictionElementScore[],
  strengths: string[],
  weaknesses: string[]
): string[] {
  const recommendations: string[] = [];

  if (strengths.length > 0) {
    recommendations.push(
      `Strong elements: ${strengths.join(", ")}. Build on these strengths.`
    );
  }

  if (weaknesses.length > 0) {
    recommendations.push(
      `Focus areas: ${weaknesses.join(", ")}. These elements need development.`
    );
  }

  // Specific recommendations based on weak elements
  elements.forEach((element) => {
    if (element.score < 40 && element.insights.length > 0) {
      recommendations.push(...element.insights.slice(0, 1));
    }
  });

  // Balance recommendation
  const balance = calculateBalance(elements);
  if (balance < 60) {
    recommendations.push(
      "Consider balancing narrative elements more evenly across all categories."
    );
  }

  return recommendations.slice(0, 5);
}
