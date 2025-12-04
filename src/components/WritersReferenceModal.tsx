import { useState, useMemo, useEffect } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface WritersReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

/**
 * WritersReferenceModal Component - Comprehensive writer's guide
 *
 * Displays in-depth documentation for Writer Mode, Advanced Tools,
 * productivity features, and writing best practices.
 */
export function WritersReferenceModal({
  isOpen,
  onClose,
  initialSection,
}: WritersReferenceModalProps): JSX.Element | null {
  const [activeSection, setActiveSection] = useState<string>(
    initialSection || "overview"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Update active section when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const sections = {
    overview: "Writer Mode Overview",
    toolbar: "Editor Toolbar",
    advancedTools: "Advanced Tools Panel",
    aiAssistant: "AI Writing Assistant",
    dialogue: "Dialogue Enhancer",
    versionHistory: "Version History",
    comments: "Comments & Annotations",
    beatSheet: "Beat Sheet Generator",
    povChecker: "POV Checker",
    readability: "Readability Metrics",
    cliche: "Cliché Detector",
    emotion: "Emotion Tracker",
    motif: "Motif & Symbol Tracker",
    poetryMeter: "Poetry Meter Analyzer",
    nonfictionOutline: "Non-Fiction Outline Generator",
    citationManager: "Academic Citation Manager",
    nameGenerator: "Character Name Generator",
    worldBuilding: "World-Building Notebook",
    researchNotes: "Writer's Notes",
    moodBoard: "Image Mood Board",
    productivity: "Productivity Features",
    chapterLibrary: "Chapter Library",
    characters: "Character Management",
    export: "Export Options",
    tips: "Tips & Best Practices",
    shortcuts: "Keyboard Shortcuts",
    related: "📚 Related Resources",
  };

  // Search functionality - must be before early return to follow React hooks rules
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, string> = {};
    Object.entries(sections).forEach(([key, label]) => {
      if (label.toLowerCase().includes(query)) {
        filtered[key] = label;
      }
    });
    return filtered;
  }, [searchQuery]);

  // Early return must come AFTER all hooks
  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="writers-ref-content">
            <h2>Writer Mode Overview</h2>
            <p>
              Writer Mode is a distraction-free writing environment built
              directly into QuillPilot. It combines professional text editing
              with real-time manuscript analysis, giving you instant feedback as
              you write.
            </p>

            <div className="tip-box">
              <strong>💡 Access Writer Mode:</strong> Click the ✍️ Writer tab
              after uploading a document. Available to Professional tier users.
            </div>

            <h3>Core Features</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  background: "#fef5e7",
                  borderRadius: "8px",
                  border: "1px solid #e0c392",
                }}
              >
                <strong style={{ color: "#ef8432", fontSize: "1.1rem" }}>
                  ✍️ Rich Text Editing
                </strong>
                <ul
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                  }}
                >
                  <li>Bold, italic, underline formatting</li>
                  <li>Headers, lists, and blockquotes</li>
                  <li>Alignment and indentation controls</li>
                  <li>Find & replace functionality</li>
                </ul>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "#fef5e7",
                  borderRadius: "8px",
                  border: "1px solid #e0c392",
                }}
              >
                <strong style={{ color: "#ef8432", fontSize: "1.1rem" }}>
                  📊 Real-Time Analysis
                </strong>
                <ul
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                  }}
                >
                  <li>Inline pacing indicators (🐌 slow, ⚡ fast)</li>
                  <li>Sensory detail callouts (👁️ 👂 👃)</li>
                  <li>Live word count & reading time</li>
                  <li>Reading level (Flesch-Kincaid)</li>
                </ul>
              </div>
            </div>

            <h3>Understanding Visual Indicators</h3>
            <p style={{ marginBottom: "1rem" }}>
              When Style Labels are enabled, QuillPilot displays an{" "}
              <strong>Analysis Legend</strong> above the ruler showing what each
              color indicator means. Hover over any legend item for detailed,
              actionable advice.
            </p>

            <div
              style={{
                background: "#fef5e7",
                padding: "1.25rem",
                borderRadius: "8px",
                border: "1px solid #e0c392",
                marginBottom: "1.5rem",
              }}
            >
              <h4 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>
                Legend Indicators
              </h4>

              {/* Long Paragraphs */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #e0c392",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#f97316",
                    borderRadius: "2px",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <strong style={{ color: "#f97316" }}>Long ¶</strong>
                  <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                    — Long Paragraphs
                  </span>
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.875rem",
                      lineHeight: "1.6",
                    }}
                  >
                    Dense text blocks that may tire readers. Break up for better
                    readability—aim for 3-5 sentences per paragraph.
                  </p>
                </div>
              </div>

              {/* Passive Voice */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #e0c392",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#8b5cf6",
                    borderRadius: "2px",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <strong style={{ color: "#8b5cf6" }}>Passive?</strong>
                  <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                    — Passive Voice
                  </span>
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.875rem",
                      lineHeight: "1.6",
                    }}
                  >
                    Sentences using passive construction. Convert to active
                    voice for urgency and clarity. Example: "The door was opened
                    by Sarah" → "Sarah opened the door."
                  </p>
                </div>
              </div>

              {/* Sensory Details */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#eab308",
                    borderRadius: "2px",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <strong style={{ color: "#eab308" }}>Senses?</strong>
                  <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                    — Missing Sensory Details
                  </span>
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.875rem",
                      lineHeight: "1.6",
                    }}
                  >
                    Passages lacking sensory information. Add what characters
                    see, hear, smell, taste, or feel. Example: "She was upset" →
                    "Her hands trembled as tears blurred the page."
                  </p>
                </div>
              </div>
            </div>

            <div className="tip-box">
              <strong>💡 Pro Tip:</strong> These indicators appear in your
              document as you type. Use them during revision to quickly spot
              areas that need attention. The legend provides quick reminders
              without interrupting your flow.
            </div>

            <h3>17 Advanced Writing Tools</h3>
            <p style={{ marginBottom: "1rem" }}>
              Access powerful analysis and productivity tools from the Advanced
              Tools Rail on the right:
            </p>

            <div
              style={{
                background: "#fef5e7",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #e0c392",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#000",
                }}
              >
                <div>
                  <strong>Analysis Tools:</strong>
                </div>
                <div>
                  <strong>Genre Tools:</strong>
                </div>
                <div>
                  <strong>Content Tools:</strong>
                </div>

                <div style={{ lineHeight: "1.8" }}>
                  • AI Writing Assistant
                  <br />
                  • Dialogue Enhancer
                  <br />
                  • Readability Metrics
                  <br />
                  • Cliché Detector
                  <br />
                  • Beat Sheet
                  <br />
                  • POV Checker
                  <br />
                  • Emotion Tracker
                  <br />• Motif Tracker
                </div>

                <div style={{ lineHeight: "1.8" }}>
                  • Poetry Meter
                  <br />
                  • Nonfiction Outline
                  <br />• Citation Manager
                </div>

                <div style={{ lineHeight: "1.8" }}>
                  • Name Generator
                  <br />
                  • World-Building
                  <br />
                  • Research Notes
                  <br />
                  • Mood Board
                  <br />
                  • Version History
                  <br />• Comments
                </div>
              </div>
            </div>

            <h3>Productivity Features</h3>
            <ul style={{ marginBottom: "1.5rem" }}>
              <li>
                <strong>Focus Mode</strong> - Hide page thumbnails and analysis
                panels for distraction-free writing
              </li>
              <li>
                <strong>Typewriter Mode</strong> - Keep cursor centered on
                screen while you write
              </li>
              <li>
                <strong>Auto-Save</strong> - Your work is automatically saved as
                you type
              </li>
              <li>
                <strong>Version History</strong> - Save snapshots and compare
                drafts
              </li>
              <li>
                <strong>Comments & Annotations</strong> - Leave notes for
                yourself or collaborators
              </li>
            </ul>

            <div className="tip-box">
              <strong>🚀 Pro Tip:</strong> Use Cmd/Ctrl+K to open the command
              palette and quickly access any tool without clicking. Press
              Cmd/Ctrl+/ to see all keyboard shortcuts.
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "#fef5e7",
                borderRadius: "8px",
                border: "1px solid #e0c392",
              }}
            >
              <strong style={{ color: "#2c3e50" }}>📖 Learn More:</strong>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setActiveSection("toolbar")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Editor Toolbar →
                </button>
                <button
                  onClick={() => setActiveSection("advancedTools")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Advanced Tools →
                </button>
                <button
                  onClick={() => setActiveSection("productivity")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Productivity →
                </button>
                <button
                  onClick={() => setActiveSection("shortcuts")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Shortcuts →
                </button>
              </div>
            </div>
          </div>
        );

      case "toolbar":
        return (
          <div className="writers-ref-content">
            <h2>The Editor Toolbar</h2>

            <h3>Text Formatting</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Button</th>
                  <th>Shortcut</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>B</strong>
                  </td>
                  <td>Cmd/Ctrl+B</td>
                  <td>Bold text</td>
                </tr>
                <tr>
                  <td>
                    <strong>I</strong>
                  </td>
                  <td>Cmd/Ctrl+I</td>
                  <td>Italic text</td>
                </tr>
                <tr>
                  <td>
                    <strong>U</strong>
                  </td>
                  <td>Cmd/Ctrl+U</td>
                  <td>Underline text</td>
                </tr>
                <tr>
                  <td>
                    <strong>S̶</strong>
                  </td>
                  <td>—</td>
                  <td>Strikethrough</td>
                </tr>
              </tbody>
            </table>

            <h3>Block Formatting</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paragraph</td>
                  <td>Normal body text</td>
                </tr>
                <tr>
                  <td>Heading 1-6</td>
                  <td>Chapter titles and section headers</td>
                </tr>
                <tr>
                  <td>Quote</td>
                  <td>Block quotations</td>
                </tr>
                <tr>
                  <td>Pull Quote</td>
                  <td>Emphasized quotations</td>
                </tr>
                <tr>
                  <td>Code Block</td>
                  <td>Monospace text</td>
                </tr>
                <tr>
                  <td>Footnote</td>
                  <td>Reference notes</td>
                </tr>
              </tbody>
            </table>

            <h3>View Options</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Button</th>
                  <th>Function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎯</td>
                  <td>
                    Focus Mode (hide distractions){" "}
                    <button
                      onClick={() => setActiveSection("productivity")}
                      style={{
                        background: "#ef8432",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        marginLeft: "0.5rem",
                      }}
                    >
                      Learn More →
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>⌨️</td>
                  <td>
                    Typewriter Mode (center current line){" "}
                    <button
                      onClick={() => setActiveSection("productivity")}
                      style={{
                        background: "#ef8432",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        marginLeft: "0.5rem",
                      }}
                    >
                      Learn More →
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>⏱️</td>
                  <td>
                    Word Sprint Timer{" "}
                    <button
                      onClick={() => setActiveSection("productivity")}
                      style={{
                        background: "#ef8432",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        marginLeft: "0.5rem",
                      }}
                    >
                      Learn More →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="tip-box">
              <strong>💡 Tip:</strong> QuillPilot maintains a 50-state undo
              history, so don't worry about experimenting!
            </div>
          </div>
        );

      case "advancedTools":
        return (
          <div className="writers-ref-content">
            <h2>Advanced Tools Panel</h2>
            <p>
              Access by clicking the <strong>🛠️ Advanced Tools</strong> button.
              These professional-grade tools help you analyze and improve your
              manuscript.
            </p>

            <h3>Content Generation & Enhancement</h3>
            <ul>
              <li>
                <strong>✨ AI Writing Assistant</strong> — Rephrase, word
                choice, completion, enhancement
              </li>
              <li>
                <strong>💬 Dialogue Enhancer</strong> — Analyze dialogue for
                authenticity
              </li>
              <li>
                <strong>📜 Version History</strong>{" "}
                <span className="new-badge">NEW</span> — Save and compare drafts
              </li>
              <li>
                <strong>💬 Comments & Annotations</strong>{" "}
                <span className="new-badge">NEW</span> — Leave notes for
                yourself or beta readers
              </li>
            </ul>

            <h3>Structural Analysis</h3>
            <ul>
              <li>
                <strong>📖 Beat Sheet Generator</strong> — Detect story
                structure and plot points
              </li>
              <li>
                <strong>👁️ POV Checker</strong> — Find perspective
                inconsistencies
              </li>
            </ul>

            <h3>Analysis Tools</h3>
            <ul>
              <li>
                <strong>📊 Readability Metrics</strong> — Grade level and
                complexity analysis
              </li>
              <li>
                <strong>🚫 Cliché Detector</strong> — Find overused phrases
              </li>
              <li>
                <strong>💖 Emotion Tracker</strong> — Map emotional arcs
              </li>
              <li>
                <strong>🔮 Motif & Symbol Tracker</strong> — Identify recurring
                elements
              </li>
            </ul>

            <h3>Specialized Tools</h3>
            <ul>
              <li>
                <strong>🎭 Poetry Meter Analyzer</strong> — Analyze rhythm and
                meter
              </li>
              <li>
                <strong>📋 Non-Fiction Outline Generator</strong> — Create
                structured outlines
              </li>
              <li>
                <strong>📚 Academic Citation Manager</strong> — Format citations
              </li>
              <li>
                <strong>🎲 Character Name Generator</strong> — Generate
                culturally appropriate names
              </li>
              <li>
                <strong>🌍 World-Building Notebook</strong> — Organize your
                world's details
              </li>
              <li>
                <strong>📝 Writer's Notes</strong> — Keep research organized
              </li>
              <li>
                <strong>🖼️ Image Mood Board</strong> — Visual inspiration
                collection
              </li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Use Advanced Tools during revision, not
              first drafts. Write first, analyze later!
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "#fef5e7",
                borderRadius: "8px",
                border: "1px solid #ef8432",
              }}
            >
              <strong style={{ color: "#2c3e50" }}>
                📖 Jump to Tool Details:
              </strong>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setActiveSection("aiAssistant")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveSection("dialogue")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Dialogue Enhancer
                </button>
                <button
                  onClick={() => setActiveSection("beatSheet")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Beat Sheet
                </button>
                <button
                  onClick={() => setActiveSection("povChecker")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  POV Checker
                </button>
                <button
                  onClick={() => setActiveSection("emotion")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Emotion Tracker
                </button>
                <button
                  onClick={() => setActiveSection("motif")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Motif Tracker
                </button>
                <button
                  onClick={() => setActiveSection("poetryMeter")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Poetry Meter
                </button>
                <button
                  onClick={() => setActiveSection("nonfictionOutline")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Outline Generator
                </button>
                <button
                  onClick={() => setActiveSection("citationManager")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Citations
                </button>
                <button
                  onClick={() => setActiveSection("nameGenerator")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Name Generator
                </button>
                <button
                  onClick={() => setActiveSection("worldBuilding")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  World-Building
                </button>
                <button
                  onClick={() => setActiveSection("researchNotes")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Writer's Notes
                </button>
                <button
                  onClick={() => setActiveSection("moodBoard")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Mood Board
                </button>
              </div>
            </div>
          </div>
        );

      case "aiAssistant":
        return (
          <div className="writers-ref-content">
            <h2>✨ AI Writing Assistant</h2>
            <p>Get intelligent suggestions for improving your prose.</p>

            <h3>Modes</h3>
            <ul>
              <li>
                <strong>Rephrase:</strong> Generate alternative ways to express
                your ideas
              </li>
              <li>
                <strong>Word Choice:</strong> Find better synonyms and word
                alternatives
              </li>
              <li>
                <strong>Complete:</strong> Get sentence completion suggestions
              </li>
              <li>
                <strong>Enhance:</strong> Add sensory details and emotional
                depth
              </li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Select text in your editor</li>
              <li>Open Advanced Tools → AI Writing Assistant</li>
              <li>Choose a mode</li>
              <li>Click any suggestion to replace your text</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Use Rephrase when a sentence feels clunky but you can't
                  pinpoint why
                </li>
                <li>Word Choice is great for reducing repetition</li>
                <li>
                  Enhance works best on action scenes lacking sensory detail
                </li>
              </ul>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "#fef5e7",
                borderRadius: "8px",
                border: "1px solid #ef8432",
              }}
            >
              <strong style={{ color: "#2c3e50" }}>📖 See Also:</strong>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setActiveSection("dialogue")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Dialogue Enhancer
                </button>
                <button
                  onClick={() => setActiveSection("cliche")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Cliché Detector
                </button>
                <button
                  onClick={() => setActiveSection("advancedTools")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Advanced Tools
                </button>
              </div>
            </div>
          </div>
        );

      case "dialogue":
        return (
          <div className="writers-ref-content">
            <h2>💬 Dialogue Enhancer</h2>
            <p>Analyze dialogue for authenticity and character voice.</p>

            <h3>What It Analyzes</h3>
            <ul>
              <li>
                <strong>Natural Flow:</strong> Detects stiff or unnatural
                dialogue
              </li>
              <li>
                <strong>Subtext Detection:</strong> Finds moments where
                characters say less than they mean
              </li>
              <li>
                <strong>Voice Consistency:</strong> Ensures each character
                sounds unique
              </li>
              <li>
                <strong>Dialogue Tags:</strong> Flags overused tags and suggests
                alternatives
              </li>
            </ul>

            <h3>Metrics</h3>
            <ul>
              <li>Flow Score (0-100%)</li>
              <li>Voice Consistency Score (0-100%)</li>
              <li>Subtext presence indicators</li>
              <li>Tag variety analysis</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Run this after writing dialogue-heavy scenes</li>
                <li>
                  Pay attention to Voice Consistency if characters blur together
                </li>
                <li>
                  Subtext is key for tension—aim for characters who don't say
                  exactly what they mean
                </li>
              </ul>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "#fef5e7",
                borderRadius: "8px",
                border: "1px solid #ef8432",
              }}
            >
              <strong style={{ color: "#2c3e50" }}>📖 See Also:</strong>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setActiveSection("aiAssistant")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  AI Writing Assistant
                </button>
                <button
                  onClick={() => setActiveSection("characters")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Character Management
                </button>
                <button
                  onClick={() => setActiveSection("povChecker")}
                  style={{
                    background: "#ef8432",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  POV Checker
                </button>
              </div>
            </div>
          </div>
        );

      case "versionHistory":
        return (
          <div className="writers-ref-content">
            <h2>
              📜 Version History <span className="new-badge">NEW</span>
            </h2>
            <p>
              Save snapshots of your document and compare changes over time.
            </p>

            <h3>Features</h3>
            <ul>
              <li>
                <strong>Save Snapshots:</strong> Create named versions at any
                point
              </li>
              <li>
                <strong>Compare Drafts:</strong> See additions (green) and
                deletions (red) side-by-side
              </li>
              <li>
                <strong>Restore Versions:</strong> Roll back to any previous
                snapshot
              </li>
              <li>
                <strong>Auto-timestamps:</strong> Know exactly when each version
                was saved
              </li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Open Advanced Tools → Version History</li>
              <li>Click "Save Snapshot" to capture current state</li>
              <li>Add a descriptive name (e.g., "Before killing darlings")</li>
              <li>Click any version to compare or restore</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Save a version before major cuts or rewrites</li>
                <li>
                  Name versions descriptively: "Chapter 5 - added flashback"
                </li>
                <li>Use compare mode to review what changed between drafts</li>
              </ul>
            </div>
          </div>
        );

      case "comments":
        return (
          <div className="writers-ref-content">
            <h2>
              💬 Comments & Annotations <span className="new-badge">NEW</span>
            </h2>
            <p>
              Leave notes for yourself or beta readers throughout your
              manuscript.
            </p>

            <h3>Categories</h3>
            <ul>
              <li>
                <strong>📝 General:</strong> General notes and reminders
              </li>
              <li>
                <strong>💡 Suggestion:</strong> Ideas for improvement
              </li>
              <li>
                <strong>❓ Question:</strong> Things to research or verify
              </li>
              <li>
                <strong>✏️ Correction:</strong> Errors to fix
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>
                <strong>Beta Reader Mode:</strong> Toggle to show only comments
                meant for others
              </li>
              <li>
                <strong>Filter by Category:</strong> Focus on one type of
                comment
              </li>
              <li>
                <strong>Resolve Comments:</strong> Mark items as addressed
              </li>
              <li>
                <strong>Filter Resolved:</strong> Hide completed items
              </li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Select text you want to annotate</li>
              <li>Open Advanced Tools → Comments</li>
              <li>Choose a category and write your note</li>
              <li>Toggle Beta Reader Mode when sharing with others</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Use Questions for facts you need to verify later</li>
                <li>Mark suggestions as resolved once you've addressed them</li>
                <li>Beta Reader Mode hides your personal notes when sharing</li>
              </ul>
            </div>
          </div>
        );

      case "beatSheet":
        return (
          <div className="writers-ref-content">
            <h2>📖 Beat Sheet Generator</h2>
            <p>Automatically detect story structure and major plot points.</p>

            <h3>Supported Structures</h3>

            <h4>Three-Act Structure</h4>
            <ul>
              <li>Opening</li>
              <li>Inciting Incident</li>
              <li>Lock In (Point of No Return)</li>
              <li>Midpoint</li>
              <li>All Is Lost</li>
              <li>Climax</li>
              <li>Resolution</li>
            </ul>

            <h4>Five-Act Structure</h4>
            <ul>
              <li>Exposition</li>
              <li>Rising Action</li>
              <li>Climax</li>
              <li>Falling Action</li>
              <li>Denouement</li>
            </ul>

            <h4>Hero's Journey (12 Stages)</h4>
            <p>
              Ordinary World → Call to Adventure → Refusal → Meeting the Mentor
              → Crossing the Threshold → Tests/Allies/Enemies → Approach →
              Ordeal → Reward → Road Back → Resurrection → Return with Elixir
            </p>

            <h3>What You'll See</h3>
            <ul>
              <li>Visual timeline showing beat positions</li>
              <li>Pacing breakdown (Act 1/2/3 percentages)</li>
              <li>Confidence scores for each detected beat</li>
              <li>Recommendations for structural improvements</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Click any beat to navigate to that location in your text
                </li>
                <li>
                  Missing beats aren't always bad—some stories subvert structure
                </li>
                <li>
                  Use this to identify if Act 2 is dragging (common issue)
                </li>
              </ul>
            </div>
          </div>
        );

      case "povChecker":
        return (
          <div className="writers-ref-content">
            <h2>👁️ POV Checker</h2>
            <p>Detect point-of-view inconsistencies and head-hopping.</p>

            <h3>Detects</h3>
            <ul>
              <li>POV shifts between first, second, and third person</li>
              <li>Head-hopping (switching perspective mid-scene)</li>
              <li>Mixing deep POV with distant narration</li>
              <li>Unclear perspective moments</li>
            </ul>

            <h3>Metrics</h3>
            <ul>
              <li>Dominant POV identification</li>
              <li>Consistency score (0-100%)</li>
              <li>Character perspective tracking</li>
              <li>Severity ratings for each issue</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>High consistency scores (90%+) indicate clean POV</li>
                <li>Intentional POV shifts should happen at scene breaks</li>
                <li>
                  Deep POV means readers only know what your POV character knows
                </li>
              </ul>
            </div>
          </div>
        );

      case "readability":
        return (
          <div className="writers-ref-content">
            <h2>📊 Readability Metrics</h2>
            <p>Understand your text's reading level and complexity.</p>

            <h3>Metrics Explained</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Range</th>
                  <th>What It Measures</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Flesch Reading Ease</td>
                  <td>0-100</td>
                  <td>Higher = easier to read</td>
                </tr>
                <tr>
                  <td>Flesch-Kincaid Grade</td>
                  <td>1-18+</td>
                  <td>U.S. grade level needed</td>
                </tr>
                <tr>
                  <td>Gunning Fog Index</td>
                  <td>1-20+</td>
                  <td>Years of education needed</td>
                </tr>
                <tr>
                  <td>SMOG Index</td>
                  <td>1-18+</td>
                  <td>Grade for 100% comprehension</td>
                </tr>
              </tbody>
            </table>

            <h3>Target Reading Levels by Genre</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Genre</th>
                  <th>Target Grade</th>
                  <th>Flesch Ease</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>YA Fiction</td>
                  <td>6-8</td>
                  <td>70-80</td>
                </tr>
                <tr>
                  <td>Commercial Fiction</td>
                  <td>7-9</td>
                  <td>60-70</td>
                </tr>
                <tr>
                  <td>Literary Fiction</td>
                  <td>9-12</td>
                  <td>50-65</td>
                </tr>
                <tr>
                  <td>Children's (MG)</td>
                  <td>4-6</td>
                  <td>80-90</td>
                </tr>
              </tbody>
            </table>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Most bestsellers score 7th-9th grade level</li>
                <li>High grade levels often mean sentences are too long</li>
                <li>
                  Vary sentence length for better flow, even if it raises the
                  score slightly
                </li>
              </ul>
            </div>
          </div>
        );

      case "cliche":
        return (
          <div className="writers-ref-content">
            <h2>🚫 Cliché Detector</h2>
            <p>Find overused phrases and get fresh alternatives.</p>

            <h3>Categories</h3>
            <ul>
              <li>Filler phrases ("at the end of the day")</li>
              <li>Emotional clichés ("heart skipped a beat")</li>
              <li>Descriptive clichés ("eyes like pools")</li>
              <li>Comparisons ("quiet as a mouse")</li>
              <li>Time expressions ("in the nick of time")</li>
            </ul>

            <h3>For Each Cliché Found</h3>
            <ul>
              <li>Original phrase highlighted</li>
              <li>3-5 alternative suggestions</li>
              <li>Click to replace instantly</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Not every cliché needs replacing—dialogue can use them
                  naturally
                </li>
                <li>Focus on narrative clichés first</li>
                <li>
                  Sometimes the "cliché" is intentional voice—trust your
                  instincts
                </li>
              </ul>
            </div>
          </div>
        );

      case "emotion":
        return (
          <div className="writers-ref-content">
            <h2>💖 Emotion Tracker</h2>
            <p>Map emotional arcs across your story.</p>

            <h3>Tracked Emotions</h3>
            <p>
              Joy, Anger, Fear, Sadness, Love, Tension, Surprise, Disgust, Hope,
              Despair
            </p>

            <h3>What You'll See</h3>
            <ul>
              <li>Emotional arc visualization by chapter/section</li>
              <li>Dominant emotions identified</li>
              <li>Intensity scoring (0-100%)</li>
              <li>High tension point markers</li>
              <li>Emotional variety analysis</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Stories need emotional variety—all tension is exhausting
                </li>
                <li>
                  Romance should show love building; thrillers should show fear
                  escalating
                </li>
                <li>Flat emotional arcs often indicate passive characters</li>
              </ul>
            </div>
          </div>
        );

      case "motif":
        return (
          <div className="writers-ref-content">
            <h2>🔮 Motif & Symbol Tracker</h2>
            <p>Identify recurring symbols and thematic elements.</p>

            <h3>Tracks</h3>
            <ul>
              <li>
                <strong>Symbols:</strong> Light/darkness, water/fire, birds,
                mirrors, etc.
              </li>
              <li>
                <strong>Themes:</strong> Identity, betrayal, redemption,
                sacrifice, etc.
              </li>
              <li>
                <strong>Recurring Phrases:</strong> 3-5 word phrases that repeat
              </li>
              <li>
                <strong>Images:</strong> Visual motifs throughout the text
              </li>
            </ul>

            <h3>For Each Motif</h3>
            <ul>
              <li>Occurrence count</li>
              <li>Locations in text (click to navigate)</li>
              <li>Significance explanation</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Unconscious repetition often reveals your story's true theme
                </li>
                <li>
                  Symbols should appear at least 3 times to register with
                  readers
                </li>
                <li>
                  Track your phrases—repetition can be powerful or annoying
                </li>
              </ul>
            </div>
          </div>
        );

      case "poetryMeter":
        return (
          <div className="writers-ref-content">
            <h2>🎭 Poetry Meter Analyzer</h2>
            <p>
              Analyze the rhythmic patterns and meter of your poetry or prose.
            </p>

            <h3>Features</h3>
            <ul>
              <li>
                <strong>Syllable Counting:</strong> Automatic syllable detection
                for each line
              </li>
              <li>
                <strong>Stress Patterns:</strong> Identifies stressed and
                unstressed syllables
              </li>
              <li>
                <strong>Meter Detection:</strong> Recognizes iambic, trochaic,
                anapestic, dactylic patterns
              </li>
              <li>
                <strong>Rhyme Scheme:</strong> Maps end rhymes (ABAB, AABB,
                etc.)
              </li>
            </ul>

            <h3>Common Meters</h3>
            <ul>
              <li>
                <strong>Iambic Pentameter:</strong> da-DUM × 5 (Shakespeare's
                sonnets)
              </li>
              <li>
                <strong>Trochaic:</strong> DUM-da pattern (Poe's "The Raven")
              </li>
              <li>
                <strong>Anapestic:</strong> da-da-DUM (Dr. Seuss)
              </li>
              <li>
                <strong>Free Verse:</strong> No consistent meter
              </li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Even prose benefits from rhythm
              awareness. Varied sentence lengths create natural cadence.
            </div>
          </div>
        );

      case "nonfictionOutline":
        return (
          <div className="writers-ref-content">
            <h2>📋 Non-Fiction Outline Generator</h2>
            <p>
              Create structured outlines for articles, essays, and non-fiction
              books.
            </p>

            <h3>Outline Types</h3>
            <ul>
              <li>
                <strong>Article:</strong> Hook → Problem → Solution → Call to
                Action
              </li>
              <li>
                <strong>Essay:</strong> Thesis → Supporting Arguments →
                Counterarguments → Conclusion
              </li>
              <li>
                <strong>Book Chapter:</strong> Introduction → Key Points →
                Examples → Summary
              </li>
              <li>
                <strong>How-To Guide:</strong> Overview → Steps → Tips →
                Troubleshooting
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>AI-suggested section headers</li>
              <li>Drag-and-drop reordering</li>
              <li>Nested sub-sections</li>
              <li>Word count targets per section</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Start with a rough outline, then refine.
              Your structure can evolve as you write.
            </div>
          </div>
        );

      case "citationManager":
        return (
          <div className="writers-ref-content">
            <h2>📚 Academic Citation Manager</h2>
            <p>Manage references and format citations for academic writing.</p>

            <h3>Citation Styles</h3>
            <ul>
              <li>
                <strong>APA 7th:</strong> Psychology, Education, Social Sciences
              </li>
              <li>
                <strong>MLA 9th:</strong> Humanities, Literature, Arts
              </li>
              <li>
                <strong>Chicago:</strong> History, some Humanities
              </li>
              <li>
                <strong>Harvard:</strong> Business, Economics
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>Auto-format citations from URLs, DOIs, or ISBNs</li>
              <li>In-text citation insertion</li>
              <li>Bibliography generation</li>
              <li>Citation validation</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Add sources as you research, not after
              writing. It saves hours of backtracking.
            </div>
          </div>
        );

      case "nameGenerator":
        return (
          <div className="writers-ref-content">
            <h2>🎲 Character Name Generator</h2>
            <p>Generate culturally appropriate names for your characters.</p>

            <h3>Options</h3>
            <ul>
              <li>
                <strong>Culture/Region:</strong> English, Japanese, Arabic,
                African, etc.
              </li>
              <li>
                <strong>Time Period:</strong> Ancient, Medieval, Victorian,
                Modern, Futuristic
              </li>
              <li>
                <strong>Gender:</strong> Male, Female, Neutral
              </li>
              <li>
                <strong>Name Type:</strong> First name, Last name, Full name,
                Nickname
              </li>
            </ul>

            <h3>Advanced Features</h3>
            <ul>
              <li>Meaning lookup for names</li>
              <li>Phonetic filtering (soft/hard sounds)</li>
              <li>Alliteration matching</li>
              <li>Save favorites for your project</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Names carry cultural weight. Research
              before using names from cultures different from your own.
            </div>
          </div>
        );

      case "worldBuilding":
        return (
          <div className="writers-ref-content">
            <h2>🌍 World-Building Notebook</h2>
            <p>Organize and track your fictional world's details.</p>

            <h3>Categories</h3>
            <ul>
              <li>
                <strong>Geography:</strong> Maps, locations, climate, terrain
              </li>
              <li>
                <strong>Culture:</strong> Customs, beliefs, holidays, food
              </li>
              <li>
                <strong>Magic/Tech:</strong> Systems, rules, limitations
              </li>
              <li>
                <strong>History:</strong> Timeline, major events, legends
              </li>
              <li>
                <strong>Politics:</strong> Governments, factions, conflicts
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>Cross-referenced entries</li>
              <li>Consistency checker</li>
              <li>Quick-reference tooltips in editor</li>
              <li>Export as wiki or appendix</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Build your world iteratively. Add details
              as they become relevant to your story.
            </div>
          </div>
        );

      case "researchNotes":
        return (
          <div className="writers-ref-content">
            <h2>📝 Writer's Notes</h2>
            <p>
              Keep research, ideas, and reference material organized alongside
              your manuscript.
            </p>

            <h3>Note Types</h3>
            <ul>
              <li>
                <strong>Research:</strong> Facts, quotes, source links
              </li>
              <li>
                <strong>Ideas:</strong> Plot points, character ideas, "what ifs"
              </li>
              <li>
                <strong>To-Do:</strong> Scenes to write, edits to make
              </li>
              <li>
                <strong>Reference:</strong> Character sheets, timelines, maps
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>Tag and categorize notes</li>
              <li>Link notes to specific passages</li>
              <li>Search across all notes</li>
              <li>Import from web clipper</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Capture ideas immediately. A quick note
              now beats a forgotten brilliant idea later.
            </div>
          </div>
        );

      case "moodBoard":
        return (
          <div className="writers-ref-content">
            <h2>🖼️ Image Mood Board</h2>
            <p>Collect visual inspiration for your writing projects.</p>

            <h3>Uses</h3>
            <ul>
              <li>
                <strong>Setting:</strong> Landscapes, architecture, interiors
              </li>
              <li>
                <strong>Characters:</strong> Face claims, fashion, poses
              </li>
              <li>
                <strong>Mood:</strong> Color palettes, lighting, atmosphere
              </li>
              <li>
                <strong>Objects:</strong> Props, vehicles, weapons, artifacts
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>Drag-and-drop image upload</li>
              <li>Organize by project or category</li>
              <li>Add captions and tags</li>
              <li>Full-screen slideshow</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Visual references help maintain
              consistency. Describe what you see, not what you imagine.
            </div>
          </div>
        );

      case "productivity":
        return (
          <div className="writers-ref-content">
            <h2>Productivity Features</h2>

            <h3>🔥 Writing Streak Tracker</h3>
            <p>Build momentum with daily writing habits.</p>
            <ul>
              <li>Calendar showing writing days</li>
              <li>Current streak and longest streak record</li>
              <li>Total words tracked</li>
              <li>Motivational messages</li>
            </ul>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Even 100 words counts toward your streak.
              Show up every day!
            </div>

            <h3>🎯 Goal Setting & Progress</h3>
            <p>Set and track writing goals.</p>
            <ul>
              <li>
                <strong>Daily:</strong> Write X words today
              </li>
              <li>
                <strong>Weekly:</strong> Complete X words this week
              </li>
              <li>
                <strong>Project:</strong> Finish manuscript of X words
              </li>
            </ul>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Set achievable daily goals. 500 words/day
              = 180,000 words/year!
            </div>

            <h3>🎯 Focus Mode</h3>
            <p>Eliminate distractions for deep writing.</p>
            <p>
              <strong>Hides:</strong> Analysis indicators, spacing callouts,
              statistics bar
            </p>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Use Focus Mode for first drafts, disable
              it for revision.
              <button
                onClick={() => setActiveSection("toolbar")}
                style={{
                  background: "#ef8432",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  marginLeft: "0.5rem",
                }}
              >
                See Toolbar →
              </button>
            </div>

            <h3>⌨️ Typewriter Mode</h3>
            <p>
              Keep your current line centered on screen. Reduces neck strain
              from looking at bottom of screen.
            </p>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Combine with Focus Mode for ultimate
              immersion.
              <button
                onClick={() => setActiveSection("toolbar")}
                style={{
                  background: "#ef8432",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  marginLeft: "0.5rem",
                }}
              >
                See Toolbar →
              </button>
            </div>

            <h3>⏱️ Word Sprint Timer</h3>
            <p>Timed writing sessions for maximum productivity.</p>
            <ol>
              <li>Click the ⏱️ button</li>
              <li>Set duration (default: 15 minutes)</li>
              <li>Write without stopping until timer ends</li>
              <li>See your stats: words written, words per minute</li>
            </ol>
            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Don't edit during sprints—just write</li>
                <li>15-20 minute sprints work best for most writers</li>
                <li>Track your WPM to see improvement over time</li>
              </ul>
            </div>

            <h3>🎤 Voice-to-Text</h3>
            <p>Dictate your story hands-free.</p>
            <p>
              <strong>Supported Browsers:</strong> Chrome, Edge, Safari
            </p>
            <ul>
              <li>Say "period" or "comma" for punctuation</li>
              <li>Say "new paragraph" for line breaks</li>
              <li>Works best in quiet environments</li>
            </ul>
          </div>
        );

      case "chapterLibrary":
        return (
          <div className="writers-ref-content">
            <h2>📚 Chapter Library</h2>
            <p>
              Save and manage multiple chapters locally on your computer using
              the File System Access API.
            </p>

            <h3>Quick Overview</h3>
            <ul>
              <li>
                <strong>Save chapters</strong> as JSON files in a folder of your
                choice
              </li>
              <li>
                <strong>Load any saved chapter</strong> instantly into the
                editor
              </li>
              <li>
                <strong>No cloud storage</strong> required - all files stay on
                your machine
              </li>
              <li>
                <strong>Full control</strong> over your writing files
              </li>
            </ul>

            <h3>How to Access</h3>
            <ol>
              <li>Click the hamburger menu (☰) in the top-left</li>
              <li>Click "📚 Chapter Library"</li>
              <li>Select a folder on your computer (first time only)</li>
              <li>Save, load, or delete chapters</li>
            </ol>

            <h3>Features</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💾 Save/Save As</td>
                  <td>Quickly save current chapter or create variations</td>
                </tr>
                <tr>
                  <td>📂 Load chapters</td>
                  <td>Switch between chapters with one click</td>
                </tr>
                <tr>
                  <td>🗑️ Delete chapters</td>
                  <td>Remove unwanted chapters with confirmation</td>
                </tr>
                <tr>
                  <td>🔄 Auto-refresh</td>
                  <td>See new files added outside QuillPilot</td>
                </tr>
                <tr>
                  <td>📁 Folder persistence</td>
                  <td>QuillPilot remembers your chapter folder</td>
                </tr>
              </tbody>
            </table>

            <h3>Browser Support</h3>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}>
                <h4>✅ Supported</h4>
                <ul>
                  <li>Chrome 86+</li>
                  <li>Edge 86+</li>
                  <li>Opera 72+</li>
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                <h4>⚠️ Not Supported</h4>
                <ul>
                  <li>Firefox</li>
                  <li>Safari</li>
                  <li>Older browser versions</li>
                </ul>
              </div>
            </div>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              If your browser doesn't support this feature, QuillPilot will
              display a warning.
            </p>

            <h3>Workflow Tips</h3>
            <div className="tip-box">
              <strong>💡 Writing Multiple Chapters:</strong>
              <ol>
                <li>Select your project's chapter folder</li>
                <li>Write Chapter 1, click Save</li>
                <li>Create new chapter in editor</li>
                <li>Write Chapter 2, click Save</li>
                <li>Switch between chapters using Load</li>
              </ol>
            </div>

            <div className="tip-box">
              <strong>💡 Version Control:</strong>
              <ol>
                <li>Save "Chapter 3 - Draft 1"</li>
                <li>Make major edits</li>
                <li>Save As "Chapter 3 - Draft 2"</li>
                <li>Keep both versions to compare</li>
              </ol>
            </div>

            <h3>What Gets Saved</h3>
            <p>Each chapter file includes:</p>
            <ul>
              <li>Chapter content (text)</li>
              <li>Chapter name</li>
              <li>Analysis results (if any)</li>
              <li>Last modified timestamp</li>
              <li>Unique chapter ID</li>
            </ul>

            <div className="tip-box">
              <strong>📦 Portability:</strong>
              <p>
                Chapters are standard JSON files that can be opened in any text
                editor, shared, or backed up to cloud storage (Dropbox, Google
                Drive, etc.).
              </p>
            </div>

            <h3>Privacy & Security</h3>
            <ul>
              <li>🔒 All chapters saved directly to your computer</li>
              <li>🚫 No data sent to servers</li>
              <li>🛡️ Browser enforces strict security</li>
              <li>✅ You control file access</li>
            </ul>
          </div>
        );

      case "characters":
        return (
          <div className="writers-ref-content">
            <h2>Character Management</h2>

            <h3>Adding Characters</h3>
            <ol>
              <li>Click the 👥 Manage Characters button in Writer Mode</li>
              <li>Click "Add Character"</li>
              <li>
                Fill in details:
                <ul>
                  <li>
                    <strong>Name:</strong> Character's name
                  </li>
                  <li>
                    <strong>Role:</strong> Protagonist, Antagonist, Supporting,
                    etc.
                  </li>
                  <li>
                    <strong>Physical traits:</strong> Appearance details
                  </li>
                  <li>
                    <strong>Personality traits:</strong> Character qualities
                  </li>
                  <li>
                    <strong>Arc notes:</strong> How they change
                  </li>
                  <li>
                    <strong>Relationships:</strong> Connections to other
                    characters
                  </li>
                </ul>
              </li>
            </ol>

            <h3>Character Roles</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Protagonist</td>
                  <td>Main character driving the story</td>
                </tr>
                <tr>
                  <td>Antagonist</td>
                  <td>Opposition to protagonist's goals</td>
                </tr>
                <tr>
                  <td>Deuteragonist</td>
                  <td>Secondary main character</td>
                </tr>
                <tr>
                  <td>Love Interest</td>
                  <td>Romantic connection</td>
                </tr>
                <tr>
                  <td>Mentor</td>
                  <td>Guide figure</td>
                </tr>
                <tr>
                  <td>Sidekick</td>
                  <td>Loyal companion</td>
                </tr>
                <tr>
                  <td>Foil</td>
                  <td>Contrasts with protagonist</td>
                </tr>
                <tr>
                  <td>Supporting</td>
                  <td>Important but not central</td>
                </tr>
                <tr>
                  <td>Minor</td>
                  <td>Brief appearances</td>
                </tr>
              </tbody>
            </table>

            <h3>Linking Text to Characters</h3>
            <ol>
              <li>Select text that references a character</li>
              <li>Choose character from dropdown</li>
              <li>Click "🔗 Link"</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Link important character moments—first
              appearances, key decisions, transformation points.
            </div>
          </div>
        );

      case "export":
        return (
          <div className="writers-ref-content">
            <h2>Export Options</h2>

            <h3>📄 PDF Export</h3>
            <p>
              <strong>Manuscript Format</strong> (for submissions):
            </p>
            <ul>
              <li>Courier 12pt font</li>
              <li>Double-spaced</li>
              <li>1.25" left/right margins</li>
              <li>1" top/bottom margins</li>
              <li>Automatic page numbers</li>
              <li>Word count on first page</li>
            </ul>
            <p>
              <strong>Standard Format</strong> (for sharing):
            </p>
            <ul>
              <li>Clean readable format</li>
              <li>Your chosen fonts</li>
              <li>Single or 1.5 spacing</li>
            </ul>
            <p>
              <strong>Optional:</strong> Include analysis summary page with
              scores and top recommendations.
            </p>

            <h3>📥 DOCX Export</h3>
            <ul>
              <li>Microsoft Word compatible</li>
              <li>Preserves all formatting</li>
              <li>Includes embedded analysis markers (colored backgrounds)</li>
              <li>Ready for further editing</li>
            </ul>

            <h3>🌐 HTML Export</h3>
            <ul>
              <li>Self-contained file</li>
              <li>Opens in any browser</li>
              <li>Print-ready styling</li>
              <li>Includes analysis callouts</li>
            </ul>

            <h3>📊 JSON Export</h3>
            <ul>
              <li>Complete analysis data</li>
              <li>Machine-readable format</li>
              <li>For tracking progress or building custom reports</li>
            </ul>
          </div>
        );

      case "tips":
        return (
          <div className="writers-ref-content">
            <h2>Tips & Best Practices</h2>

            <h3>When to Use Each Tool</h3>

            <h4>During First Drafts</h4>
            <ul>
              <li>Focus Mode (hide distractions)</li>
              <li>Word Sprint Timer (build momentum)</li>
              <li>Version History (save before major scenes)</li>
            </ul>

            <h4>During Revision</h4>
            <ul>
              <li>POV Checker (fix perspective issues)</li>
              <li>Dialogue Enhancer (sharpen conversations)</li>
              <li>Cliché Detector (freshen language)</li>
              <li>AI Writing Assistant (rephrase weak passages)</li>
            </ul>

            <h4>During Final Polish</h4>
            <ul>
              <li>Readability Metrics (target your audience)</li>
              <li>Motif Tracker (ensure thematic consistency)</li>
              <li>Emotion Tracker (verify arc works)</li>
              <li>Beat Sheet (confirm structure)</li>
            </ul>

            <h3>Performance Tips</h3>
            <ul>
              <li>Save versions before major edits</li>
              <li>Export regularly as backup</li>
              <li>For very large documents (50k+ words), work in chapters</li>
              <li>Close unused Advanced Tool panels</li>
            </ul>

            <h3>Common Issues</h3>
            <p>
              <strong>Analysis not updating?</strong>
            </p>
            <ul>
              <li>Ensure you have 200+ words</li>
              <li>Check that auto-analysis is enabled</li>
              <li>Try clicking "Analyze" manually</li>
            </ul>

            <p>
              <strong>Formatting lost on paste?</strong>
            </p>
            <ul>
              <li>Use Cmd/Ctrl+Shift+V for plain text paste</li>
              <li>Or paste normally and use "Clear Formatting" button</li>
            </ul>
          </div>
        );

      case "shortcuts":
        return (
          <div className="writers-ref-content">
            <h2>Keyboard Shortcuts</h2>

            <h3>Text Formatting</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cmd/Ctrl+B</td>
                  <td>Bold</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+I</td>
                  <td>Italic</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+U</td>
                  <td>Underline</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+K</td>
                  <td>Insert link</td>
                </tr>
              </tbody>
            </table>

            <h3>Editing</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cmd/Ctrl+Z</td>
                  <td>Undo</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+Shift+Z</td>
                  <td>Redo</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+F</td>
                  <td>Find & Replace</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+A</td>
                  <td>Select All</td>
                </tr>
              </tbody>
            </table>

            <h3>Navigation</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cmd/Ctrl+Home</td>
                  <td>Go to beginning</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+End</td>
                  <td>Go to end</td>
                </tr>
                <tr>
                  <td>Option/Alt+↑↓</td>
                  <td>Move line up/down</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case "related":
        return (
          <div className="writers-ref-content">
            <h2>📚 Related Resources</h2>
            <p>
              Explore these additional guides to get the most out of QuillPilot.
            </p>

            <h3>Quick Start Guide</h3>
            <p>
              New to QuillPilot? The Quick Start Guide walks you through
              uploading your first document, running analysis, and understanding
              results. Access it from the ☰ menu → Quick Start.
            </p>

            <h3>Reference Library</h3>
            <p>
              Learn about every writing concept QuillPilot analyzes—from Show vs
              Tell to Pacing to Dialogue Tags. Each entry includes definitions,
              examples, and practical improvement tips. Access it from the ☰
              menu → Reference Library.
            </p>

            <h3>Advanced Tools Panel</h3>
            <p>
              Deep-dive into specialized analysis tools like the Dual Coding
              Analyzer, Beat Sheet Generator, and Character Manager. See the
              Advanced Tools section in this guide or access the panel directly
              in Writer Mode.
            </p>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Use the sidebar navigation to jump
              between any section of this Writer's Reference. Use the search box
              above to quickly find specific topics.
            </div>
          </div>
        );

      default:
        return (
          <div className="writers-ref-content">
            <h2>Welcome to Writer's Reference</h2>
            <p>Select a topic from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "95%",
          maxWidth: "1200px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "2px solid #ef8432",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f7e6d0 0%, #fef5e7 100%)",
            color: "#2c3e50",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AnimatedLogo size={64} animate={true} />
            <div>
              <span
                style={{
                  fontFamily: "'Georgia', 'Palatino', serif",
                  fontSize: "1.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                Writer's Reference
              </span>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                Complete guide to QuillPilot's writing tools
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar Navigation */}
          <div
            style={{
              width: "240px",
              borderRight: "1px solid #e0c392",
              display: "flex",
              flexDirection: "column",
              background: "#fef5e7",
              flexShrink: 0,
            }}
          >
            {/* Search Box */}
            <div style={{ padding: "1rem", borderBottom: "1px solid #e0c392" }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="modal-search-input"
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem 0.625rem 2.25rem",
                    border: "1px solid #e0c392",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    outline: "none",
                    background: "white",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ef8432";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(239, 132, 50, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0c392";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                  }}
                >
                  🔍
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0.75rem",
              }}
            >
              {Object.keys(filteredSections).length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  No topics found
                </div>
              ) : (
                Object.entries(filteredSections).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      marginBottom: "0.25rem",
                      background:
                        activeSection === key ? "#f7e6d0" : "transparent",
                      color: activeSection === key ? "#2c3e50" : "#4b5563",
                      border:
                        activeSection === key
                          ? "1px solid #ef8432"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      fontSize: "0.8125rem",
                      fontWeight: activeSection === key ? "600" : "500",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== key) {
                        e.currentTarget.style.background = "#f7e6d0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== key) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {label}
                    {(key === "versionHistory" || key === "comments") && (
                      <span
                        style={{
                          fontSize: "0.625rem",
                          background: "#10b981",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
              background: "linear-gradient(180deg, #fef5e7 0%, #fff7ed 100%)",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                borderRadius: "1rem",
                background: "#fef5e7",
                border: "1px solid rgba(217, 119, 6, 0.12)",
                boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .writers-ref-content h2 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1.75rem;
          font-weight: 700;
          border-bottom: 2px solid #ef8432;
          padding-bottom: 0.75rem;
        }

        .writers-ref-content h3 {
          margin: 1.5rem 0 0.75rem 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .writers-ref-content h4 {
          margin: 1.25rem 0 0.5rem 0;
          color: #4b5563;
          font-size: 1rem;
          font-weight: 600;
        }

        .writers-ref-content p {
          margin: 0 0 1rem 0;
          line-height: 1.7;
          color: #000000;
        }

        .writers-ref-content ul, .writers-ref-content ol {
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
          line-height: 1.8;
          color: #000000;
        }

        .writers-ref-content li {
          margin-bottom: 0.5rem;
          color: #000000;
        }

        .writers-ref-content strong {
          color: #1f2937;
        }

        .tip-box {
          background: linear-gradient(135deg, #fef5e7 0%, #fef9c3 100%);
          border-left: 4px solid #ef8432;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          margin: 1rem 0;
          color: #000000;
        }

        .tip-box strong {
          color: #000000;
        }

        .tip-box ul {
          margin: 0.5rem 0 0 0;
        }

        .new-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          font-size: 0.625rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          vertical-align: middle;
          margin-left: 6px;
        }

        .ref-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.875rem;
        }

        .ref-table th {
          background: #f7e6d0;
          color: #2c3e50;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border: 1px solid #e0c392;
        }

        .ref-table td {
          padding: 0.625rem 1rem;
          border: 1px solid #e5e7eb;
          color: #374151;
        }

        .ref-table tr:nth-child(even) {
          background: #fef5e7;
        }

        .code-block {
          background: #1f2937;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .code-block pre {
          margin: 0;
          color: #e5e7eb;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 0.8125rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
