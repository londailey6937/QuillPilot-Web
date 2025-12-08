// ManuscriptFormatModal.tsx - Shunn Standard Manuscript Format Configuration
import React, { useState, useEffect, useCallback } from "react";
import { creamPalette as palette } from "../styles/palette";

// Font options for professional manuscript submission
type FontFamilyOption =
  | "courier-new"
  | "courier-prime"
  | "times-new-roman"
  | "georgia"
  | "garamond"
  | "palatino"
  | "book-antiqua"
  | "century-schoolbook"
  | "cambria";

export interface ManuscriptSettings {
  authorName: string;
  authorAddress: string;
  authorCity: string;
  authorState: string;
  authorZip: string;
  authorEmail: string;
  authorPhone: string;
  title: string;
  penName?: string;
  wordCount: number;
  includeRunningHeaders: boolean;
  runningHeaderStyle: "author-title" | "title-only" | "custom";
  customRunningHeader?: string;
  fontFamily: FontFamilyOption;
  fontSize: 12;
  lineSpacing: "double";
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  firstLineIndent: number;
  paragraphSpacing: "none" | "single";
}

interface ManuscriptFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ManuscriptSettings, format: "pdf" | "docx") => void;
  initialSettings?: Partial<ManuscriptSettings>;
  documentTitle?: string;
  documentWordCount: number;
}

const defaultSettings: ManuscriptSettings = {
  authorName: "",
  authorAddress: "",
  authorCity: "",
  authorState: "",
  authorZip: "",
  authorEmail: "",
  authorPhone: "",
  title: "",
  penName: "",
  wordCount: 0,
  includeRunningHeaders: true,
  runningHeaderStyle: "author-title",
  customRunningHeader: "",
  fontFamily: "courier-new",
  fontSize: 12,
  lineSpacing: "double",
  margins: { top: 1, bottom: 1, left: 1, right: 1 },
  firstLineIndent: 0.5,
  paragraphSpacing: "none",
};

// Font configuration with display names and CSS values
const fontOptions: Array<{
  value: FontFamilyOption;
  label: string;
  css: string;
  category: "monospace" | "serif";
}> = [
  {
    value: "courier-new",
    label: "Courier New (Traditional)",
    css: "'Courier New', Courier, monospace",
    category: "monospace",
  },
  {
    value: "courier-prime",
    label: "Courier Prime (Modern)",
    css: "'Courier Prime', 'Courier New', monospace",
    category: "monospace",
  },
  {
    value: "times-new-roman",
    label: "Times New Roman",
    css: "'Times New Roman', Times, serif",
    category: "serif",
  },
  {
    value: "georgia",
    label: "Georgia",
    css: "Georgia, 'Times New Roman', serif",
    category: "serif",
  },
  {
    value: "garamond",
    label: "Garamond",
    css: "Garamond, 'Times New Roman', serif",
    category: "serif",
  },
  {
    value: "palatino",
    label: "Palatino Linotype",
    css: "'Palatino Linotype', Palatino, serif",
    category: "serif",
  },
  {
    value: "book-antiqua",
    label: "Book Antiqua",
    css: "'Book Antiqua', Palatino, serif",
    category: "serif",
  },
  {
    value: "century-schoolbook",
    label: "Century Schoolbook",
    css: "'Century Schoolbook', Georgia, serif",
    category: "serif",
  },
  {
    value: "cambria",
    label: "Cambria",
    css: "Cambria, Georgia, serif",
    category: "serif",
  },
];

// Undo/Redo history management
interface HistoryState {
  past: ManuscriptSettings[];
  present: ManuscriptSettings;
  future: ManuscriptSettings[];
}

const ManuscriptFormatModal: React.FC<ManuscriptFormatModalProps> = ({
  isOpen,
  onClose,
  onExport,
  initialSettings,
  documentTitle,
  documentWordCount,
}) => {
  const [activeTab, setActiveTab] = useState<"author" | "format" | "preview">(
    "author"
  );

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: {
      ...defaultSettings,
      ...initialSettings,
      title: initialSettings?.title || documentTitle || "",
      wordCount: documentWordCount,
    },
    future: [],
  });

  const settings = history.present;

  // Update settings with history tracking
  const updateSettings = useCallback((updates: Partial<ManuscriptSettings>) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: { ...prev.present, ...updates },
      future: [],
    }));
  }, []);

  // Undo function
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Redo function
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Check if undo/redo available
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, undo, redo, onClose]);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("manuscriptSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory({
          past: [],
          present: {
            ...defaultSettings,
            ...parsed,
            wordCount: documentWordCount,
          },
          future: [],
        });
      } catch {
        // Use defaults if parse fails
      }
    }
  }, [documentWordCount]);

  // Save settings to localStorage when they change
  useEffect(() => {
    const toSave = { ...settings };
    delete (toSave as any).wordCount; // Don't persist word count
    localStorage.setItem("manuscriptSettings", JSON.stringify(toSave));
  }, [settings]);

  // Update word count when document changes
  useEffect(() => {
    if (settings.wordCount !== documentWordCount) {
      // Don't add to history for word count updates
      setHistory((prev) => ({
        ...prev,
        present: { ...prev.present, wordCount: documentWordCount },
      }));
    }
  }, [documentWordCount, settings.wordCount]);

  if (!isOpen) return null;

  // Color definitions using cream palette
  const textPrimary = palette.navy;
  const textSecondary = "#5a6a7a";

  // Get CSS font family for preview
  const getCurrentFontCSS = () => {
    const font = fontOptions.find((f) => f.value === settings.fontFamily);
    return font?.css || "'Courier New', monospace";
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 10001 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: palette.base,
          border: `2px solid ${palette.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Undo/Redo */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: palette.border }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
              📜 Shunn Manuscript Format
            </h2>
            <p className="text-sm mt-1" style={{ color: textSecondary }}>
              Industry-standard format for fiction submissions
            </p>
          </div>
          {/* Undo/Redo buttons */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
              style={{
                backgroundColor: canUndo ? "white" : palette.base,
                color: canUndo ? textPrimary : textSecondary,
                borderColor: palette.border,
                opacity: canUndo ? 1 : 0.5,
                cursor: canUndo ? "pointer" : "not-allowed",
              }}
              title="Undo (Cmd+Z)"
            >
              ↩ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
              style={{
                backgroundColor: canRedo ? "white" : palette.base,
                color: canRedo ? textPrimary : textSecondary,
                borderColor: palette.border,
                opacity: canRedo ? 1 : 0.5,
                cursor: canRedo ? "pointer" : "not-allowed",
              }}
              title="Redo (Cmd+Shift+Z)"
            >
              Redo ↪
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: palette.border, backgroundColor: palette.base }}
        >
          {[
            { id: "author", label: "Author Info", icon: "👤" },
            { id: "format", label: "Format Options", icon: "⚙️" },
            { id: "preview", label: "Preview", icon: "👁️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "author" | "format" | "preview")
              }
              className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                color: activeTab === tab.id ? palette.accent : textSecondary,
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${palette.accent}`
                    : "2px solid transparent",
                backgroundColor: activeTab === tab.id ? "white" : "transparent",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "author" && (
            <div className="space-y-6">
              {/* Author Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  Legal Name *
                </label>
                <input
                  type="text"
                  value={settings.authorName}
                  onChange={(e) =>
                    updateSettings({ authorName: e.target.value })
                  }
                  placeholder="John Smith"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: palette.border,
                    backgroundColor: "white",
                    color: textPrimary,
                  }}
                />
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  Your legal name for payment purposes
                </p>
              </div>

              {/* Pen Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  Pen Name (optional)
                </label>
                <input
                  type="text"
                  value={settings.penName || ""}
                  onChange={(e) => updateSettings({ penName: e.target.value })}
                  placeholder="J.R. Writer"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: palette.border,
                    backgroundColor: "white",
                    color: textPrimary,
                  }}
                />
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  Name that will appear as the author on your manuscript
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  Street Address
                </label>
                <input
                  type="text"
                  value={settings.authorAddress}
                  onChange={(e) =>
                    updateSettings({ authorAddress: e.target.value })
                  }
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: palette.border,
                    backgroundColor: "white",
                    color: textPrimary,
                  }}
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={settings.authorCity}
                    onChange={(e) =>
                      updateSettings({ authorCity: e.target.value })
                    }
                    placeholder="New York"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: "white",
                      color: textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    State
                  </label>
                  <input
                    type="text"
                    value={settings.authorState}
                    onChange={(e) =>
                      updateSettings({ authorState: e.target.value })
                    }
                    placeholder="NY"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: "white",
                      color: textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={settings.authorZip}
                    onChange={(e) =>
                      updateSettings({ authorZip: e.target.value })
                    }
                    placeholder="10001"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: "white",
                      color: textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.authorEmail}
                    onChange={(e) =>
                      updateSettings({ authorEmail: e.target.value })
                    }
                    placeholder="author@example.com"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: "white",
                      color: textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={settings.authorPhone}
                    onChange={(e) =>
                      updateSettings({ authorPhone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: "white",
                      color: textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* Story Title */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  Story Title *
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => updateSettings({ title: e.target.value })}
                  placeholder="My Amazing Story"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: palette.border,
                    backgroundColor: "white",
                    color: textPrimary,
                  }}
                />
              </div>

              {/* Word Count Display */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "white",
                  borderColor: palette.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: textPrimary }}>
                    Word Count
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: palette.accent }}
                  >
                    {settings.wordCount.toLocaleString()} words
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  Will be rounded to nearest 100 on title page (~
                  {Math.round(settings.wordCount / 100) * 100})
                </p>
              </div>
            </div>
          )}

          {activeTab === "format" && (
            <div className="space-y-6">
              {/* Font Selection */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  Font Family
                </label>
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: textSecondary }}>
                    Monospace (Traditional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fontOptions
                      .filter((f) => f.category === "monospace")
                      .map((font) => (
                        <button
                          key={font.value}
                          onClick={() =>
                            updateSettings({ fontFamily: font.value })
                          }
                          className="px-3 py-2 rounded-lg border transition-all text-sm"
                          style={{
                            fontFamily: font.css,
                            backgroundColor:
                              settings.fontFamily === font.value
                                ? palette.accent
                                : "white",
                            color:
                              settings.fontFamily === font.value
                                ? "white"
                                : textPrimary,
                            borderColor:
                              settings.fontFamily === font.value
                                ? palette.accent
                                : palette.border,
                            boxShadow:
                              settings.fontFamily === font.value
                                ? `0 0 0 1px ${palette.accent}`
                                : "none",
                          }}
                        >
                          {font.label}
                        </button>
                      ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color: textSecondary }}>
                    Serif (Modern)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fontOptions
                      .filter((f) => f.category === "serif")
                      .map((font) => (
                        <button
                          key={font.value}
                          onClick={() =>
                            updateSettings({ fontFamily: font.value })
                          }
                          className="px-3 py-2 rounded-lg border transition-all text-sm"
                          style={{
                            fontFamily: font.css,
                            backgroundColor:
                              settings.fontFamily === font.value
                                ? palette.accent
                                : "white",
                            color:
                              settings.fontFamily === font.value
                                ? "white"
                                : textPrimary,
                            borderColor:
                              settings.fontFamily === font.value
                                ? palette.accent
                                : palette.border,
                            boxShadow:
                              settings.fontFamily === font.value
                                ? `0 0 0 1px ${palette.accent}`
                                : "none",
                          }}
                        >
                          {font.label}
                        </button>
                      ))}
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: textSecondary }}>
                  Courier New is the traditional standard. Times New Roman is
                  increasingly accepted.
                </p>
              </div>

              {/* Running Headers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: textPrimary }}
                  >
                    Running Headers
                  </label>
                  <button
                    onClick={() =>
                      updateSettings({
                        includeRunningHeaders: !settings.includeRunningHeaders,
                      })
                    }
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: settings.includeRunningHeaders
                        ? palette.accent
                        : palette.border,
                    }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{
                        left: settings.includeRunningHeaders
                          ? "calc(100% - 20px)"
                          : "4px",
                      }}
                    />
                  </button>
                </div>
                {settings.includeRunningHeaders && (
                  <div className="space-y-3 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "author-title", label: "Author / TITLE" },
                        { value: "title-only", label: "TITLE Only" },
                        { value: "custom", label: "Custom" },
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() =>
                            updateSettings({
                              runningHeaderStyle:
                                style.value as ManuscriptSettings["runningHeaderStyle"],
                            })
                          }
                          className="px-3 py-2 rounded-lg border transition-all text-sm"
                          style={{
                            backgroundColor:
                              settings.runningHeaderStyle === style.value
                                ? palette.accent
                                : "white",
                            color:
                              settings.runningHeaderStyle === style.value
                                ? "white"
                                : textPrimary,
                            borderColor:
                              settings.runningHeaderStyle === style.value
                                ? palette.accent
                                : palette.border,
                            boxShadow:
                              settings.runningHeaderStyle === style.value
                                ? `0 0 0 1px ${palette.accent}`
                                : "none",
                          }}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                    {settings.runningHeaderStyle === "custom" && (
                      <input
                        type="text"
                        value={settings.customRunningHeader || ""}
                        onChange={(e) =>
                          updateSettings({
                            customRunningHeader: e.target.value,
                          })
                        }
                        placeholder="Custom header text"
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          borderColor: palette.border,
                          backgroundColor: "white",
                          color: textPrimary,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Margins */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  Margins (inches)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {["top", "bottom", "left", "right"].map((side) => (
                    <div key={side}>
                      <label
                        className="block text-xs mb-1 capitalize"
                        style={{ color: textSecondary }}
                      >
                        {side}
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0.5"
                        max="2"
                        value={
                          settings.margins[
                            side as keyof typeof settings.margins
                          ]
                        }
                        onChange={(e) =>
                          updateSettings({
                            margins: {
                              ...settings.margins,
                              [side]: parseFloat(e.target.value) || 1,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-center"
                        style={{
                          borderColor: palette.border,
                          backgroundColor: "white",
                          color: textPrimary,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* First Line Indent */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  First Line Indent
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.125"
                    value={settings.firstLineIndent}
                    onChange={(e) =>
                      updateSettings({
                        firstLineIndent: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1"
                    style={{ accentColor: palette.accent }}
                  />
                  <span
                    className="text-sm font-medium w-16"
                    style={{ color: textPrimary }}
                  >
                    {settings.firstLineIndent}" indent
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  Standard is 0.5 inches (half inch)
                </p>
              </div>

              {/* Standard Format Info */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  borderColor: palette.border,
                  backgroundColor: "white",
                }}
              >
                <h4 className="font-medium mb-2" style={{ color: textPrimary }}>
                  📋 Standard Shunn Format Specifications
                </h4>
                <ul
                  className="text-sm space-y-1"
                  style={{ color: textSecondary }}
                >
                  <li>• 12pt Courier or Times New Roman</li>
                  <li>• Double-spaced throughout</li>
                  <li>• 1-inch margins on all sides</li>
                  <li>
                    • 0.5-inch first line indent (no extra line between
                    paragraphs)
                  </li>
                  <li>• Running header: Last Name / TITLE / Page #</li>
                  <li>• Title page with contact info, word count</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              {/* Title Page Preview */}
              <div
                className="p-8 rounded-lg border bg-white relative"
                style={{
                  borderColor: palette.border,
                  fontFamily: getCurrentFontCSS(),
                  fontSize: "11px",
                  lineHeight: "2",
                  minHeight: "400px",
                }}
              >
                {/* Contact info (top-left) */}
                <div className="absolute top-6 left-8">
                  <div>{settings.authorName || "Your Name"}</div>
                  <div>{settings.authorAddress || "123 Main Street"}</div>
                  <div>
                    {settings.authorCity || "City"},{" "}
                    {settings.authorState || "ST"}{" "}
                    {settings.authorZip || "12345"}
                  </div>
                  {settings.authorEmail && <div>{settings.authorEmail}</div>}
                  {settings.authorPhone && <div>{settings.authorPhone}</div>}
                </div>

                {/* Word count (top-right) */}
                <div className="absolute top-6 right-8 text-right">
                  About {Math.round(settings.wordCount / 100) * 100 || 5000}{" "}
                  words
                </div>

                {/* Title (center) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-base uppercase tracking-wide">
                    {settings.title || "YOUR STORY TITLE"}
                  </div>
                  <div className="mt-4">by</div>
                  <div className="mt-2">
                    {settings.penName || settings.authorName || "Author Name"}
                  </div>
                </div>

                {/* Running header preview indicator */}
                {settings.includeRunningHeaders && (
                  <div
                    className="absolute top-1 right-8 text-xs"
                    style={{ color: textSecondary }}
                  >
                    Header:{" "}
                    {settings.runningHeaderStyle === "author-title"
                      ? `${(settings.authorName || "Doe")
                          .split(" ")
                          .pop()} / ${(
                          settings.title || "TITLE"
                        ).toUpperCase()}`
                      : settings.runningHeaderStyle === "title-only"
                      ? (settings.title || "TITLE").toUpperCase()
                      : settings.customRunningHeader || "Custom Header"}
                  </div>
                )}
              </div>

              <p
                className="text-xs text-center"
                style={{ color: textSecondary }}
              >
                This is a simplified preview. Actual export will include proper
                page breaks, margins, and formatting.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Export Buttons */}
        <div
          className="px-6 py-4 border-t flex justify-end gap-3"
          style={{ borderColor: palette.border, backgroundColor: palette.base }}
        >
          <button
            onClick={() => onExport(settings, "pdf")}
            disabled={!settings.authorName || !settings.title}
            className="px-4 py-2 rounded-lg font-medium transition-colors border"
            style={{
              backgroundColor:
                settings.authorName && settings.title ? "white" : palette.base,
              color:
                settings.authorName && settings.title
                  ? textPrimary
                  : textSecondary,
              borderColor: palette.border,
              opacity: settings.authorName && settings.title ? 1 : 0.5,
              cursor:
                settings.authorName && settings.title
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => onExport(settings, "docx")}
            disabled={!settings.authorName || !settings.title}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor:
                settings.authorName && settings.title
                  ? palette.accent
                  : palette.border,
              color: "white",
              opacity: settings.authorName && settings.title ? 1 : 0.5,
              cursor:
                settings.authorName && settings.title
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            📝 Export DOCX
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptFormatModal;
