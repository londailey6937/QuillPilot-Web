/**
 * Advanced Metrics Analyzer
 * Dialogue-to-Narrative Ratio, Scene vs Sequel, Conflict Tracking, Sensory Balance
 */

export interface DialogueNarrativeRatio {
  totalWords: number;
  dialogueWords: number;
  descriptionWords: number;
  actionWords: number;
  dialoguePercentage: number;
  descriptionPercentage: number;
  actionPercentage: number;
  genreTarget: {
    genre: string;
    idealDialogue: number;
    idealDescription: number;
    idealAction: number;
  };
  balance: "excellent" | "good" | "needs-adjustment";
  recommendations: string[];
}

export interface SceneSequel {
  type: "scene" | "sequel";
  start: number;
  end: number;
  length: number;
  indicators: string[];
  intensity: number; // 0-100
}

export interface SceneSequelResult {
  scenes: SceneSequel[];
  sequels: SceneSequel[];
  sceneCount: number;
  sequelCount: number;
  sceneToSequelRatio: number;
  averageSceneLength: number;
  averageSequelLength: number;
  balance: "excellent" | "good" | "unbalanced";
  recommendations: string[];
}

export interface ConflictInstance {
  type: "internal" | "external" | "interpersonal";
  position: number;
  intensity: number; // 0-100
  description: string;
  resolved: boolean;
}

export interface ConflictTrackingResult {
  conflicts: ConflictInstance[];
  totalConflicts: number;
  internalCount: number;
  externalCount: number;
  interpersonalCount: number;
  averageIntensity: number;
  conflictDensity: number; // Conflicts per 1000 words
  lowConflictSections: number[]; // Positions with low conflict
  resolutionPoints: number[]; // Where conflicts resolve
  recommendations: string[];
}

export interface SensoryInstance {
  sense: "sight" | "sound" | "touch" | "smell" | "taste";
  word: string;
  position: number;
  context: string;
}

export interface SensoryBalanceResult {
  instances: SensoryInstance[];
  sightCount: number;
  soundCount: number;
  touchCount: number;
  smellCount: number;
  tasteCount: number;
  total: number;
  sightPercentage: number;
  soundPercentage: number;
  touchPercentage: number;
  smellPercentage: number;
  tastePercentage: number;
  balance: "excellent" | "good" | "visual-heavy" | "needs-variety";
  recommendations: string[];
}

/**
 * Genre-specific dialogue/description/action targets
 */
const GENRE_TARGETS: Record<
  string,
  { dialogue: number; description: number; action: number }
> = {
  thriller: { dialogue: 30, description: 20, action: 50 },
  romance: { dialogue: 45, description: 35, action: 20 },
  mystery: { dialogue: 35, description: 30, action: 35 },
  fantasy: { dialogue: 30, description: 45, action: 25 },
  scifi: { dialogue: 30, description: 40, action: 30 },
  horror: { dialogue: 25, description: 35, action: 40 },
  literary: { dialogue: 35, description: 50, action: 15 },
  historical: { dialogue: 35, description: 45, action: 20 },
  general: { dialogue: 35, description: 35, action: 30 },
};

/**
 * Scene indicators (action, goal-oriented)
 */
const SCENE_INDICATORS = [
  "grabbed",
  "ran",
  "jumped",
  "fought",
  "attacked",
  "chased",
  "escaped",
  "confronted",
  "demanded",
  "shouted",
  "charged",
  "fired",
  "struck",
  "burst",
  "lunged",
  "rushed",
  "sprinted",
  "slammed",
];

/**
 * Sequel indicators (reaction, reflection, decision)
 */
const SEQUEL_INDICATORS = [
  "thought",
  "wondered",
  "considered",
  "realized",
  "remembered",
  "reflected",
  "decided",
  "resolved",
  "understood",
  "contemplated",
  "pondered",
  "felt",
  "emotion",
  "reaction",
  "processing",
];

/**
 * Conflict keywords
 */
const CONFLICT_KEYWORDS = {
  internal: [
    "doubt",
    "fear",
    "guilt",
    "shame",
    "anxiety",
    "struggle",
    "torn",
    "conflicted",
    "wrestled",
    "battled with himself",
    "battled with herself",
    "inner turmoil",
    "conscience",
  ],
  external: [
    "obstacle",
    "barrier",
    "enemy",
    "threat",
    "danger",
    "battle",
    "war",
    "fight",
    "attack",
    "storm",
    "challenge",
    "opposition",
  ],
  interpersonal: [
    "argued",
    "disagreed",
    "quarrel",
    "dispute",
    "tension",
    "clash",
    "confrontation",
    "rivalry",
    "jealousy",
    "betrayal",
    "conflict",
    "against",
  ],
};

/**
 * Sensory words
 */
const SENSORY_WORDS = {
  sight: [
    "saw",
    "looked",
    "watched",
    "glanced",
    "stared",
    "glimpsed",
    "observed",
    "noticed",
    "visible",
    "bright",
    "dark",
    "color",
    "shadow",
    "light",
    "glow",
    "shimmer",
    "sparkle",
    "gleam",
    "glitter",
    "shine",
  ],
  sound: [
    "heard",
    "listened",
    "sound",
    "noise",
    "whisper",
    "shout",
    "scream",
    "cry",
    "voice",
    "echo",
    "bang",
    "crash",
    "thud",
    "click",
    "hum",
    "buzz",
    "ring",
    "roar",
    "silence",
    "quiet",
  ],
  touch: [
    "touched",
    "felt",
    "grabbed",
    "held",
    "rough",
    "smooth",
    "soft",
    "hard",
    "cold",
    "hot",
    "warm",
    "cool",
    "texture",
    "pressure",
    "grip",
    "squeeze",
    "brush",
    "stroke",
    "tap",
    "pat",
  ],
  smell: [
    "smelled",
    "scent",
    "odor",
    "aroma",
    "fragrance",
    "perfume",
    "stench",
    "stink",
    "whiff",
    "sniff",
    "musty",
    "fresh",
    "sweet",
    "pungent",
    "acrid",
    "smoky",
  ],
  taste: [
    "tasted",
    "flavor",
    "sweet",
    "bitter",
    "sour",
    "salty",
    "savory",
    "spicy",
    "bland",
    "delicious",
    "tongue",
    "mouth",
    "palate",
    "ate",
    "drank",
  ],
};

/**
 * Analyze dialogue-to-narrative ratio
 */
export function analyzeDialogueNarrativeRatio(
  text: string,
  genre: string = "general"
): DialogueNarrativeRatio {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length;

  // Extract dialogue (text in quotes)
  const dialoguePattern = /"([^"]+)"/g;
  let dialogueWords = 0;
  let match;

  while ((match = dialoguePattern.exec(text)) !== null) {
    dialogueWords += match[1].split(/\s+/).filter((w) => w.length > 0).length;
  }

  // Identify action words (verbs indicating action)
  const actionWords = [
    "ran",
    "jumped",
    "grabbed",
    "threw",
    "kicked",
    "punched",
    "dodged",
    "lunged",
    "rushed",
    "dashed",
    "sprinted",
    "fought",
    "attacked",
    "defended",
    "chased",
    "fled",
  ];

  let actionCount = 0;
  const lowerText = text.toLowerCase();
  actionWords.forEach((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "g");
    const matches = lowerText.match(pattern);
    if (matches) actionCount += matches.length;
  });

  // Estimate action percentage (rough heuristic)
  const estimatedActionWords = actionCount * 10; // Each action verb suggests ~10 words of action

  // Remaining is description
  const descriptionWords = Math.max(
    0,
    totalWords - dialogueWords - estimatedActionWords
  );

  const dialoguePercentage = (dialogueWords / totalWords) * 100;
  const descriptionPercentage = (descriptionWords / totalWords) * 100;
  const actionPercentage = (estimatedActionWords / totalWords) * 100;

  // Get genre target
  const genreKey = genre.toLowerCase();
  const target = GENRE_TARGETS[genreKey] || GENRE_TARGETS.general;

  const genreTarget = {
    genre,
    idealDialogue: target.dialogue,
    idealDescription: target.description,
    idealAction: target.action,
  };

  // Determine balance
  const dialogueDiff = Math.abs(dialoguePercentage - target.dialogue);
  const descriptionDiff = Math.abs(descriptionPercentage - target.description);
  const actionDiff = Math.abs(actionPercentage - target.action);
  const totalDiff = dialogueDiff + descriptionDiff + actionDiff;

  let balance: DialogueNarrativeRatio["balance"] = "excellent";
  if (totalDiff > 40) balance = "needs-adjustment";
  else if (totalDiff > 20) balance = "good";

  // Generate recommendations
  const recommendations: string[] = [];
  if (dialogueDiff > 15) {
    recommendations.push(
      dialoguePercentage < target.dialogue
        ? `Increase dialogue - add ${(
            target.dialogue - dialoguePercentage
          ).toFixed(0)}% more conversations`
        : `Reduce dialogue - cut ${(
            dialoguePercentage - target.dialogue
          ).toFixed(0)}% for better balance`
    );
  }
  if (descriptionDiff > 15) {
    recommendations.push(
      descriptionPercentage < target.description
        ? `Add more description - enrich settings and sensory details`
        : `Trim description - keep it concise and impactful`
    );
  }
  if (actionDiff > 15) {
    recommendations.push(
      actionPercentage < target.action
        ? `Increase action - add more movement and tension`
        : `Reduce action pacing - allow for breathing room`
    );
  }

  return {
    totalWords,
    dialogueWords,
    descriptionWords,
    actionWords: estimatedActionWords,
    dialoguePercentage,
    descriptionPercentage,
    actionPercentage,
    genreTarget,
    balance,
    recommendations,
  };
}

/**
 * Analyze scene vs sequel structure
 */
export function analyzeSceneSequel(text: string): SceneSequelResult {
  const chunkSize = 1000; // words per chunk
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const chunks: SceneSequel[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, Math.min(i + chunkSize, words.length));
    const chunkText = chunk.join(" ").toLowerCase();

    // Count indicators
    const sceneCount = SCENE_INDICATORS.filter((ind) =>
      chunkText.includes(ind)
    ).length;
    const sequelCount = SEQUEL_INDICATORS.filter((ind) =>
      chunkText.includes(ind)
    ).length;

    const type: "scene" | "sequel" =
      sceneCount > sequelCount ? "scene" : "sequel";
    const intensity =
      type === "scene"
        ? Math.min(100, sceneCount * 10)
        : Math.min(100, sequelCount * 8);

    chunks.push({
      type,
      start: i,
      end: i + chunk.length,
      length: chunk.length,
      indicators:
        type === "scene"
          ? SCENE_INDICATORS.filter((ind) => chunkText.includes(ind))
          : SEQUEL_INDICATORS.filter((ind) => chunkText.includes(ind)),
      intensity,
    });
  }

  const scenes = chunks.filter((c) => c.type === "scene");
  const sequels = chunks.filter((c) => c.type === "sequel");

  const sceneCount = scenes.length;
  const sequelCount = sequels.length;
  const sceneToSequelRatio =
    sequelCount > 0 ? sceneCount / sequelCount : sceneCount;

  const averageSceneLength =
    scenes.length > 0
      ? scenes.reduce((sum, s) => sum + s.length, 0) / scenes.length
      : 0;
  const averageSequelLength =
    sequels.length > 0
      ? sequels.reduce((sum, s) => sum + s.length, 0) / sequels.length
      : 0;

  // Determine balance (ideal ratio is ~2:1 scenes to sequels)
  let balance: SceneSequelResult["balance"] = "excellent";
  if (sceneToSequelRatio > 5 || sceneToSequelRatio < 1) {
    balance = "unbalanced";
  } else if (sceneToSequelRatio > 3 || sceneToSequelRatio < 1.5) {
    balance = "good";
  }

  const recommendations: string[] = [];
  if (sceneToSequelRatio > 4) {
    recommendations.push(
      "Too many scenes - add more reflection and character processing"
    );
  } else if (sceneToSequelRatio < 1.5) {
    recommendations.push(
      "Too much reflection - increase action and goal-oriented scenes"
    );
  }
  if (scenes.length === 0) {
    recommendations.push(
      "No clear scene structure detected - add more action sequences"
    );
  }
  if (sequels.length === 0) {
    recommendations.push(
      "No sequel/reflection detected - add character reaction and decision points"
    );
  }

  return {
    scenes,
    sequels,
    sceneCount,
    sequelCount,
    sceneToSequelRatio,
    averageSceneLength,
    averageSequelLength,
    balance,
    recommendations,
  };
}

/**
 * Track conflict throughout manuscript
 */
export function analyzeConflictTracking(text: string): ConflictTrackingResult {
  const conflicts: ConflictInstance[] = [];
  const lowerText = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let position = 0;

  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase();

    // Check each conflict type
    for (const [type, keywords] of Object.entries(CONFLICT_KEYWORDS)) {
      keywords.forEach((keyword) => {
        if (lowerSentence.includes(keyword)) {
          const intensity = Math.min(
            100,
            40 + keywords.filter((k) => lowerSentence.includes(k)).length * 15
          );

          // Check if resolved (contains resolution words)
          const resolved =
            lowerSentence.includes("resolved") ||
            lowerSentence.includes("settled") ||
            lowerSentence.includes("peace") ||
            lowerSentence.includes("agreement");

          conflicts.push({
            type: type as ConflictInstance["type"],
            position: text.indexOf(sentence, position),
            intensity,
            description: sentence.trim().substring(0, 100),
            resolved,
          });
        }
      });
    }

    position += sentence.length;
  });

  const internalCount = conflicts.filter((c) => c.type === "internal").length;
  const externalCount = conflicts.filter((c) => c.type === "external").length;
  const interpersonalCount = conflicts.filter(
    (c) => c.type === "interpersonal"
  ).length;

  const averageIntensity =
    conflicts.length > 0
      ? conflicts.reduce((sum, c) => sum + c.intensity, 0) / conflicts.length
      : 0;

  const wordCount = text.split(/\s+/).length;
  const conflictDensity = (conflicts.length / wordCount) * 1000;

  // Find low-conflict sections (chunks with < 2 conflicts)
  const chunkSize = 2000; // characters
  const lowConflictSections: number[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.substring(i, Math.min(i + chunkSize, text.length));
    const conflictsInChunk = conflicts.filter(
      (c) => c.position >= i && c.position < i + chunkSize
    ).length;

    if (conflictsInChunk < 2) {
      lowConflictSections.push(i);
    }
  }

  // Find resolution points
  const resolutionPoints = conflicts
    .filter((c) => c.resolved)
    .map((c) => c.position);

  const recommendations: string[] = [];
  if (conflictDensity < 1) {
    recommendations.push(
      "Low overall conflict - consider adding more tension and obstacles"
    );
  }
  if (lowConflictSections.length > 3) {
    recommendations.push(
      `${lowConflictSections.length} sections have minimal conflict - add stakes and challenges`
    );
  }
  if (internalCount === 0) {
    recommendations.push(
      "No internal conflict detected - develop character struggles and doubts"
    );
  }
  if (externalCount === 0 && interpersonalCount === 0) {
    recommendations.push(
      "No external conflict - add obstacles, antagonists, or environmental challenges"
    );
  }

  return {
    conflicts,
    totalConflicts: conflicts.length,
    internalCount,
    externalCount,
    interpersonalCount,
    averageIntensity,
    conflictDensity,
    lowConflictSections,
    resolutionPoints,
    recommendations,
  };
}

/**
 * Analyze sensory balance
 */
export function analyzeSensoryBalance(text: string): SensoryBalanceResult {
  const instances: SensoryInstance[] = [];
  const lowerText = text.toLowerCase();

  // Count each sense
  for (const [sense, words] of Object.entries(SENSORY_WORDS)) {
    words.forEach((word) => {
      const pattern = new RegExp(`\\b${word}\\b`, "gi");
      let match;

      while ((match = pattern.exec(lowerText)) !== null) {
        const contextStart = Math.max(0, match.index - 30);
        const contextEnd = Math.min(
          text.length,
          match.index + word.length + 30
        );
        const context = text.substring(contextStart, contextEnd);

        instances.push({
          sense: sense as SensoryInstance["sense"],
          word,
          position: match.index,
          context,
        });
      }
    });
  }

  const sightCount = instances.filter((i) => i.sense === "sight").length;
  const soundCount = instances.filter((i) => i.sense === "sound").length;
  const touchCount = instances.filter((i) => i.sense === "touch").length;
  const smellCount = instances.filter((i) => i.sense === "smell").length;
  const tasteCount = instances.filter((i) => i.sense === "taste").length;
  const total = instances.length;

  const sightPercentage = (sightCount / total) * 100 || 0;
  const soundPercentage = (soundCount / total) * 100 || 0;
  const touchPercentage = (touchCount / total) * 100 || 0;
  const smellPercentage = (smellCount / total) * 100 || 0;
  const tastePercentage = (tasteCount / total) * 100 || 0;

  // Determine balance (sight should be < 60%, others > 5% each)
  let balance: SensoryBalanceResult["balance"] = "excellent";
  if (sightPercentage > 70) {
    balance = "visual-heavy";
  } else if (
    soundPercentage < 5 ||
    touchPercentage < 5 ||
    smellCount + tasteCount < 5
  ) {
    balance = "needs-variety";
  } else if (sightPercentage > 60) {
    balance = "good";
  }

  const recommendations: string[] = [];
  if (sightPercentage > 65) {
    recommendations.push(
      `${sightPercentage.toFixed(
        0
      )}% visual focus - add more sound, touch, smell, and taste`
    );
  }
  if (soundPercentage < 10) {
    recommendations.push(
      "Underutilized sound - add ambient noise, dialogue tone, music, etc."
    );
  }
  if (touchPercentage < 10) {
    recommendations.push(
      "Low tactile descriptions - add texture, temperature, physical sensation"
    );
  }
  if (smellCount < 3) {
    recommendations.push(
      "Missing smell descriptions - powerful for memory and atmosphere"
    );
  }
  if (tasteCount < 2) {
    recommendations.push(
      "Minimal taste references - consider food scenes or environmental tastes"
    );
  }

  return {
    instances,
    sightCount,
    soundCount,
    touchCount,
    smellCount,
    tasteCount,
    total,
    sightPercentage,
    soundPercentage,
    touchPercentage,
    smellPercentage,
    tastePercentage,
    balance,
    recommendations,
  };
}
