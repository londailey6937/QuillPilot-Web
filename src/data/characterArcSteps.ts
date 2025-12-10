/**
 * 22-Step Character Arc Framework
 * Based on the comprehensive character development structure used in fiction writing
 * Each step represents a stage in a character's transformation throughout a story
 */

export interface ArcStep {
  id: number;
  name: string;
  shortName: string; // For display in compact UI
  description: string;
  keywords: string[]; // Words/phrases that indicate this step
  storyPosition: "beginning" | "early" | "middle" | "late" | "climax" | "end";
}

export const CHARACTER_ARC_STEPS: ArcStep[] = [
  {
    id: 1,
    name: "The Ordinary World",
    shortName: "Ordinary World",
    description:
      "Character's normal life before the story begins. Establishes baseline personality, environment, and what they stand to lose.",
    keywords: [
      "every day",
      "routine",
      "always",
      "used to",
      "normal",
      "usual",
      "typical",
      "comfortable",
      "familiar",
      "home",
      "before",
    ],
    storyPosition: "beginning",
  },
  {
    id: 2,
    name: "The Call to Adventure",
    shortName: "Call to Adventure",
    description:
      "An event or opportunity that disrupts the ordinary world and invites change.",
    keywords: [
      "suddenly",
      "unexpected",
      "invitation",
      "opportunity",
      "discovered",
      "found out",
      "learned",
      "message",
      "news",
      "summons",
    ],
    storyPosition: "beginning",
  },
  {
    id: 3,
    name: "Refusal of the Call",
    shortName: "Refusal",
    description:
      "Character hesitates or refuses the call due to fear, doubt, or obligation.",
    keywords: [
      "can't",
      "won't",
      "shouldn't",
      "impossible",
      "afraid",
      "hesitate",
      "doubt",
      "refuse",
      "decline",
      "not ready",
      "too dangerous",
    ],
    storyPosition: "beginning",
  },
  {
    id: 4,
    name: "Meeting the Mentor",
    shortName: "Meet Mentor",
    description:
      "Character encounters a guide who provides wisdom, training, or magical aid.",
    keywords: [
      "teacher",
      "guide",
      "wise",
      "old",
      "experienced",
      "advice",
      "taught",
      "learned from",
      "training",
      "master",
      "mentor",
    ],
    storyPosition: "early",
  },
  {
    id: 5,
    name: "Crossing the Threshold",
    shortName: "Cross Threshold",
    description:
      "Character commits to the journey and leaves the ordinary world behind.",
    keywords: [
      "left",
      "departed",
      "journey",
      "set out",
      "no turning back",
      "committed",
      "decided",
      "crossed",
      "entered",
      "new world",
    ],
    storyPosition: "early",
  },
  {
    id: 6,
    name: "Tests, Allies, and Enemies",
    shortName: "Tests & Allies",
    description:
      "Character faces challenges and learns who can be trusted in the new world.",
    keywords: [
      "friend",
      "enemy",
      "ally",
      "opponent",
      "challenge",
      "test",
      "trial",
      "trust",
      "betrayed",
      "helped",
      "team",
    ],
    storyPosition: "early",
  },
  {
    id: 7,
    name: "Approach to the Inmost Cave",
    shortName: "Approach Cave",
    description:
      "Character prepares for a major challenge by gathering resources and allies.",
    keywords: [
      "prepare",
      "plan",
      "ready",
      "approaching",
      "gather",
      "strategy",
      "before the",
      "final preparation",
      "closer",
    ],
    storyPosition: "middle",
  },
  {
    id: 8,
    name: "The Ordeal",
    shortName: "Ordeal",
    description:
      "Character faces their greatest fear or most difficult challenge—the midpoint crisis.",
    keywords: [
      "confronted",
      "faced",
      "battle",
      "fight",
      "struggle",
      "crisis",
      "death",
      "nearly died",
      "worst moment",
      "darkest",
    ],
    storyPosition: "middle",
  },
  {
    id: 9,
    name: "Reward (Seizing the Sword)",
    shortName: "Reward",
    description:
      "Character survives the ordeal and gains something of value—a prize, knowledge, or reconciliation.",
    keywords: [
      "gained",
      "won",
      "reward",
      "prize",
      "treasure",
      "power",
      "secret",
      "revelation",
      "realized",
      "understood",
    ],
    storyPosition: "middle",
  },
  {
    id: 10,
    name: "The Road Back",
    shortName: "Road Back",
    description:
      "Character begins the journey back to the ordinary world, but complications arise.",
    keywords: [
      "return",
      "back",
      "escape",
      "pursued",
      "chase",
      "fleeing",
      "homeward",
      "leaving",
      "consequences",
    ],
    storyPosition: "late",
  },
  {
    id: 11,
    name: "The Resurrection",
    shortName: "Resurrection",
    description:
      "Final test where character must prove they've truly changed. Often involves another death/rebirth moment.",
    keywords: [
      "final",
      "last chance",
      "climax",
      "transformed",
      "reborn",
      "new person",
      "proved",
      "ultimate test",
      "sacrifice",
    ],
    storyPosition: "climax",
  },
  {
    id: 12,
    name: "Return with the Elixir",
    shortName: "Return with Elixir",
    description:
      "Character returns home transformed, bringing something beneficial for the community.",
    keywords: [
      "returned",
      "home",
      "changed",
      "different",
      "brought back",
      "shared",
      "helped others",
      "healed",
      "peace",
    ],
    storyPosition: "end",
  },
  // Extended steps for deeper character development
  {
    id: 13,
    name: "The Lie the Character Believes",
    shortName: "The Lie",
    description:
      "A fundamental misconception about themselves or the world that drives their flaw.",
    keywords: [
      "believed",
      "thought",
      "assumed",
      "always been",
      "never could",
      "not good enough",
      "worthless",
      "unlovable",
      "wrong about",
    ],
    storyPosition: "beginning",
  },
  {
    id: 14,
    name: "The Thing They Want",
    shortName: "The Want",
    description:
      "The external goal the character pursues—their conscious desire.",
    keywords: [
      "want",
      "desire",
      "goal",
      "dream",
      "wish",
      "seeking",
      "searching for",
      "must have",
      "need to get",
    ],
    storyPosition: "beginning",
  },
  {
    id: 15,
    name: "The Thing They Need",
    shortName: "The Need",
    description:
      "The internal truth the character must learn to be fulfilled—often opposed to what they want.",
    keywords: [
      "really needed",
      "what mattered",
      "true",
      "actually",
      "important",
      "real",
      "deeper",
      "underneath",
    ],
    storyPosition: "end",
  },
  {
    id: 16,
    name: "The Ghost/Wound",
    shortName: "The Wound",
    description:
      "A past trauma that created the character's lie and shaped their worldview.",
    keywords: [
      "past",
      "memory",
      "trauma",
      "wound",
      "haunted",
      "never forgot",
      "since then",
      "happened years ago",
      "childhood",
    ],
    storyPosition: "beginning",
  },
  {
    id: 17,
    name: "The First Plot Point (Point of No Return)",
    shortName: "No Return",
    description:
      "A major event that fully commits the character to the journey with no way back.",
    keywords: [
      "no choice",
      "had to",
      "forced",
      "committed",
      "bridge burned",
      "can't go back",
      "everything changed",
    ],
    storyPosition: "early",
  },
  {
    id: 18,
    name: "The Midpoint Shift",
    shortName: "Midpoint Shift",
    description:
      "A revelation or event that shifts the character from reactive to proactive.",
    keywords: [
      "realized",
      "understood",
      "saw clearly",
      "everything changed",
      "took charge",
      "decided to",
      "no longer",
      "from now on",
    ],
    storyPosition: "middle",
  },
  {
    id: 19,
    name: "The All Is Lost Moment",
    shortName: "All Is Lost",
    description:
      "The character's lowest point where defeat seems certain and hope is lost.",
    keywords: [
      "lost",
      "hopeless",
      "defeated",
      "failed",
      "over",
      "finished",
      "can't win",
      "despair",
      "given up",
      "rock bottom",
    ],
    storyPosition: "late",
  },
  {
    id: 20,
    name: "The Dark Night of the Soul",
    shortName: "Dark Night",
    description:
      "A period of reflection after all is lost where the character confronts their lie.",
    keywords: [
      "alone",
      "silent",
      "thinking",
      "reflecting",
      "remembered",
      "what if",
      "wrong all along",
      "realized the truth",
    ],
    storyPosition: "late",
  },
  {
    id: 21,
    name: "The Third Plot Point (Climactic Decision)",
    shortName: "Climactic Decision",
    description:
      "Character makes a crucial decision that demonstrates their transformation.",
    keywords: [
      "chose",
      "decided",
      "knew what to do",
      "this time",
      "different now",
      "finally",
      "stood up",
      "refused to",
    ],
    storyPosition: "climax",
  },
  {
    id: 22,
    name: "The New Equilibrium",
    shortName: "New Equilibrium",
    description:
      "Character's new normal after transformation, contrasting with the ordinary world.",
    keywords: [
      "now",
      "finally",
      "at peace",
      "new life",
      "different person",
      "changed",
      "better",
      "learned",
      "grew",
    ],
    storyPosition: "end",
  },
];

/**
 * Get arc steps by story position
 */
export function getStepsByPosition(
  position: ArcStep["storyPosition"]
): ArcStep[] {
  return CHARACTER_ARC_STEPS.filter((step) => step.storyPosition === position);
}

/**
 * Get step by ID
 */
export function getStepById(id: number): ArcStep | undefined {
  return CHARACTER_ARC_STEPS.find((step) => step.id === id);
}

/**
 * Get step display color based on story position
 */
export function getStepColor(position: ArcStep["storyPosition"]): string {
  const colors: Record<ArcStep["storyPosition"], string> = {
    beginning: "#10b981", // Green
    early: "#3b82f6", // Blue
    middle: "#f59e0b", // Amber
    late: "#ef4444", // Red
    climax: "#8b5cf6", // Purple
    end: "#06b6d4", // Cyan
  };
  return colors[position];
}

/**
 * Position labels for display
 */
export const POSITION_LABELS: Record<ArcStep["storyPosition"], string> = {
  beginning: "Act 1 - Setup",
  early: "Act 1 - Rising",
  middle: "Act 2 - Midpoint",
  late: "Act 2 - Crisis",
  climax: "Act 3 - Climax",
  end: "Act 3 - Resolution",
};
