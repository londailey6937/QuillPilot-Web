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

  const closePanel = () => {
    setIsPanelOpen(false);
    setActiveTool(null);
  };

  return (
    <>
      {/* Backdrop - click outside to close */}
      {(isPanelOpen || activeTool) && (
        <div
          onClick={closePanel}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
          }}
        />
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "64px",
          height: "64px",
          borderRadius: "999px",
          border: "2px solid #e0c392",
          background: "linear-gradient(135deg, #f5ead9 0%, #f5e6d3 100%)",
          color: "#2c3e50",
          fontWeight: 600,
          fontSize: "24px",
          boxShadow: "0 4px 16px rgba(44, 62, 80, 0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(44, 62, 80, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(44, 62, 80, 0.15)";
        }}
        title="Advanced Writing Tools"
      >
        {isPanelOpen ? "×" : "🛠️"}
      </button>

      {/* Tools Panel */}
      {isPanelOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            right: "24px",
            bottom: "96px",
            background: "#fef5e7",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(44, 62, 80, 0.15)",
            border: "2px solid #e0c392",
            padding: "24px",
            zIndex: 50,
            maxWidth: "400px",
            maxHeight: "600px",
            overflow: "auto",
          }}
        >
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#2c3e50",
            }}
          >
            🛠️ Advanced Tools
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "16px",
                  borderRadius: "12px",
                  border:
                    activeTool === tool.id
                      ? "2px solid #ef8432"
                      : "2px solid #e0c392",
                  background: activeTool === tool.id ? "#f7e6d0" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== tool.id) {
                    e.currentTarget.style.background = "#f7e6d0";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(44, 62, 80, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== tool.id) {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
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

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f5e6d3",
              borderRadius: "12px",
              border: "1px solid #e0c392",
            }}
          >
            <div style={{ fontSize: "14px", color: "#2c3e50" }}>
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
