import React, { useState, useEffect } from "react";

interface AIWritingAssistantProps {
  selectedText: string;
  onInsertText: (text: string) => void;
  onReplaceText?: (oldText: string, newText: string) => void;
  onClose: () => void;
  onOpenHelp?: () => void;
  position?: { top: number; left: number };
}

type AssistantMode = "rephrase" | "alternatives" | "complete" | "enhance";

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  selectedText,
  onInsertText,
  onReplaceText,
  onClose,
  onOpenHelp,
  position,
}) => {
  const [mode, setMode] = useState<AssistantMode | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async (promptMode: AssistantMode) => {
    setIsLoading(true);
    setMode(promptMode);
    try {
      let results: string[] = [];

      switch (promptMode) {
        case "rephrase":
          results = generateRephrasings(selectedText);
          break;
        case "alternatives":
          results = generateWordAlternatives(selectedText);
          break;
        case "complete":
          results = generateCompletions(selectedText);
          break;
        case "enhance":
          results = enhanceText(selectedText);
          break;
      }

      setSuggestions(results);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setSuggestions(["Error generating suggestions. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRephrasings = (text: string): string[] => {
    const rephrasings: string[] = [];

    // Sentence structure variations
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      // Reverse sentence order
      rephrasings.push(sentences.reverse().join(" "));
    }

    // Word order variation for simple sentences
    const words = text.split(" ");
    if (words.length >= 3 && words.length <= 10) {
      // Move first word to end
      const shifted = [...words.slice(1), words[0].toLowerCase()];
      shifted[0] = shifted[0].charAt(0).toUpperCase() + shifted[0].slice(1);
      rephrasings.push(shifted.join(" "));
    }

    // Common word replacements
    const replacements: [RegExp, string][] = [
      [/\bvery\b/gi, "quite"],
      [/\bvery\b/gi, "extremely"],
      [/\breally\b/gi, "truly"],
      [/\bbut\b/gi, "however,"],
      [/\balso\b/gi, "additionally"],
      [/\bsaid\b/gi, "stated"],
      [/\bsaid\b/gi, "mentioned"],
      [/\blooked\b/gi, "glanced"],
      [/\bwalked\b/gi, "moved"],
      [/\bwent\b/gi, "proceeded"],
      [/\bgot\b/gi, "obtained"],
      [/\bmade\b/gi, "created"],
      [/\bthing\b/gi, "matter"],
      [/\bgood\b/gi, "excellent"],
      [/\bbad\b/gi, "poor"],
      [/\bbig\b/gi, "large"],
      [/\bsmall\b/gi, "little"],
    ];

    for (const [pattern, replacement] of replacements) {
      if (pattern.test(text)) {
        const rephrased = text.replace(pattern, replacement);
        if (rephrased !== text && !rephrasings.includes(rephrased)) {
          rephrasings.push(rephrased);
        }
      }
    }

    // If no matches found, provide structural variations
    if (rephrasings.length === 0) {
      // Add "In other words" prefix
      rephrasings.push(
        `In other words, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
      );
      // Add "To put it differently" prefix
      rephrasings.push(
        `To put it differently, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
      );
      // Simple restructure with "What this means is"
      rephrasings.push(`What this means is: ${text}`);
    }

    return rephrasings.slice(0, 5);
  };

  const generateWordAlternatives = (text: string): string[] => {
    const synonymMap: Record<string, string[]> = {
      happy: ["joyful", "elated", "content", "delighted", "pleased"],
      sad: ["melancholy", "sorrowful", "dejected", "downcast", "gloomy"],
      angry: ["furious", "irate", "upset", "annoyed", "frustrated"],
      big: ["large", "enormous", "massive", "huge", "substantial"],
      small: ["tiny", "little", "petite", "minor", "compact"],
      good: ["excellent", "great", "fine", "wonderful", "superb"],
      bad: ["terrible", "awful", "poor", "dreadful", "unpleasant"],
      walk: ["stroll", "amble", "stride", "march", "wander"],
      run: ["sprint", "dash", "race", "jog", "hurry"],
      look: ["gaze", "stare", "glance", "peer", "observe"],
      say: ["state", "declare", "mention", "remark", "announce"],
      think: ["believe", "consider", "suppose", "imagine", "reckon"],
      very: ["extremely", "quite", "remarkably", "particularly", "highly"],
      beautiful: ["gorgeous", "stunning", "lovely", "attractive", "elegant"],
      fast: ["quick", "rapid", "swift", "speedy", "brisk"],
      slow: ["gradual", "leisurely", "unhurried", "sluggish", "steady"],
      start: ["begin", "commence", "initiate", "launch", "embark"],
      end: ["finish", "conclude", "complete", "terminate", "wrap up"],
      help: ["assist", "aid", "support", "guide", "facilitate"],
      show: ["display", "demonstrate", "reveal", "present", "exhibit"],
      make: ["create", "produce", "build", "construct", "form"],
      get: ["obtain", "acquire", "receive", "gain", "secure"],
      use: ["utilize", "employ", "apply", "implement", "operate"],
      want: ["desire", "wish", "seek", "crave", "long for"],
      need: ["require", "demand", "necessitate", "call for", "depend on"],
      know: ["understand", "realize", "recognize", "comprehend", "grasp"],
      see: ["observe", "notice", "spot", "witness", "view"],
      come: ["arrive", "approach", "reach", "appear", "emerge"],
      go: ["proceed", "advance", "move", "travel", "head"],
      take: ["grab", "seize", "acquire", "accept", "receive"],
      give: ["provide", "offer", "present", "deliver", "grant"],
      find: ["discover", "locate", "uncover", "detect", "identify"],
      tell: ["inform", "notify", "advise", "explain", "describe"],
      ask: ["inquire", "question", "request", "query", "seek"],
      work: ["function", "operate", "perform", "labor", "toil"],
      seem: ["appear", "look", "sound", "feel", "come across as"],
      feel: ["sense", "experience", "perceive", "notice", "undergo"],
      try: ["attempt", "endeavor", "strive", "aim", "seek"],
      leave: ["depart", "exit", "abandon", "vacate", "withdraw"],
      call: ["contact", "phone", "summon", "name", "label"],
      keep: ["maintain", "retain", "preserve", "hold", "sustain"],
      let: ["allow", "permit", "enable", "authorize", "grant"],
      put: ["place", "set", "position", "lay", "deposit"],
      mean: ["signify", "indicate", "imply", "denote", "represent"],
      become: [
        "turn into",
        "grow",
        "develop into",
        "evolve into",
        "transform into",
      ],
      bring: ["carry", "deliver", "transport", "convey", "fetch"],
      begin: ["start", "commence", "initiate", "launch", "open"],
      hold: ["grasp", "grip", "clutch", "clasp", "embrace"],
      write: ["compose", "author", "draft", "pen", "record"],
      provide: ["supply", "furnish", "offer", "give", "deliver"],
      stand: ["rise", "remain", "endure", "tolerate", "bear"],
      lose: ["misplace", "forfeit", "surrender", "sacrifice", "waste"],
      pay: ["compensate", "reimburse", "settle", "remunerate", "fund"],
      meet: ["encounter", "greet", "join", "gather", "assemble"],
      include: ["contain", "comprise", "incorporate", "encompass", "cover"],
      continue: ["proceed", "persist", "carry on", "resume", "maintain"],
      set: ["establish", "arrange", "place", "position", "configure"],
      learn: ["discover", "study", "master", "absorb", "acquire"],
      change: ["alter", "modify", "adjust", "transform", "revise"],
      lead: ["guide", "direct", "head", "conduct", "steer"],
      understand: ["comprehend", "grasp", "fathom", "realize", "perceive"],
      watch: ["observe", "view", "monitor", "survey", "scrutinize"],
      follow: ["pursue", "trail", "track", "shadow", "accompany"],
      stop: ["halt", "cease", "pause", "discontinue", "end"],
      create: ["make", "produce", "generate", "develop", "design"],
      speak: ["talk", "converse", "communicate", "articulate", "express"],
      read: ["peruse", "scan", "study", "examine", "review"],
      allow: ["permit", "enable", "authorize", "let", "grant"],
      add: ["include", "append", "attach", "supplement", "insert"],
      spend: ["use", "expend", "consume", "allocate", "invest"],
      grow: ["expand", "develop", "increase", "flourish", "thrive"],
      open: ["unlock", "unfold", "reveal", "expose", "uncover"],
      move: ["shift", "relocate", "transfer", "transport", "displace"],
      like: ["enjoy", "appreciate", "favor", "prefer", "admire"],
      live: ["reside", "dwell", "inhabit", "exist", "survive"],
      believe: ["think", "consider", "trust", "accept", "assume"],
      happen: ["occur", "take place", "transpire", "unfold", "arise"],
      love: ["adore", "cherish", "treasure", "appreciate", "admire"],
      sit: ["settle", "rest", "perch", "seat oneself", "recline"],
      wait: ["remain", "stay", "linger", "pause", "hold on"],
      send: ["dispatch", "transmit", "deliver", "forward", "ship"],
      expect: ["anticipate", "await", "predict", "foresee", "count on"],
      build: ["construct", "erect", "assemble", "create", "establish"],
      stay: ["remain", "linger", "wait", "reside", "continue"],
      fall: ["drop", "descend", "plunge", "tumble", "collapse"],
      cut: ["slice", "trim", "chop", "carve", "sever"],
      reach: ["arrive at", "attain", "achieve", "get to", "extend to"],
      kill: ["eliminate", "destroy", "slay", "terminate", "end"],
      remain: ["stay", "persist", "endure", "continue", "linger"],
    };

    const alternatives: string[] = [];
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Find matching words and create alternatives
    for (const [word, synonyms] of Object.entries(synonymMap)) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(text)) {
        for (const syn of synonyms.slice(0, 3)) {
          const alt = text.replace(regex, syn);
          if (alt !== text && !alternatives.includes(alt)) {
            alternatives.push(alt);
          }
        }
      }
    }

    // If no direct matches, provide word-by-word alternatives
    if (alternatives.length === 0) {
      alternatives.push(`Consider rephrasing: "${text}"`);
      alternatives.push(
        `No direct synonyms found. Try selecting a single word.`
      );
    }

    return alternatives.slice(0, 5);
  };

  const generateCompletions = (text: string): string[] => {
    const completions: string[] = [];
    const trimmed = text.trim();

    // Generic completions that work with any text
    completions.push(`${trimmed} And that was just the beginning.`);
    completions.push(`${trimmed} The moment hung in the air.`);
    completions.push(`${trimmed} Everything changed after that.`);
    completions.push(`${trimmed} It was more than anyone expected.`);
    completions.push(`${trimmed} The implications were far-reaching.`);

    return completions;
  };

  const enhanceText = (text: string): string[] => {
    const enhancements: string[] = [];

    // Add sensory details
    if (!text.includes("smell") && !text.includes("scent")) {
      enhancements.push(
        `${text} The air carried a faint scent of ${
          ["rain", "coffee", "pine", "smoke", "flowers"][
            Math.floor(Math.random() * 5)
          ]
        }.`
      );
    }

    if (!text.includes("sound") && !text.includes("heard")) {
      enhancements.push(
        `${text} In the distance, ${
          [
            "birds chirped",
            "thunder rumbled",
            "voices murmured",
            "wind howled",
            "music played",
          ][Math.floor(Math.random() * 5)]
        }.`
      );
    }

    // Add emotional depth
    enhancements.push(
      `${text} A wave of ${
        ["anxiety", "relief", "anticipation", "dread", "excitement"][
          Math.floor(Math.random() * 5)
        ]
      } washed over them.`
    );

    // Add visual detail
    enhancements.push(
      `${text} The ${
        ["shadows", "light", "colors", "textures", "patterns"][
          Math.floor(Math.random() * 5)
        ]
      } seemed to ${
        ["dance", "shift", "shimmer", "pulse", "fade"][
          Math.floor(Math.random() * 5)
        ]
      } around them.`
    );

    return enhancements;
  };

  // Don't auto-trigger - wait for user to click a button
  // useEffect removed to prevent auto-generation

  return (
    <div
      className="ai-writing-assistant"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        left: "auto",
        transform: "none",
        background: "#fef5e7",
        border: "2px solid #e0c392",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 10px 40px rgba(44, 62, 80, 0.15)",
        width: "380px",
        maxWidth: "calc(100vw - 40px)",
        maxHeight: "calc(100vh - 40px)",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-[#111827]">
          ✨ AI Writing Assistant
        </h3>
        <button
          onClick={() => onOpenHelp?.()}
          className="text-[#111827] hover:text-blue-600 text-xl leading-none"
          title="Help"
        >
          ?
        </button>
      </div>

      <div className="mb-3">
        <div className="text-sm text-[#111827] mb-1">Selected text:</div>
        <div
          className="text-sm bg-white p-2 rounded border border-gray-300"
          style={{ maxHeight: "80px", overflow: "auto" }}
        >
          {selectedText.substring(0, 200)}
          {selectedText.length > 200 && "..."}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-[#111827] mb-2">Choose an action:</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => generateSuggestions("rephrase")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              mode === "rephrase"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            🔄 Rephrase
          </button>
          <button
            onClick={() => generateSuggestions("alternatives")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              mode === "alternatives"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            📝 Synonyms
          </button>
          <button
            onClick={() => generateSuggestions("complete")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              mode === "complete"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            ➡️ Continue
          </button>
          <button
            onClick={() => generateSuggestions("enhance")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              mode === "enhance"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            ✨ Add Detail
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-[#111827]">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          Generating suggestions...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-sm text-[#111827] text-center py-4 bg-white rounded border border-dashed border-gray-300">
          Click a button above to generate suggestions
        </div>
      ) : (
        <div>
          <div className="text-sm text-[#111827] mb-2">
            Click a suggestion to replace your selection:
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  // Use onReplaceText if available to replace the selected text
                  if (onReplaceText && selectedText) {
                    onReplaceText(selectedText, suggestion);
                  } else {
                    onInsertText(suggestion);
                  }
                  onClose();
                }}
              >
                <div className="text-sm text-[#111827]">{suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
