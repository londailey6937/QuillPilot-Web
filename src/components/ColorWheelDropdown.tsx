import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DocumentStylesState, StyleTemplate } from "../types/documentStyles";

interface ColorWheelDropdownProps {
  documentStyles: DocumentStylesState;
  onStyleChange: (
    styleKey: keyof DocumentStylesState,
    property: string,
    value: string | number
  ) => void;
  onApplyTemplate: (template: StyleTemplate) => void;
  onSaveTemplate: (name: string) => void;
  savedTemplates: StyleTemplate[];
  onDeleteTemplate: (templateId: string) => void;
}

// Predefined color palettes
const COLOR_PALETTES = {
  classic: {
    name: "Classic",
    colors: ["#000000", "#333333", "#666666", "#1a365d", "#744210", "#22543d"],
    backgrounds: ["transparent", "#fffaf0", "#f7fafc", "#fffff0", "#fff5f5"],
  },
  modern: {
    name: "Modern",
    colors: ["#1a202c", "#2d3748", "#4a5568", "#2b6cb0", "#9b2c2c", "#276749"],
    backgrounds: ["transparent", "#edf2f7", "#e2e8f0", "#ebf8ff", "#faf5ff"],
  },
  warm: {
    name: "Warm",
    colors: ["#744210", "#9c4221", "#c05621", "#dd6b20", "#ed8936", "#ecc94b"],
    backgrounds: ["transparent", "#fffaf0", "#fef5e7", "#fff5f5", "#fffff0"],
  },
  cool: {
    name: "Cool",
    colors: ["#1a365d", "#2a4365", "#2b6cb0", "#3182ce", "#4299e1", "#63b3ed"],
    backgrounds: ["transparent", "#ebf8ff", "#e6fffa", "#f0fff4", "#edf2f7"],
  },
  nature: {
    name: "Nature",
    colors: ["#22543d", "#276749", "#2f855a", "#38a169", "#48bb78", "#68d391"],
    backgrounds: ["transparent", "#f0fff4", "#e6fffa", "#fffff0", "#fffaf0"],
  },
};

// Style categories for the color wheel
const STYLE_CATEGORIES = [
  {
    key: "paragraph",
    label: "Paragraph",
    icon: "¶",
  },
  {
    key: "book-title",
    label: "Book Title",
    icon: "📖",
  },
  {
    key: "chapter-heading",
    label: "Chapter",
    icon: "📑",
  },
  {
    key: "subtitle",
    label: "Subtitle",
    icon: "📝",
  },
  {
    key: "heading1",
    label: "Heading 1",
    icon: "H1",
  },
  {
    key: "heading2",
    label: "Heading 2",
    icon: "H2",
  },
  {
    key: "blockquote",
    label: "Quote",
    icon: "❝",
  },
];

export function ColorWheelDropdown({
  documentStyles,
  onStyleChange,
  onApplyTemplate,
  onSaveTemplate,
  savedTemplates,
  onDeleteTemplate,
}: ColorWheelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "templates">("colors");
  const [selectedStyle, setSelectedStyle] = useState<string>("paragraph");
  const [selectedPalette, setSelectedPalette] =
    useState<keyof typeof COLOR_PALETTES>("classic");
  const [customColor, setCustomColor] = useState("#000000");
  const [customBgColor, setCustomBgColor] = useState("transparent");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedPortal = portalRef.current?.contains(target);

      if (!clickedButton && !clickedPortal) {
        setIsOpen(false);
      }
    };

    // Delay to avoid immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentStyle =
    documentStyles[selectedStyle as keyof DocumentStylesState];
  const currentColor = (currentStyle as { color?: string })?.color || "#000000";
  const currentBgColor =
    (currentStyle as { backgroundColor?: string })?.backgroundColor ||
    "transparent";

  const handleColorSelect = (color: string) => {
    onStyleChange(selectedStyle as keyof DocumentStylesState, "color", color);
  };

  const handleBgColorSelect = (color: string) => {
    onStyleChange(
      selectedStyle as keyof DocumentStylesState,
      "backgroundColor",
      color
    );
  };

  const handleSaveTemplate = () => {
    if (newTemplateName.trim()) {
      onSaveTemplate(newTemplateName.trim());
      setNewTemplateName("");
      setShowSaveInput(false);
    }
  };

  const palette = COLOR_PALETTES[selectedPalette];

  // Calculate dropdown position based on button
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded transition-colors text-xs ${
          isOpen
            ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
            : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
        }`}
        title="Style Colors & Templates"
      >
        🎨
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={portalRef}
            className="fixed w-80 bg-white rounded-lg shadow-2xl border-2 border-[#e0c392] overflow-hidden"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              maxHeight: "70vh",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 border-b bg-gradient-to-r from-[#fef5e7] to-[#fff7ed]">
              <h3 className="text-sm font-bold text-[#8b5a2b] flex items-center gap-2">
                🎨 Style Colors & Templates
              </h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e0c392]">
              <button
                onClick={() => setActiveTab("colors")}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  activeTab === "colors"
                    ? "bg-[#fef5e7] text-[#ef8432] border-b-2 border-[#ef8432]"
                    : "text-[#6b7280] hover:bg-[#fffaf3]"
                }`}
              >
                🎨 Colors
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  activeTab === "templates"
                    ? "bg-[#fef5e7] text-[#ef8432] border-b-2 border-[#ef8432]"
                    : "text-[#6b7280] hover:bg-[#fffaf3]"
                }`}
              >
                📋 Templates ({savedTemplates.length})
              </button>
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(70vh - 100px)" }}
            >
              {activeTab === "colors" ? (
                <div className="p-3 space-y-3">
                  {/* Style Selector */}
                  <div>
                    <label className="text-xs font-medium text-[#6b4423] block mb-1">
                      Select Style to Color:
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {STYLE_CATEGORIES.map((style) => (
                        <button
                          key={style.key}
                          onClick={() => setSelectedStyle(style.key)}
                          className={`p-1.5 rounded text-xs transition-colors ${
                            selectedStyle === style.key
                              ? "bg-[#ef8432] text-white"
                              : "bg-[#f5ead9] hover:bg-[#eddcc5] text-[#6b4423]"
                          }`}
                          title={style.label}
                        >
                          <div className="text-center">
                            <span className="block text-sm">{style.icon}</span>
                            <span className="block text-[10px] truncate">
                              {style.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Palette Selector */}
                  <div>
                    <label className="text-xs font-medium text-[#6b4423] block mb-1">
                      Color Palette:
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(COLOR_PALETTES).map(([key, p]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setSelectedPalette(
                              key as keyof typeof COLOR_PALETTES
                            )
                          }
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            selectedPalette === key
                              ? "bg-[#ef8432] text-white"
                              : "bg-[#f5ead9] hover:bg-[#eddcc5] text-[#6b4423]"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="text-xs font-medium text-[#6b4423] block mb-1">
                      Text Color:
                    </label>
                    <div className="flex gap-1 flex-wrap items-center">
                      {palette.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                            currentColor === color
                              ? "border-[#ef8432] ring-2 ring-[#ef8432] ring-offset-1"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <div className="flex items-center gap-1 ml-2">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => {
                            setCustomColor(e.target.value);
                            handleColorSelect(e.target.value);
                          }}
                          className="w-7 h-7 rounded cursor-pointer border border-gray-300"
                          title="Custom color"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="text-xs font-medium text-[#6b4423] block mb-1">
                      Background Color:
                    </label>
                    <div className="flex gap-1 flex-wrap items-center">
                      {palette.backgrounds.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleBgColorSelect(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                            currentBgColor === color
                              ? "border-[#ef8432] ring-2 ring-[#ef8432] ring-offset-1"
                              : "border-gray-300"
                          }`}
                          style={{
                            backgroundColor:
                              color === "transparent" ? "#fff" : color,
                            backgroundImage:
                              color === "transparent"
                                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                                : "none",
                            backgroundSize: "8px 8px",
                            backgroundPosition:
                              "0 0, 0 4px, 4px -4px, -4px 0px",
                          }}
                          title={
                            color === "transparent" ? "No background" : color
                          }
                        />
                      ))}
                      <div className="flex items-center gap-1 ml-2">
                        <input
                          type="color"
                          value={
                            customBgColor === "transparent"
                              ? "#ffffff"
                              : customBgColor
                          }
                          onChange={(e) => {
                            setCustomBgColor(e.target.value);
                            handleBgColorSelect(e.target.value);
                          }}
                          className="w-7 h-7 rounded cursor-pointer border border-gray-300"
                          title="Custom background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-2 rounded border border-[#e0c392] bg-[#fffaf3]">
                    <label className="text-xs font-medium text-[#6b4423] block mb-1">
                      Preview:
                    </label>
                    <div
                      className="p-2 rounded"
                      style={{
                        color: currentColor,
                        backgroundColor:
                          currentBgColor === "transparent"
                            ? "white"
                            : currentBgColor,
                        fontWeight:
                          (currentStyle as { fontWeight?: string })
                            ?.fontWeight || "normal",
                        fontStyle:
                          (currentStyle as { fontStyle?: string })?.fontStyle ||
                          "normal",
                        fontSize: `${Math.min(
                          (currentStyle as { fontSize?: number })?.fontSize ||
                            16,
                          18
                        )}px`,
                      }}
                    >
                      Sample text for{" "}
                      {
                        STYLE_CATEGORIES.find((s) => s.key === selectedStyle)
                          ?.label
                      }
                    </div>
                  </div>

                  {/* Save as Template Button */}
                  <div className="pt-2 border-t border-[#e0c392]">
                    {showSaveInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="Template name..."
                          className="flex-1 px-2 py-1 text-xs border border-[#e0c392] rounded focus:outline-none focus:border-[#ef8432]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTemplate();
                            if (e.key === "Escape") setShowSaveInput(false);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveTemplate}
                          className="px-2 py-1 text-xs bg-[#ef8432] text-white rounded hover:bg-[#d97420]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowSaveInput(false)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSaveInput(true)}
                        className="w-full py-1.5 text-xs bg-[#f5ead9] hover:bg-[#eddcc5] text-[#6b4423] rounded transition-colors"
                      >
                        💾 Save Current Styles as Template
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Templates Tab */
                <div className="p-3 space-y-2">
                  {savedTemplates.length === 0 ? (
                    <div className="text-center py-6 text-[#6b7280]">
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-xs">No saved templates yet.</p>
                      <p className="text-xs mt-1">
                        Customize colors and save them as templates!
                      </p>
                    </div>
                  ) : (
                    savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-2 rounded border border-[#e0c392] bg-[#fffaf3] hover:bg-[#fef5e7] transition-colors"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#6b4423]">
                            {template.name}
                          </div>
                          <div className="text-[10px] text-[#6b7280]">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onApplyTemplate(template)}
                            className="px-2 py-1 text-xs bg-[#ef8432] text-white rounded hover:bg-[#d97420]"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => onDeleteTemplate(template.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
