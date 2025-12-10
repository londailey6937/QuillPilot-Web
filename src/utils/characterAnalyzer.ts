/**
 * Character Arc Analyzer
 * Tracks character mentions, emotional trajectory, and development throughout manuscript
 */

import type { Character, CharacterMapping } from "../../types";

export interface CharacterMention {
  name: string;
  position: number;
  context: string; // surrounding text
  sentiment: "positive" | "negative" | "neutral";
  inDialogue: boolean;
}

export interface CharacterProfile {
  name: string;
  mentions: CharacterMention[];
  totalMentions: number;
  firstAppearance: number;
  lastAppearance: number;
  emotionalTrajectory: {
    early: number; // sentiment score 0-100
    middle: number;
    late: number;
  };
  dialogueRatio: number; // % of mentions in dialogue
  role: "protagonist" | "major" | "supporting" | "minor";
  arcType: "dynamic" | "flat" | "unclear";
  developmentScore: number; // 0-100
}

export interface CharacterAnalysisResult {
  characters: CharacterProfile[];
  protagonists: string[];
  totalCharacters: number;
  averageDevelopment: number;
  recommendations: string[];
}

/**
 * Sentiment word lists for emotional trajectory analysis
 */
const POSITIVE_WORDS = new Set([
  "happy",
  "joy",
  "smile",
  "laugh",
  "love",
  "delight",
  "pleased",
  "wonderful",
  "excellent",
  "perfect",
  "beautiful",
  "amazing",
  "brilliant",
  "fantastic",
  "hope",
  "excited",
  "thrilled",
  "grateful",
  "proud",
  "confident",
  "warm",
  "gentle",
  "kind",
  "caring",
  "peaceful",
  "calm",
  "relieved",
  "content",
]);

const NEGATIVE_WORDS = new Set([
  "sad",
  "angry",
  "fear",
  "hate",
  "terrible",
  "awful",
  "horrible",
  "bad",
  "worse",
  "worst",
  "cruel",
  "harsh",
  "pain",
  "hurt",
  "wound",
  "blood",
  "death",
  "die",
  "kill",
  "scream",
  "cry",
  "tears",
  "grief",
  "despair",
  "anxious",
  "worried",
  "scared",
  "frightened",
  "terrified",
  "nervous",
  "bitter",
  "resentful",
  "jealous",
  "guilty",
  "ashamed",
  "disgusted",
]);

/**
 * Common pronouns to track when associated with named characters
 */
const PRONOUNS = new Set([
  "he",
  "she",
  "they",
  "him",
  "her",
  "them",
  "his",
  "hers",
  "their",
]);

/**
 * Extract potential character names (capitalized words, not common words)
 */
function extractCharacterNames(text: string): Map<string, number> {
  // Comprehensive list of words that should NEVER be detected as character names
  // These are common English words that appear capitalized at sentence starts
  const commonWords = new Set([
    // Articles, conjunctions, prepositions (when capitalized)
    "The",
    "A",
    "An",
    "And",
    "But",
    "Or",
    "Nor",
    "For",
    "Yet",
    "So",
    "In",
    "On",
    "At",
    "To",
    "From",
    "With",
    "Without",
    "By",
    "About",
    "Into",
    "Through",
    "During",
    "Before",
    "After",
    "Above",
    "Below",
    "Between",
    "Under",
    "Over",
    "Out",
    "Off",
    "Down",
    "Up",
    "Near",
    "Around",
    "Against",
    "Along",
    "Among",
    "Beyond",
    "Within",
    "Upon",

    // Pronouns (all forms)
    "I",
    "You",
    "We",
    "It",
    "He",
    "She",
    "They",
    "Me",
    "Him",
    "Her",
    "Us",
    "Them",
    "My",
    "Your",
    "Our",
    "Its",
    "His",
    "Her",
    "Their",
    "Mine",
    "Yours",
    "Ours",
    "Theirs",
    "Hers",
    "This",
    "That",
    "These",
    "Those",
    "What",
    "Which",
    "Who",
    "Whom",
    "Whose",
    "Whatever",
    "Whichever",
    "Whoever",
    "Whomever",
    "Someone",
    "Anyone",
    "Everyone",
    "Nobody",
    "Somebody",
    "Anybody",
    "Everybody",
    "Something",
    "Anything",
    "Everything",
    "Nothing",
    "Myself",
    "Yourself",
    "Himself",
    "Herself",
    "Itself",
    "Ourselves",
    "Themselves",
    "Each",
    "Either",
    "Neither",
    "Both",
    "All",
    "Some",
    "Any",
    "None",
    "Most",
    "Many",
    "Few",
    "Several",
    "Other",
    "Another",

    // Common verbs (when capitalized at sentence start)
    "Was",
    "Were",
    "Been",
    "Being",
    "Is",
    "Are",
    "Am",
    "Has",
    "Have",
    "Had",
    "Do",
    "Does",
    "Did",
    "Will",
    "Would",
    "Could",
    "Should",
    "Might",
    "Must",
    "Can",
    "May",
    "Shall",
    "Need",
    "Ought",
    "Dare",
    "Used",
    "Get",
    "Got",
    "Goes",
    "Going",
    "Gone",
    "Come",
    "Came",
    "Coming",
    "See",
    "Saw",
    "Seen",
    "Seeing",
    "Look",
    "Looked",
    "Looking",
    "Make",
    "Made",
    "Making",
    "Take",
    "Took",
    "Taken",
    "Taking",
    "Give",
    "Gave",
    "Given",
    "Giving",
    "Know",
    "Knew",
    "Known",
    "Knowing",
    "Think",
    "Thought",
    "Thinking",
    "Feel",
    "Felt",
    "Feeling",
    "Want",
    "Wanted",
    "Wanting",
    "Like",
    "Liked",
    "Liking",
    "Say",
    "Said",
    "Saying",
    "Tell",
    "Told",
    "Telling",
    "Ask",
    "Asked",
    "Asking",
    "Try",
    "Tried",
    "Trying",
    "Leave",
    "Left",
    "Leaving",
    "Keep",
    "Kept",
    "Keeping",
    "Let",
    "Begin",
    "Began",
    "Begun",
    "Beginning",
    "Start",
    "Started",
    "Stop",
    "Stopped",
    "Turn",
    "Turned",
    "Turning",
    "Move",
    "Moved",
    "Run",
    "Ran",
    "Running",
    "Walk",
    "Walked",
    "Walking",
    "Stand",
    "Stood",
    "Standing",
    "Sit",
    "Sat",
    "Sitting",
    "Put",
    "Bring",
    "Brought",
    "Bringing",
    "Hold",
    "Held",
    "Holding",
    "Write",
    "Wrote",
    "Written",
    "Writing",
    "Read",
    "Reading",
    "Speak",
    "Spoke",
    "Spoken",
    "Speaking",
    "Talk",
    "Talked",
    "Talking",
    "Listen",
    "Listened",
    "Listening",
    "Watch",
    "Watched",
    "Watching",
    "Wait",
    "Waited",
    "Waiting",
    "Find",
    "Found",
    "Finding",
    "Show",
    "Showed",
    "Shown",
    "Showing",
    "Seem",
    "Seemed",
    "Seeming",
    "Become",
    "Became",
    "Becoming",
    "Remain",
    "Remained",
    "Remaining",
    "Appear",
    "Appeared",
    "Appearing",
    "Happen",
    "Happened",
    "Happening",
    "Work",
    "Worked",
    "Working",
    "Play",
    "Played",
    "Playing",
    "Live",
    "Lived",
    "Living",
    "Die",
    "Died",
    "Dying",
    "Kill",
    "Killed",
    "Killing",
    "Fight",
    "Fought",
    "Fighting",
    "Win",
    "Won",
    "Winning",
    "Lose",
    "Lost",
    "Losing",
    "Help",
    "Helped",
    "Helping",
    "Change",
    "Changed",
    "Changing",
    "Follow",
    "Followed",
    "Following",
    "Lead",
    "Led",
    "Leading",
    "Call",
    "Called",
    "Calling",
    "Open",
    "Opened",
    "Opening",
    "Close",
    "Closed",
    "Closing",
    "Break",
    "Broke",
    "Broken",
    "Breaking",
    "Fall",
    "Fell",
    "Fallen",
    "Falling",
    "Rise",
    "Rose",
    "Risen",
    "Rising",
    "Grow",
    "Grew",
    "Grown",
    "Growing",
    "Lay",
    "Laid",
    "Lying",
    "Set",
    "Setting",
    "Send",
    "Sent",
    "Sending",
    "Pay",
    "Paid",
    "Paying",
    "Buy",
    "Bought",
    "Buying",
    "Sell",
    "Sold",
    "Selling",
    "Spend",
    "Spent",
    "Spending",
    "Meet",
    "Met",
    "Meeting",
    "Hear",
    "Heard",
    "Hearing",
    "Carry",
    "Carried",
    "Carrying",
    "Eat",
    "Ate",
    "Eaten",
    "Eating",
    "Drink",
    "Drank",
    "Drunk",
    "Drinking",
    "Sleep",
    "Slept",
    "Sleeping",
    "Dream",
    "Dreamed",
    "Dreamt",
    "Dreaming",
    "Wear",
    "Wore",
    "Worn",
    "Wearing",
    "Choose",
    "Chose",
    "Chosen",
    "Choosing",
    "Throw",
    "Threw",
    "Thrown",
    "Throwing",
    "Catch",
    "Caught",
    "Catching",
    "Hit",
    "Hitting",
    "Cut",
    "Cutting",
    "Build",
    "Built",
    "Building",
    "Understand",
    "Understood",
    "Understanding",
    "Learn",
    "Learned",
    "Learning",
    "Teach",
    "Taught",
    "Teaching",
    "Remember",
    "Remembered",
    "Remembering",
    "Forget",
    "Forgot",
    "Forgotten",
    "Forgetting",
    "Believe",
    "Believed",
    "Wonder",
    "Wondered",
    "Wondering",
    "Suppose",
    "Supposed",
    "Supposing",
    "Expect",
    "Expected",
    "Expecting",
    "Decide",
    "Decided",
    "Deciding",
    "Agree",
    "Agreed",
    "Agreeing",
    "Refuse",
    "Refused",
    "Refusing",
    "Allow",
    "Allowed",
    "Allowing",
    "Offer",
    "Offered",
    "Offering",
    "Provide",
    "Provided",
    "Providing",
    "Suggest",
    "Suggested",
    "Suggesting",
    "Consider",
    "Considered",
    "Considering",
    "Require",
    "Required",
    "Requiring",
    "Include",
    "Included",
    "Including",
    "Continue",
    "Continued",
    "Continuing",
    "Develop",
    "Developed",
    "Developing",
    "Describe",
    "Described",
    "Describing",
    "Create",
    "Created",
    "Creating",
    "Produce",
    "Produced",
    "Producing",
    "Reach",
    "Reached",
    "Reaching",
    "Enter",
    "Entered",
    "Entering",
    "Arrive",
    "Arrived",
    "Arriving",
    "Return",
    "Returned",
    "Returning",
    "Receive",
    "Received",
    "Receiving",
    "Serve",
    "Served",
    "Serving",
    "Join",
    "Joined",
    "Joining",
    "Contain",
    "Contained",
    "Containing",
    "Support",
    "Supported",
    "Supporting",
    "Report",
    "Reported",
    "Reporting",
    "Present",
    "Presented",
    "Presenting",
    "Accept",
    "Accepted",
    "Accepting",
    "Determine",
    "Determined",
    "Determining",
    "Prepare",
    "Prepared",
    "Preparing",
    "Control",
    "Controlled",
    "Controlling",
    "Achieve",
    "Achieved",
    "Achieving",
    "Maintain",
    "Maintained",
    "Maintaining",
    "Obtain",
    "Obtained",
    "Obtaining",
    "Apply",
    "Applied",
    "Applying",
    "Involve",
    "Involved",
    "Involving",
    "Reduce",
    "Reduced",
    "Reducing",
    "Increase",
    "Increased",
    "Increasing",
    "Improve",
    "Improved",
    "Improving",
    "Manage",
    "Managed",
    "Managing",
    "Explain",
    "Explained",
    "Explaining",
    "Identify",
    "Identified",
    "Identifying",
    "Establish",
    "Established",
    "Establishing",
    "Define",
    "Defined",
    "Defining",
    "Exist",
    "Existed",
    "Existing",
    "Occur",
    "Occurred",
    "Occurring",
    "Depend",
    "Depended",
    "Depending",
    "Relate",
    "Related",
    "Relating",
    "Represent",
    "Represented",
    "Representing",
    "Reflect",
    "Reflected",
    "Reflecting",

    // Adverbs and adjectives commonly starting sentences
    "When",
    "Where",
    "Why",
    "How",
    "Then",
    "Now",
    "Here",
    "There",
    "Once",
    "Never",
    "Always",
    "Often",
    "Sometimes",
    "Usually",
    "Already",
    "Still",
    "Just",
    "Only",
    "Even",
    "Almost",
    "Quite",
    "Rather",
    "Very",
    "Too",
    "Also",
    "Again",
    "Soon",
    "Perhaps",
    "Maybe",
    "Probably",
    "Certainly",
    "Definitely",
    "Obviously",
    "Clearly",
    "Suddenly",
    "Finally",
    "Eventually",
    "Immediately",
    "Quickly",
    "Slowly",
    "Quietly",
    "Softly",
    "Loudly",
    "Gently",
    "Carefully",
    "Exactly",
    "Simply",
    "Merely",
    "Hardly",
    "Barely",
    "Nearly",
    "Mostly",
    "Partly",
    "Entirely",
    "Completely",
    "Absolutely",
    "Totally",
    "Fully",
    "Greatly",
    "Highly",
    "Deeply",
    "First",
    "Second",
    "Third",
    "Last",
    "Next",
    "Later",
    "Earlier",
    "Today",
    "Tomorrow",
    "Yesterday",
    "Tonight",
    "Meanwhile",
    "However",
    "Therefore",
    "Moreover",
    "Furthermore",
    "Nevertheless",
    "Otherwise",
    "Instead",
    "Besides",
    "Although",
    "Though",
    "Unless",
    "Until",
    "While",
    "Since",
    "Because",
    "Whether",
    "Whenever",
    "Wherever",
    "Somehow",
    "Somewhere",
    "Anywhere",
    "Everywhere",
    "Nowhere",

    // Common nouns that appear capitalized but aren't names
    "People",
    "Person",
    "Man",
    "Woman",
    "Men",
    "Women",
    "Child",
    "Children",
    "Boy",
    "Girl",
    "Baby",
    "Family",
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Friend",
    "Friends",
    "Enemy",
    "Enemies",
    "Stranger",
    "Strangers",
    "King",
    "Queen",
    "Prince",
    "Princess",
    "Lord",
    "Lady",
    "Sir",
    "Madam",
    "Doctor",
    "Professor",
    "Captain",
    "General",
    "Major",
    "Colonel",
    "President",
    "Senator",
    "Governor",
    "Mayor",
    "Judge",
    "Officer",
    "Teacher",
    "Student",
    "Worker",
    "Driver",
    "Writer",
    "Reader",
    "Door",
    "Window",
    "Room",
    "House",
    "Home",
    "Street",
    "Road",
    "City",
    "Town",
    "Country",
    "World",
    "Earth",
    "Sun",
    "Moon",
    "Star",
    "Stars",
    "Sky",
    "Sea",
    "Ocean",
    "River",
    "Lake",
    "Mountain",
    "Forest",
    "Tree",
    "Floor",
    "Wall",
    "Ceiling",
    "Table",
    "Chair",
    "Bed",
    "Desk",
    "Office",
    "Building",
    "Church",
    "School",
    "Hospital",
    "Hotel",
    "Restaurant",
    "Kitchen",
    "Bathroom",
    "Bedroom",
    "Garden",
    "Park",
    "Beach",
    "Island",
    "Fire",
    "Water",
    "Air",
    "Light",
    "Dark",
    "Darkness",
    "Shadow",
    "Sound",
    "Voice",
    "Word",
    "Words",
    "Name",
    "Names",
    "Number",
    "Numbers",
    "Time",
    "Times",
    "Year",
    "Years",
    "Month",
    "Months",
    "Week",
    "Weeks",
    "Hour",
    "Hours",
    "Minute",
    "Minutes",
    "Second",
    "Seconds",
    "Moment",
    "Thing",
    "Things",
    "Way",
    "Ways",
    "Part",
    "Parts",
    "Place",
    "Places",
    "Point",
    "Points",
    "Case",
    "Cases",
    "Fact",
    "Facts",
    "Kind",
    "Kinds",
    "Sort",
    "Sorts",
    "Type",
    "Types",
    "Form",
    "Forms",
    "State",
    "States",
    "Group",
    "Groups",
    "Problem",
    "Problems",
    "Question",
    "Questions",
    "Answer",
    "Answers",
    "Reason",
    "Reasons",
    "Result",
    "Results",
    "Side",
    "Sides",
    "End",
    "Ends",
    "Line",
    "Lines",
    "Head",
    "Hand",
    "Hands",
    "Eye",
    "Eyes",
    "Face",
    "Body",
    "Heart",
    "Mind",
    "Life",
    "Death",
    "Love",
    "Hate",
    "Fear",
    "Hope",
    "Dream",
    "Dreams",
    "Memory",
    "Memories",
    "Story",
    "Stories",
    "Book",
    "Books",
    "Letter",
    "Letters",
    "News",
    "Power",
    "Money",
    "Gold",
    "Silver",
    "Blood",
    "Tears",
    "Pain",
    "War",
    "Peace",
    "Truth",
    "Lie",
    "Lies",
    "Secret",
    "Secrets",
    "Thought",
    "Thoughts",
    "Idea",
    "Ideas",
    "Plan",
    "Plans",
    "Choice",

    // Days and months
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",

    // Screenplay/script formatting terms
    "Int",
    "Ext",
    "Fade",
    "Cut",
    "Dissolve",
    "Scene",
    "Shot",
    "Wide",
    "Angle",
    "Continuous",
    "Day",
    "Night",
    "Morning",
    "Evening",
    "Afternoon",
    "Dawn",
    "Dusk",
    "Sunset",
    "Sunrise",

    // Other common words that might start sentences
    "Everything",
    "Nothing",
    "Something",
    "Anything",
    "Everyone",
    "Someone",
    "Anyone",
    "Nobody",
    "Everybody",
    "Somebody",
    "Anywhere",
    "Somewhere",
    "Everywhere",
    "Nowhere",
    "Chapter",
    "Part",
    "Section",
    "Volume",
    "Page",
    "Paragraph",
    "Note",
    "Notes",
    "Example",
    "Examples",
    "Figure",
    "Figures",
    "Indeed",
    "Anyway",
    "Actually",
    "Basically",
    "Especially",
    "Particularly",
    "Generally",
    "Specifically",
    "Normally",
    "Typically",
    "Usually",
    "Occasionally",
    "Frequently",
    "Rarely",
    "According",
    "Despite",
    "Regarding",
    "Concerning",
    "Following",
    "Assuming",
    "Considering",
    "Given",
    "Provided",
    "Suppose",
    "Imagine",
    "Picture",
    "Consider",
    "Remember",
    "Recall",
    "Notice",
    "Behind",
    "Ahead",
    "Inside",
    "Outside",
    "Beside",
    "Beneath",
    "Across",
    "Throughout",
    "Toward",
    "Towards",
    "Away",
    "Back",
    "Forward",
    "Backward",
    "Upward",
    "Downward",
    "Sideways",
  ]);

  // Find all capitalized words
  const capitalizedPattern = /\b[A-Z][a-z]{2,}\b/g;
  const matches = text.match(capitalizedPattern) || [];

  const nameCounts = new Map<string, number>();

  for (const match of matches) {
    if (!commonWords.has(match) && match.length > 2) {
      nameCounts.set(match, (nameCounts.get(match) || 0) + 1);
    }
  }

  // Filter to names mentioned at least 3 times (likely characters, not places/objects)
  const characters = new Map<string, number>();
  for (const [name, count] of nameCounts.entries()) {
    if (count >= 3) {
      characters.set(name, count);
    }
  }

  return characters;
}

/**
 * Detect if text is dialogue (simple heuristic)
 */
function isInDialogue(context: string): boolean {
  return (
    context.includes('"') ||
    context.includes("'") ||
    context.includes('"') ||
    context.includes('"')
  );
}

/**
 * Calculate sentiment score for text context
 * Enhanced to be more sensitive for screenplay format
 */
function calculateSentiment(text: string): "positive" | "negative" | "neutral" {
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positiveCount++;
    if (NEGATIVE_WORDS.has(word)) negativeCount++;
  }

  // More sensitive - even 1-2 emotional words matter in context
  if (positiveCount > negativeCount && positiveCount > 0) return "positive";
  if (negativeCount > positiveCount && negativeCount > 0) return "negative";
  return "neutral";
}

/**
 * Get sentiment as numeric score (0-100)
 * Enhanced range for better arc detection
 */
function sentimentToScore(
  sentiment: "positive" | "negative" | "neutral"
): number {
  if (sentiment === "positive") return 75; // Increased from 70
  if (sentiment === "negative") return 25; // Decreased from 30
  return 50;
}

/**
 * Extract all mentions of a character with context
 */
function extractCharacterMentions(
  text: string,
  characterName: string
): CharacterMention[] {
  const mentions: CharacterMention[] = [];
  const contextRadius = 200; // Expanded from 100 to capture more emotional context (important for screenplays)

  // Find all occurrences
  const regex = new RegExp(`\\b${characterName}\\b`, "gi");
  let match;

  while ((match = regex.exec(text)) !== null) {
    const position = match.index;
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(
      text.length,
      position + characterName.length + contextRadius
    );
    const context = text.substring(start, end);

    mentions.push({
      name: characterName,
      position,
      context,
      sentiment: calculateSentiment(context),
      inDialogue: isInDialogue(context),
    });
  }

  return mentions;
}

/**
 * Calculate emotional trajectory across manuscript
 */
function calculateEmotionalTrajectory(mentions: CharacterMention[]): {
  early: number;
  middle: number;
  late: number;
} {
  if (mentions.length === 0) {
    return { early: 50, middle: 50, late: 50 };
  }

  const third = Math.floor(mentions.length / 3);

  const earlyMentions = mentions.slice(0, third);
  const middleMentions = mentions.slice(third, third * 2);
  const lateMentions = mentions.slice(third * 2);

  const avgSentiment = (mentions: CharacterMention[]) => {
    if (mentions.length === 0) return 50;
    const sum = mentions.reduce(
      (acc, m) => acc + sentimentToScore(m.sentiment),
      0
    );
    return Math.round(sum / mentions.length);
  };

  return {
    early: avgSentiment(earlyMentions),
    middle: avgSentiment(middleMentions),
    late: avgSentiment(lateMentions),
  };
}

/**
 * Determine character arc type based on emotional trajectory
 */
function determineArcType(trajectory: {
  early: number;
  middle: number;
  late: number;
}): "dynamic" | "flat" | "unclear" {
  const totalChange = Math.abs(trajectory.late - trajectory.early);
  const midChange = Math.abs(trajectory.middle - trajectory.early);

  // Check for consistent progression (not just start-end change)
  const hasProgression =
    (trajectory.early < trajectory.middle &&
      trajectory.middle < trajectory.late) ||
    (trajectory.early > trajectory.middle &&
      trajectory.middle > trajectory.late);

  // Debug logging
  console.log(
    `[Arc Detection] early:${trajectory.early} mid:${trajectory.middle} late:${trajectory.late} | change:${totalChange} | progression:${hasProgression}`
  );

  // Very sensitive thresholds optimized for 3-value sentiment system (25, 50, 75)
  // Maximum possible change is 50 points, typical changes are 0-25 points
  if (totalChange >= 8 || (totalChange >= 4 && hasProgression)) {
    return "dynamic"; // Any detectable emotional change
  }

  if (totalChange === 0) {
    return "flat"; // Absolutely no change
  }

  return "unclear"; // Very subtle change (1-7 points without progression)
}

/**
 * Calculate character development score
 */
function calculateDevelopmentScore(
  arcType: "dynamic" | "flat" | "unclear",
  trajectory: { early: number; middle: number; late: number },
  mentions: number
): number {
  let score = 50; // Base score

  // Reward dynamic arcs
  if (arcType === "dynamic") {
    const change = Math.abs(trajectory.late - trajectory.early);
    score += Math.min(30, change);
  }

  // Reward consistent presence
  if (mentions > 20) score += 10;
  if (mentions > 50) score += 10;

  // Penalize unclear arcs for major characters
  if (arcType === "unclear" && mentions > 30) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine character role based on mention frequency
 */
function determineRole(
  mentions: number,
  totalMentions: number
): "protagonist" | "major" | "supporting" | "minor" {
  const ratio = mentions / totalMentions;

  if (ratio > 0.15) return "protagonist"; // >15% of all mentions
  if (ratio > 0.08) return "major"; // >8%
  if (ratio > 0.03) return "supporting"; // >3%
  return "minor";
}

/**
 * Main character analysis function
 * Prioritizes user-defined characters and mappings over automatic detection
 */
export function analyzeCharacters(
  text: string,
  userCharacters?: Character[],
  characterMappings?: CharacterMapping[]
): CharacterAnalysisResult {
  // If user has defined characters (Tier 3), use those
  if (userCharacters && userCharacters.length > 0) {
    return analyzeWithUserCharacters(text, userCharacters, characterMappings);
  }

  // Otherwise fall back to automatic detection
  return analyzeWithAutoDetection(text);
}

/**
 * Analyze using user-defined characters (Tier 3 feature)
 */
function analyzeWithUserCharacters(
  text: string,
  userCharacters: Character[],
  characterMappings: CharacterMapping[] = []
): CharacterAnalysisResult {
  const characters: CharacterProfile[] = [];

  for (const char of userCharacters) {
    // Build list of names to search for (character name + linked names + mapped names)
    const searchNames = new Set([char.name, ...char.linkedNames]);

    // Add any text occurrences mapped to this character
    const mappedNames = characterMappings
      .filter((m) => m.characterId === char.id)
      .map((m) => m.textOccurrence);
    mappedNames.forEach((name) => searchNames.add(name));

    // Find all mentions of this character (any of their names)
    const allMentions: CharacterMention[] = [];
    for (const searchName of searchNames) {
      const mentions = extractCharacterMentions(text, searchName);
      allMentions.push(...mentions);
    }

    // Sort mentions by position
    allMentions.sort((a, b) => a.position - b.position);

    if (allMentions.length === 0) continue;

    const trajectory = calculateEmotionalTrajectory(allMentions);
    const arcType = determineArcType(trajectory);
    const developmentScore = calculateDevelopmentScore(
      arcType,
      trajectory,
      allMentions.length
    );

    const dialogueMentions = allMentions.filter((m) => m.inDialogue).length;
    const dialogueRatio =
      allMentions.length > 0 ? dialogueMentions / allMentions.length : 0;

    // Map user-defined role to analysis role
    const analysisRole =
      char.role === "protagonist" || char.role === "antagonist"
        ? "protagonist"
        : char.role === "deuteragonist" ||
          char.role === "love-interest" ||
          char.role === "mentor"
        ? "major"
        : char.role === "supporting" ||
          char.role === "sidekick" ||
          char.role === "foil"
        ? "supporting"
        : "minor";

    characters.push({
      name: char.name,
      mentions: allMentions,
      totalMentions: allMentions.length,
      firstAppearance: allMentions[0]?.position || 0,
      lastAppearance: allMentions[allMentions.length - 1]?.position || 0,
      emotionalTrajectory: trajectory,
      dialogueRatio,
      role: analysisRole as "protagonist" | "major" | "supporting" | "minor",
      arcType,
      developmentScore,
    });
  }

  // Sort by mention count (most mentioned first)
  characters.sort((a, b) => b.totalMentions - a.totalMentions);

  // Identify protagonists
  const protagonists = characters
    .filter((c) => c.role === "protagonist")
    .map((c) => c.name);

  // Calculate average development
  const averageDevelopment =
    characters.length > 0
      ? Math.round(
          characters.reduce((sum, c) => sum + c.developmentScore, 0) /
            characters.length
        )
      : 0;

  // Generate recommendations based on character analysis
  const recommendations: string[] = [];

  if (characters.length === 0) {
    recommendations.push(
      "No character mentions found in the text. Make sure your characters appear in the story."
    );
  } else {
    const protagonists = characters.filter((c) => c.role === "protagonist");

    if (protagonists.length === 0) {
      recommendations.push(
        "No protagonist defined. Consider marking your main character as protagonist."
      );
    }

    const flatProtagonists = protagonists.filter((c) => c.arcType === "flat");
    if (flatProtagonists.length > 0) {
      recommendations.push(
        `${flatProtagonists[0].name} shows little emotional change. Consider adding character development.`
      );
    }

    if (averageDevelopment < 50) {
      recommendations.push(
        "Character development scores are low. Add more emotional depth and transformation."
      );
    }

    // Check for characters with very few mentions
    const underutilized = characters.filter((c) => c.totalMentions < 5);
    if (underutilized.length > 0 && underutilized.length < characters.length) {
      recommendations.push(
        `Some characters (${underutilized
          .map((c) => c.name)
          .join(
            ", "
          )}) have very few mentions. Consider giving them more presence or removing them.`
      );
    }
  }

  return {
    characters,
    protagonists,
    totalCharacters: characters.length,
    averageDevelopment,
    recommendations,
  };
}

/**
 * Analyze using automatic character detection (Free/Premium tiers)
 */
function analyzeWithAutoDetection(text: string): CharacterAnalysisResult {
  // Extract character names
  const characterNames = extractCharacterNames(text);

  if (characterNames.size === 0) {
    return {
      characters: [],
      protagonists: [],
      totalCharacters: 0,
      averageDevelopment: 0,
      recommendations: [
        "No characters detected. Ensure character names are capitalized and mentioned multiple times.",
      ],
    };
  }

  // Calculate total mentions across all characters
  const totalMentions = Array.from(characterNames.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  // Analyze each character
  const characters: CharacterProfile[] = [];

  for (const [name, count] of characterNames.entries()) {
    const mentions = extractCharacterMentions(text, name);
    const trajectory = calculateEmotionalTrajectory(mentions);
    const arcType = determineArcType(trajectory);
    const role = determineRole(count, totalMentions);
    const developmentScore = calculateDevelopmentScore(
      arcType,
      trajectory,
      count
    );

    const dialogueMentions = mentions.filter((m) => m.inDialogue).length;
    const dialogueRatio =
      mentions.length > 0 ? dialogueMentions / mentions.length : 0;

    characters.push({
      name,
      mentions,
      totalMentions: count,
      firstAppearance: mentions[0]?.position || 0,
      lastAppearance: mentions[mentions.length - 1]?.position || 0,
      emotionalTrajectory: trajectory,
      dialogueRatio,
      role,
      arcType,
      developmentScore,
    });
  }

  // Sort by mention count (most mentioned first)
  characters.sort((a, b) => b.totalMentions - a.totalMentions);

  // Identify protagonists (top characters with protagonist role)
  const protagonists = characters
    .filter((c) => c.role === "protagonist")
    .map((c) => c.name);

  // Calculate average development
  const avgDevelopment =
    characters.length > 0
      ? Math.round(
          characters.reduce((sum, c) => sum + c.developmentScore, 0) /
            characters.length
        )
      : 0;

  // Generate recommendations
  const recommendations: string[] = [];

  if (protagonists.length === 0) {
    recommendations.push(
      "No clear protagonist detected. Consider giving your main character more presence."
    );
  }

  const flatProtagonists = characters.filter(
    (c) => c.role === "protagonist" && c.arcType === "flat"
  );
  if (flatProtagonists.length > 0) {
    recommendations.push(
      `${flatProtagonists[0].name} shows little emotional change. Consider adding character development.`
    );
  }

  const minorCharacterCount = characters.filter(
    (c) => c.role === "minor"
  ).length;
  if (minorCharacterCount > characters.length * 0.7) {
    recommendations.push(
      "Many minor characters detected. Consider consolidating or giving some more depth."
    );
  }

  if (avgDevelopment < 50) {
    recommendations.push(
      "Character development scores are low. Add more emotional depth and transformation."
    );
  }

  return {
    characters,
    protagonists,
    totalCharacters: characters.length,
    averageDevelopment: avgDevelopment,
    recommendations,
  };
}

// ============================================================================
// 22-STEP CHARACTER ARC ANALYSIS
// ============================================================================

import {
  CHARACTER_ARC_STEPS,
  ArcStep,
  getStepColor,
  POSITION_LABELS,
} from "@/data/characterArcSteps";

export interface CharacterArcProgress {
  characterId: string;
  characterName: string;
  traits: string[];
  detectedSteps: DetectedArcStep[];
  currentPhase: ArcStep["storyPosition"];
  completionPercentage: number;
  arcSummary: string;
}

export interface DetectedArcStep {
  step: ArcStep;
  confidence: number; // 0-100
  evidenceSnippets: string[];
  position: number; // position in text where detected
}

/**
 * Analyze a character's progression through the 22-step arc
 */
export function analyzeCharacterArc(
  characterName: string,
  characterTraits: string[],
  text: string,
  linkedNames: string[] = []
): CharacterArcProgress {
  const allNames = [characterName, ...linkedNames].filter(Boolean);
  const textLower = text.toLowerCase();
  const detectedSteps: DetectedArcStep[] = [];

  // Split text into sections for position-based analysis
  const textLength = text.length;
  const sections = {
    beginning: text.slice(0, textLength * 0.2),
    early: text.slice(textLength * 0.2, textLength * 0.35),
    middle: text.slice(textLength * 0.35, textLength * 0.6),
    late: text.slice(textLength * 0.6, textLength * 0.8),
    climax: text.slice(textLength * 0.8, textLength * 0.9),
    end: text.slice(textLength * 0.9),
  };

  // For each arc step, check if the character shows evidence of it
  CHARACTER_ARC_STEPS.forEach((step) => {
    let confidence = 0;
    const evidenceSnippets: string[] = [];
    let position = 0;

    // Check for keywords near character mentions
    allNames.forEach((name) => {
      const nameLower = name.toLowerCase();

      // Search for character name in text
      let searchStart = 0;
      while (true) {
        const nameIndex = textLower.indexOf(nameLower, searchStart);
        if (nameIndex === -1) break;

        // Get context around the mention (200 chars before and after)
        const contextStart = Math.max(0, nameIndex - 200);
        const contextEnd = Math.min(text.length, nameIndex + name.length + 200);
        const context = text.slice(contextStart, contextEnd).toLowerCase();

        // Check for step keywords in context
        step.keywords.forEach((keyword) => {
          if (context.includes(keyword.toLowerCase())) {
            confidence += 10;
            // Extract a snippet around the keyword
            const keywordIndex = context.indexOf(keyword.toLowerCase());
            if (keywordIndex !== -1) {
              const snippetStart = Math.max(0, keywordIndex - 50);
              const snippetEnd = Math.min(
                context.length,
                keywordIndex + keyword.length + 50
              );
              const snippet = text
                .slice(contextStart + snippetStart, contextStart + snippetEnd)
                .trim();
              if (snippet.length > 20 && !evidenceSnippets.includes(snippet)) {
                evidenceSnippets.push(snippet);
              }
            }
            if (position === 0) position = nameIndex;
          }
        });

        searchStart = nameIndex + 1;
      }
    });

    // Boost confidence if found in the expected story section
    const expectedSection = sections[step.storyPosition];
    if (expectedSection) {
      allNames.forEach((name) => {
        if (expectedSection.toLowerCase().includes(name.toLowerCase())) {
          step.keywords.forEach((keyword) => {
            if (expectedSection.toLowerCase().includes(keyword.toLowerCase())) {
              confidence += 5;
            }
          });
        }
      });
    }

    // Check for trait-related evidence
    characterTraits.forEach((trait) => {
      const traitLower = trait.toLowerCase();
      // Some traits correlate with certain arc steps
      const traitStepCorrelations: Record<number, string[]> = {
        3: ["fearful", "hesitant", "cautious", "reluctant"], // Refusal
        8: ["brave", "determined", "resilient"], // Ordeal
        11: ["transformed", "changed", "reborn"], // Resurrection
        13: ["insecure", "flawed", "mistaken"], // The Lie
        19: ["defeated", "hopeless", "lost"], // All Is Lost
        21: ["decisive", "courageous", "determined"], // Climactic Decision
      };
      if (traitStepCorrelations[step.id]?.some((t) => traitLower.includes(t))) {
        confidence += 15;
      }
    });

    // Cap confidence at 100
    confidence = Math.min(100, confidence);

    // Only include steps with reasonable confidence
    if (confidence >= 15 || evidenceSnippets.length > 0) {
      detectedSteps.push({
        step,
        confidence,
        evidenceSnippets: evidenceSnippets.slice(0, 3), // Limit to 3 snippets
        position,
      });
    }
  });

  // Sort detected steps by story position and confidence
  detectedSteps.sort((a, b) => {
    const posOrder = {
      beginning: 0,
      early: 1,
      middle: 2,
      late: 3,
      climax: 4,
      end: 5,
    };
    if (posOrder[a.step.storyPosition] !== posOrder[b.step.storyPosition]) {
      return posOrder[a.step.storyPosition] - posOrder[b.step.storyPosition];
    }
    return b.confidence - a.confidence;
  });

  // Determine current phase based on highest confidence steps
  let currentPhase: ArcStep["storyPosition"] = "beginning";
  if (detectedSteps.length > 0) {
    // Find the latest phase with high confidence
    const highConfidenceSteps = detectedSteps.filter((s) => s.confidence >= 30);
    if (highConfidenceSteps.length > 0) {
      const latestStep = highConfidenceSteps.reduce((latest, current) => {
        const posOrder = {
          beginning: 0,
          early: 1,
          middle: 2,
          late: 3,
          climax: 4,
          end: 5,
        };
        return posOrder[current.step.storyPosition] >
          posOrder[latest.step.storyPosition]
          ? current
          : latest;
      });
      currentPhase = latestStep.step.storyPosition;
    }
  }

  // Calculate completion percentage
  const totalSteps = CHARACTER_ARC_STEPS.length;
  const detectedCount = detectedSteps.filter((s) => s.confidence >= 25).length;
  const completionPercentage = Math.round((detectedCount / totalSteps) * 100);

  // Generate arc summary
  let arcSummary = "";
  if (completionPercentage < 20) {
    arcSummary = `${characterName}'s arc is just beginning. Consider developing their journey further.`;
  } else if (completionPercentage < 40) {
    arcSummary = `${characterName} is in the early stages of transformation. Key arc beats are emerging.`;
  } else if (completionPercentage < 60) {
    arcSummary = `${characterName}'s arc is developing well through the middle stages.`;
  } else if (completionPercentage < 80) {
    arcSummary = `${characterName} is approaching their transformation climax.`;
  } else {
    arcSummary = `${characterName} shows a complete character arc with strong transformation.`;
  }

  return {
    characterId: characterName.toLowerCase().replace(/\s+/g, "-"),
    characterName,
    traits: characterTraits,
    detectedSteps,
    currentPhase,
    completionPercentage,
    arcSummary,
  };
}

/**
 * Analyze all characters and their arc progressions
 */
export function analyzeAllCharacterArcs(
  text: string,
  savedCharacters?: Character[]
): CharacterArcProgress[] {
  const results: CharacterArcProgress[] = [];

  // First, analyze saved characters if provided
  if (savedCharacters && savedCharacters.length > 0) {
    savedCharacters.forEach((char) => {
      const progress = analyzeCharacterArc(
        char.name,
        char.traits || [],
        text,
        char.linkedNames || []
      );
      // Use the saved character ID
      progress.characterId = char.id;
      results.push(progress);
    });
  }

  // Also detect characters from text analysis
  const textAnalysis = analyzeCharacters(text);

  // Add any detected characters not already in saved characters
  textAnalysis.characters.forEach((detected) => {
    const alreadyIncluded = results.some(
      (r) => r.characterName.toLowerCase() === detected.name.toLowerCase()
    );
    if (!alreadyIncluded && detected.role !== "minor") {
      const progress = analyzeCharacterArc(detected.name, [], text, []);
      results.push(progress);
    }
  });

  // Sort by completion percentage
  results.sort((a, b) => b.completionPercentage - a.completionPercentage);

  return results;
}

// Re-export arc step utilities for use elsewhere
export { CHARACTER_ARC_STEPS, getStepColor, POSITION_LABELS };
export type { ArcStep };
