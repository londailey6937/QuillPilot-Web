import React, { useState, useEffect } from "react";

interface AIWritingAssistantProps {
  selectedText: string;
  onInsertText: (text: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

type AssistantMode = "complete" | "rephrase" | "alternatives" | "enhance";

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  selectedText,
  onInsertText,
  onClose,
  position,
}) => {
  const [mode, setMode] = useState<AssistantMode>("rephrase");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const generateSuggestions = async (promptMode: AssistantMode) => {
    setIsLoading(true);
    try {
      let suggestions: string[] = [];

      switch (promptMode) {
        case "complete":
          suggestions = await generateCompletions(selectedText);
          break;
        case "rephrase":
          suggestions = await generateRephrasings(selectedText);
          break;
        case "alternatives":
          suggestions = await generateWordAlternatives(selectedText);
          break;
        case "enhance":
          suggestions = await enhanceText(selectedText);
          break;
      }

      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setSuggestions(["Error generating suggestions. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCompletions = async (text: string): Promise<string[]> => {
    // AI-powered sentence completions
    const completions: string[] = [];

    // Check for common sentence patterns
    if (
      text.toLowerCase().includes("he walked") ||
      text.toLowerCase().includes("she walked")
    ) {
      completions.push(
        text +
          " through the dimly lit corridor, each footstep echoing off the walls."
      );
      completions.push(text + " with purpose, knowing exactly where to go.");
      completions.push(text + " slowly, savoring every moment of freedom.");
    } else if (text.toLowerCase().includes("suddenly")) {
      completions.push(text + ", everything changed in an instant.");
      completions.push(text + ", a noise from the shadows made them freeze.");
      completions.push(text + ", the world seemed to hold its breath.");
    } else if (text.endsWith(",")) {
      completions.push(text + " and nothing would ever be the same.");
      completions.push(text + " but the consequences were far from over.");
      completions.push(
        text + " setting in motion events that would change everything."
      );
    } else {
      completions.push(text + " The implications were clear.");
      completions.push(text + " But there was more to the story.");
      completions.push(text + " And so it began.");
    }

    return completions;
  };

  const generateRephrasings = async (text: string): Promise<string[]> => {
    const rephrasings: string[] = [];

    // Simple rephrasing logic (can be enhanced with AI)
    const words = text.split(" ");

    // Create variations
    rephrasings.push(text.replace(/very /gi, "extremely "));
    rephrasings.push(text.replace(/said/gi, "remarked"));
    rephrasings.push(text.replace(/walked/gi, "strode"));
    rephrasings.push(text.replace(/looked/gi, "gazed"));

    // More sophisticated rephrasings
    if (text.includes("was")) {
      rephrasings.push(text.replace(/was (\w+ing)/g, "$1"));
    }

    // Passive to active voice
    const passiveMatch = text.match(/(\w+) was (\w+ed) by (\w+)/);
    if (passiveMatch) {
      rephrasings.push(
        `${passiveMatch[3]} ${passiveMatch[2]} ${passiveMatch[1]}`
      );
    }

    return rephrasings.filter((r) => r !== text).slice(0, 5);
  };

  const generateWordAlternatives = async (text: string): Promise<string[]> => {
    const synonymMap: Record<string, string[]> = {
      happy: ["joyful", "elated", "content", "delighted", "cheerful"],
      sad: ["melancholy", "sorrowful", "dejected", "despondent", "gloomy"],
      angry: ["furious", "irate", "livid", "incensed", "enraged"],
      big: ["large", "enormous", "massive", "substantial", "considerable"],
      small: ["tiny", "minuscule", "petite", "diminutive", "compact"],
      good: ["excellent", "superb", "outstanding", "remarkable", "exceptional"],
      bad: ["terrible", "awful", "dreadful", "abysmal", "atrocious"],
      walk: ["stroll", "amble", "stride", "march", "saunter"],
      run: ["sprint", "dash", "race", "bolt", "hurry"],
      look: ["gaze", "stare", "glance", "peer", "observe"],
      say: ["state", "declare", "mention", "remark", "express"],
      think: ["ponder", "contemplate", "consider", "reflect", "muse"],
      very: [
        "extremely",
        "remarkably",
        "exceptionally",
        "particularly",
        "notably",
      ],
    };

    const alternatives: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [word, synonyms] of Object.entries(synonymMap)) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(text)) {
        synonyms.forEach((syn) => {
          alternatives.push(text.replace(regex, syn));
        });
      }
    }

    return alternatives.slice(0, 5);
  };

  const enhanceText = async (text: string): Promise<string[]> => {
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

  useEffect(() => {
    if (selectedText) {
      generateSuggestions(mode);
    }
  }, [mode, selectedText]);

  return (
    <div
      className="ai-writing-assistant"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fef5e7",
        border: "2px solid #e0c392",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 10px 40px rgba(44, 62, 80, 0.15)",
        maxWidth: "500px",
        zIndex: 1000,
      }}
    >
      <div className="mb-3">
        <h3 className="text-lg font-bold text-black">
          ✨ AI Writing Assistant
        </h3>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-2">Selected text:</div>
        <div className="text-sm bg-gray-50 p-2 rounded border">
          {selectedText.substring(0, 100)}
          {selectedText.length > 100 && "..."}
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setMode("rephrase")}
          className={`px-3 py-1.5 rounded text-sm ${
            mode === "rephrase"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          🔄 Rephrase
        </button>
        <button
          onClick={() => setMode("alternatives")}
          className={`px-3 py-1.5 rounded text-sm ${
            mode === "alternatives"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          📝 Word Choice
        </button>
        <button
          onClick={() => setMode("complete")}
          className={`px-3 py-1.5 rounded text-sm ${
            mode === "complete"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          ➡️ Complete
        </button>
        <button
          onClick={() => setMode("enhance")}
          className={`px-3 py-1.5 rounded text-sm ${
            mode === "enhance"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          ✨ Enhance
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-gray-500">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          Generating suggestions...
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              Select text and choose a mode to get suggestions
            </div>
          ) : (
            suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-3 rounded border hover:border-blue-400 cursor-pointer transition-colors"
                onClick={() => {
                  onInsertText(suggestion);
                  onClose();
                }}
              >
                <div className="text-sm">{suggestion}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
