import React, { useState } from "react";
import { AIWritingAssistant } from "./AIWritingAssistant";
import { DialogueEnhancer } from "./DialogueEnhancer";
import { ReadabilityAnalyzer } from "./ReadabilityAnalyzer";
import { ClicheDetector } from "./ClicheDetector";
import { BeatSheetGenerator } from "./BeatSheetGenerator";
import { POVChecker } from "./POVChecker";
import { EmotionTracker } from "./EmotionTracker";
import { MotifTracker } from "./MotifTracker";

interface AdvancedToolsPanelProps {
  text: string;
  selectedText: string;
  onInsertText?: (text: string) => void;
  onReplaceText?: (oldText: string, newText: string) => void;
  onNavigate?: (position: number) => void;
}

type ActiveTool =
  | "ai-assistant"
  | "dialogue"
  | "readability"
  | "cliche"
  | "beats"
  | "pov"
  | "emotion"
  | "motif"
  | null;

export const AdvancedToolsPanel: React.FC<AdvancedToolsPanelProps> = ({
  text,
  selectedText,
  onInsertText,
  onReplaceText,
  onNavigate,
}) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const tools = [
    {
      id: "ai-assistant" as ActiveTool,
      name: "AI Writing Assistant",
      icon: "✨",
      description: "Get suggestions, rephrasings, and completions",
      color: "bg-blue-500",
      requiresSelection: true,
    },
    {
      id: "dialogue" as ActiveTool,
      name: "Dialogue Enhancer",
      icon: "💬",
      description: "Analyze dialogue flow and character voice",
      color: "bg-purple-500",
      requiresSelection: false,
    },
    {
      id: "readability" as ActiveTool,
      name: "Readability Metrics",
      icon: "📊",
      description: "Check reading level and complexity",
      color: "bg-green-500",
      requiresSelection: false,
    },
    {
      id: "cliche" as ActiveTool,
      name: "Cliché Detector",
      icon: "🚫",
      description: "Find and replace overused phrases",
      color: "bg-red-500",
      requiresSelection: false,
    },
    {
      id: "beats" as ActiveTool,
      name: "Beat Sheet",
      icon: "📖",
      description: "Analyze story structure and pacing",
      color: "bg-orange-500",
      requiresSelection: false,
    },
    {
      id: "pov" as ActiveTool,
      name: "POV Checker",
      icon: "👁️",
      description: "Detect perspective shifts and head-hopping",
      color: "bg-indigo-500",
      requiresSelection: false,
    },
    {
      id: "emotion" as ActiveTool,
      name: "Emotion Tracker",
      icon: "💖",
      description: "Map emotional arcs across chapters",
      color: "bg-pink-500",
      requiresSelection: false,
    },
    {
      id: "motif" as ActiveTool,
      name: "Motif Tracker",
      icon: "🔮",
      description: "Find recurring symbols and themes",
      color: "bg-violet-500",
      requiresSelection: false,
    },
  ];

  const handleToolClick = (toolId: ActiveTool) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool?.requiresSelection && !selectedText) {
      alert("Please select text first to use this tool");
      return;
    }
    setActiveTool(toolId);
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed right-6 bottom-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-110 z-50 flex items-center justify-center text-2xl"
        title="Advanced Writing Tools"
      >
        {isPanelOpen ? "×" : "🛠️"}
      </button>

      {/* Tools Panel */}
      {isPanelOpen && (
        <div
          className="fixed right-6 bottom-24 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6 z-50"
          style={{ maxWidth: "400px", maxHeight: "600px", overflow: "auto" }}
        >
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            🛠️ Advanced Tools
          </h3>
          <div className="space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`w-full text-left p-4 rounded-lg border-2 hover:shadow-md transition-all ${
                  activeTool === tool.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-2xl w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center flex-shrink-0`}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800">{tool.name}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {tool.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> These tools analyze your manuscript to
              improve structure, style, and emotional impact.
            </div>
          </div>
        </div>
      )}

      {/* Tool Modals */}
      {activeTool === "ai-assistant" && selectedText && (
        <AIWritingAssistant
          selectedText={selectedText}
          onInsertText={(text) => {
            if (onInsertText) onInsertText(text);
            closeTool();
          }}
          onClose={closeTool}
        />
      )}

      {activeTool === "dialogue" && (
        <DialogueEnhancer text={text} onClose={closeTool} />
      )}

      {activeTool === "readability" && (
        <ReadabilityAnalyzer text={text} onClose={closeTool} />
      )}

      {activeTool === "cliche" && (
        <ClicheDetector
          text={text}
          onClose={closeTool}
          onReplace={onReplaceText}
        />
      )}

      {activeTool === "beats" && (
        <BeatSheetGenerator
          text={text}
          onClose={closeTool}
          onNavigate={onNavigate}
        />
      )}

      {activeTool === "pov" && (
        <POVChecker text={text} onClose={closeTool} onNavigate={onNavigate} />
      )}

      {activeTool === "emotion" && (
        <EmotionTracker
          text={text}
          onClose={closeTool}
          onNavigate={onNavigate}
        />
      )}

      {activeTool === "motif" && (
        <MotifTracker text={text} onClose={closeTool} onNavigate={onNavigate} />
      )}
    </>
  );
};
