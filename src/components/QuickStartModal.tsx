import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * QuickStartModal Component - Unified Quick Start Guide
 *
 * Combines developer quick start and writer quick start into one comprehensive guide
 * with tabbed sections and card-based layout.
 */
export function QuickStartModal({
  isOpen,
  onClose,
}: QuickStartModalProps): JSX.Element | null {
  const [activeSection, setActiveSection] = useState<string>("gettingStarted");

  if (!isOpen) return null;

  const sections = {
    gettingStarted: "Getting Started",
    interface: "Interface Tour",
    importing: "Importing Files",
    exporting: "Exporting Work",
    features: "Key Features",
    writerMode: "Writer Mode",
    darkMode: "Dark Mode",
    analysis: "Understanding Analysis",
    troubleshooting: "Troubleshooting",
    tips: "Pro Tips",
    related: "📚 Related Resources",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "gettingStarted":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>🚀 Getting Started in 3 Steps</h4>
                <p style={{ marginBottom: "1.5rem" }}>
                  Welcome to QuillPilot! Get started with AI-powered writing
                  analysis in just a few clicks.
                </p>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    Step 1: Upload Your Document
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click the <strong>"📁 Upload Document"</strong> button
                    </li>
                    <li>
                      Supported formats:
                      <ul style={{ marginTop: "0.5rem" }}>
                        <li>
                          <code>.docx</code> - Microsoft Word documents
                        </li>
                        <li>
                          <code>.txt</code> - Plain text files
                        </li>
                        <li>
                          <code>.md</code> / <code>.markdown</code> - Markdown
                          files
                        </li>
                      </ul>
                    </li>
                    <li>Your document loads quickly</li>
                  </ol>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    Step 2: Choose Your Mode
                  </h5>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      <strong>📊 Analysis Mode</strong> - Get AI feedback on
                      your writing
                    </li>
                    <li>
                      <strong>✍️ Writer Mode</strong> - Focus on writing with
                      live feedback (Premium/Professional tiers)
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    Step 3: Analyze & Export
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click <strong>"🔍 Analyze"</strong> to get AI-powered
                      feedback
                    </li>
                    <li>
                      Export your work:
                      <ul style={{ marginTop: "0.5rem" }}>
                        <li>
                          <strong>📥 DOCX</strong> - Microsoft Word format
                        </li>
                        <li>
                          <strong>📄 PDF</strong> - Professional manuscript
                          format
                        </li>
                        <li>
                          <strong>🌐 HTML</strong> - Web-ready format
                        </li>
                        <li>
                          <strong>📋 JSON</strong> - Data format for developers
                        </li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </section>

              <section className="quickstart-card">
                <h4>🎯 What You Get (Free Tier)</h4>
                <p>Start analyzing immediately with powerful features:</p>

                <h5 style={{ color: "#000000", marginTop: "1rem" }}>
                  ✅ Professional Document Editor
                </h5>
                <ul className="quickstart-list">
                  <li>Rich text formatting (headings, lists, links, tables)</li>
                  <li>Full image support (upload & paste)</li>
                  <li>Keyboard shortcuts (Cmd/Ctrl+B/I/U/K/F/Z)</li>
                  <li>Inline color-coded analysis indicators</li>
                  <li>Real-time pacing insights</li>
                  <li>Import DOCX files with formatting preserved</li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1rem" }}>
                  ✅ Core Analysis Features
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Pacing Analysis:</strong> Paragraph-by-paragraph
                    flow assessment
                  </li>
                  <li>
                    <strong>Sensory Detail Density:</strong> Tracks 540+ sensory
                    words across 5 senses
                  </li>
                  <li>Smart sidebar with detailed analysis cards</li>
                  <li>Up to 5,000 words per document (~20 pages)</li>
                  <li>Save up to 3 analyzed documents</li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1rem" }}>
                  ✅ Smart Content Understanding
                </h5>
                <ul className="quickstart-list">
                  <li>Auto-detects genre (Romance, Mystery, Fantasy, etc.)</li>
                  <li>Identifies compact, balanced, and extended paragraphs</li>
                  <li>Suggests visual elements (diagrams, flowcharts)</li>
                  <li>Character and relationship tracking</li>
                </ul>
              </section>

              <section className="quickstart-card">
                <h4>🚀 Unlock More with Premium</h4>
                <p>See what you're missing:</p>
                <ul className="quickstart-list">
                  <li>
                    🔒 <strong>Full 10-Principle Analysis</strong> - Complete
                    learning science evaluation
                  </li>
                  <li>
                    🔒 <strong>Export Features</strong> - Save as DOCX, PDF,
                    HTML, or JSON
                  </li>
                  <li>
                    🔒 <strong>Character Manager</strong> - Track unlimited
                    characters and relationships
                  </li>
                  <li>
                    🔒 <strong>Writer Mode</strong> - Focus on writing with live
                    feedback
                  </li>
                  <li>
                    🔒 <strong>Dark Mode</strong> - Eye-friendly theme for
                    late-night writing
                  </li>
                  <li>
                    🔒 <strong>Revision History</strong> - Cloud-based version
                    control
                  </li>
                  <li>
                    🔒 <strong>Custom Genres</strong> - Build your own concept
                    libraries
                  </li>
                  <li>
                    🔒 <strong>Unlimited Pages</strong> - Analyze entire novels
                    (1,000+ pages)
                  </li>
                </ul>

                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "#fef5e7",
                    borderRadius: "8px",
                    border: "1px solid #e0c392",
                  }}
                >
                  <strong style={{ color: "#2c3e50" }}>🚀 Explore More:</strong>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => setActiveSection("interface")}
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
                      Interface Tour
                    </button>
                    <button
                      onClick={() => setActiveSection("features")}
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
                      Key Features
                    </button>
                    <button
                      onClick={() => setActiveSection("writerMode")}
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
                      Writer Mode
                    </button>
                    <button
                      onClick={() => setActiveSection("tips")}
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
                      Pro Tips
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );

      case "interface":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>🎨 Interface Tour</h4>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  Top Navigation Bar
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Access Tier Selector</strong> - Choose your
                    subscription level (Free/Premium/Professional)
                  </li>
                  <li>
                    <strong>Dark Mode Toggle (🌙/☀️)</strong> - Switch between
                    light and dark themes
                  </li>
                  <li>
                    <strong>User Menu</strong> - Access account settings and
                    saved documents
                  </li>
                  <li>
                    <strong>Navigation Menu (☰)</strong> - Quick access to all
                    features
                  </li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  Main Toolbar (After Upload)
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>📁 Upload Document</strong> - Load DOCX, TXT, or
                    Markdown files
                  </li>
                  <li>
                    <strong>🗑️ Clear</strong> - Start with a new document
                  </li>
                  <li>
                    <strong>📥 Export DOCX</strong> - Save as Word document
                  </li>
                  <li>
                    <strong>📄 Export PDF</strong> - Export in manuscript format
                  </li>
                  <li>
                    <strong>🌐 Export HTML</strong> - Save as webpage
                  </li>
                  <li>
                    <strong>🖨️ Print</strong> - Print your document
                  </li>
                  <li>
                    <strong>🔍 Analyze</strong> - Run AI analysis on your
                    document
                  </li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  17 Advanced Writing Tools (Professional Tier)
                </h5>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#64748b",
                    marginBottom: "0.75rem",
                  }}
                >
                  Access powerful analysis tools via the floating button (bottom
                  right):
                </p>
                <ul className="quickstart-list">
                  <li>
                    <strong>✨ AI Writing Assistant</strong> - Get suggestions
                    and completions
                  </li>
                  <li>
                    <strong>💬 Dialogue Enhancer</strong> - Analyze dialogue
                    flow and character voice
                  </li>
                  <li>
                    <strong>📊 Readability Analyzer</strong> - Check reading
                    level and complexity
                  </li>
                  <li>
                    <strong>🎭 Cliché Detector</strong> - Find overused phrases
                  </li>
                  <li>
                    <strong>🎬 Beat Sheet Generator</strong> - Structure your
                    story arc
                  </li>
                  <li>
                    <strong>👁️ POV Checker</strong> - Ensure consistent point of
                    view
                  </li>
                  <li>
                    <strong>💖 Emotion Tracker</strong> - Track emotional beats
                  </li>
                  <li>
                    <strong>🔍 Motif Tracker</strong> - Identify recurring
                    themes
                  </li>
                  <li>
                    <strong>📝 Poetry Meter Analyzer</strong> - Analyze rhythm
                    and meter
                  </li>
                  <li>
                    <strong>📋 Nonfiction Outline Generator</strong> - Structure
                    arguments
                  </li>
                  <li>
                    <strong>📚 Academic Citation Manager</strong> - Format
                    citations
                  </li>
                  <li>
                    <strong>✍️ Character Name Generator</strong> - Generate
                    character names
                  </li>
                  <li>
                    <strong>🌍 World Building Notebook</strong> - Track world
                    details
                  </li>
                  <li>
                    <strong>📝 Research Notes Panel</strong> - Keep notes while
                    writing
                  </li>
                  <li>
                    <strong>🖼️ Image Mood Board</strong> - Upload reference
                    images
                  </li>
                  <li>
                    <strong>📜 Version History</strong> - Save and compare
                    drafts
                  </li>
                  <li>
                    <strong>💬 Comments & Annotations</strong> - Leave notes for
                    yourself
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "importing":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>📁 Importing Files</h4>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Import a Plain Text File
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click <strong>"📁 Upload Document"</strong>
                    </li>
                    <li>
                      Select your <code>.txt</code> file
                    </li>
                    <li>QuillPilot automatically detects paragraphs</li>
                    <li>Your text is ready to analyze or edit!</li>
                  </ol>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Import Markdown Files
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click <strong>"📁 Upload Document"</strong>
                    </li>
                    <li>
                      Select your <code>.md</code> or <code>.markdown</code>{" "}
                      file
                    </li>
                    <li>
                      Formatting is preserved:
                      <ul style={{ marginTop: "0.5rem" }}>
                        <li>
                          Headers (<code># ## ###</code>)
                        </li>
                        <li>
                          <strong>Bold</strong> and <em>italic</em> text
                        </li>
                        <li>
                          <code>Code blocks</code>
                        </li>
                      </ul>
                    </li>
                    <li>Ready to analyze!</li>
                  </ol>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Import Word Documents
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click <strong>"📁 Upload Document"</strong>
                    </li>
                    <li>
                      Select your <code>.docx</code> file
                    </li>
                    <li>
                      All formatting is preserved (bold, italic, headings,
                      tables)
                    </li>
                    <li>Images are supported</li>
                    <li>Your document loads with full formatting!</li>
                  </ol>
                </div>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  Document Size Limits
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Free Tier:</strong> Up to 200 pages per document, 3
                    uploads/month
                  </li>
                  <li>
                    <strong>Premium Tier:</strong> Up to 650 pages per document,
                    20 uploads/month
                  </li>
                  <li>
                    <strong>Professional Tier:</strong> Up to 1,000 pages,
                    unlimited uploads
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "exporting":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>💾 Exporting Your Work</h4>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Export as PDF (Manuscript Format)
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>Complete your writing/editing</li>
                    <li>
                      Click the <strong>"📄 PDF"</strong> button in the toolbar
                    </li>
                    <li>
                      Your manuscript exports with:
                      <ul style={{ marginTop: "0.5rem" }}>
                        <li>Courier font (12pt)</li>
                        <li>Double-spaced lines</li>
                        <li>1.25" left/right margins</li>
                        <li>Automatic page numbering</li>
                        <li>Optional analysis summary</li>
                      </ul>
                    </li>
                    <li>Perfect for agent/publisher submissions!</li>
                  </ol>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Export as DOCX
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click the <strong>"📥 DOCX"</strong> button
                    </li>
                    <li>All formatting is preserved</li>
                    <li>Analysis highlights can be included</li>
                    <li>
                      Compatible with Microsoft Word, Google Docs, and others
                    </li>
                  </ol>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Export as HTML
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click the <strong>"🌐 HTML"</strong> button
                    </li>
                    <li>Web-ready format with embedded styling</li>
                    <li>Great for posting to blogs or websites</li>
                    <li>Includes analysis annotations</li>
                  </ol>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Export as JSON
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Click the <strong>"📋 JSON"</strong> button
                    </li>
                    <li>Structured data format for developers</li>
                    <li>Includes all analysis results and metadata</li>
                    <li>Perfect for integrations or custom processing</li>
                  </ol>
                </div>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Export Tips
                </h5>
                <ul className="quickstart-list">
                  <li>
                    Use <strong>manuscript PDF</strong> for submissions to
                    publishers/agents
                  </li>
                  <li>
                    Use <strong>DOCX</strong> for sharing with editors or beta
                    readers
                  </li>
                  <li>
                    Use <strong>HTML</strong> for posting excerpts online
                  </li>
                  <li>Export regularly to keep backup copies</li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "features":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>⚡ Key Features</h4>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  📊 Analysis Dashboard
                </h5>
                <p>After clicking "Analyze," you'll see:</p>
                <ul className="quickstart-list">
                  <li>
                    <strong>Overall Score:</strong> Your writing effectiveness
                    (0-100)
                  </li>
                  <li>
                    <strong>Word Count:</strong> Total words and estimated
                    reading time
                  </li>
                  <li>
                    <strong>Show vs Tell:</strong> Balance of description and
                    action
                  </li>
                  <li>
                    <strong>Sensory Details:</strong> Visual, auditory, tactile
                    elements (540+ tracked words)
                  </li>
                  <li>
                    <strong>Character Tracking:</strong> Character mentions
                    throughout your document
                  </li>
                  <li>
                    <strong>Cognitive Load:</strong> Reader comprehension
                    difficulty
                  </li>
                  <li>
                    <strong>Genre Detection:</strong> Auto-identifies Romance,
                    Mystery, Fantasy, etc.
                  </li>
                </ul>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  💡 Smart Recommendations
                </h5>
                <p>Get actionable feedback:</p>
                <ul className="quickstart-list">
                  <li>
                    <strong>Prioritized suggestions</strong> (High/Medium/Low
                    impact)
                  </li>
                  <li>
                    <strong>Specific improvement areas</strong> with examples
                    from your text
                  </li>
                  <li>
                    <strong>Visual diagrams</strong> suggested where helpful
                    (flowcharts, timelines)
                  </li>
                  <li>
                    <strong>Genre-specific feedback</strong> tailored to your
                    story type
                  </li>
                </ul>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  🎨 Inline Analysis Indicators
                </h5>
                <p>See feedback directly in your text:</p>
                <ul className="quickstart-list">
                  <li>
                    <strong>Color-coded highlights:</strong> Sensory details,
                    dialogue tags, pacing
                  </li>
                  <li>
                    <strong>Paragraph markers:</strong> Compact, balanced, or
                    extended paragraphs
                  </li>
                  <li>
                    <strong>Character tracking:</strong> See all character
                    mentions highlighted
                  </li>
                  <li>
                    <strong>Interactive cards:</strong> Click highlights for
                    detailed explanations
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "writerMode":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>✍️ Writer Mode (Professional Tier)</h4>
                <p>
                  Focus on writing with live feedback and professional tools.
                </p>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  How to Use Writer Mode
                </h5>
                <ol className="quickstart-order">
                  <li>
                    Switch to <strong>Professional Tier</strong> (or upgrade)
                  </li>
                  <li>
                    Toggle to <strong>"Writer Mode"</strong> in the top
                    navigation
                  </li>
                  <li>Start writing in the clean, distraction-free editor</li>
                  <li>Get real-time feedback as you type</li>
                  <li>
                    Access 17 Advanced Writing Tools via the floating button
                    (bottom right)
                  </li>
                </ol>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Focus Mode
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Hide distractions:</strong> Removes page rail and
                    advanced tools panel
                  </li>
                  <li>
                    <strong>Full-screen writing:</strong> Clean, minimal
                    interface for deep work
                  </li>
                  <li>
                    <strong>Toggle anytime:</strong> Switch focus mode on/off as
                    needed
                  </li>
                  <li>
                    <strong>Word count visible:</strong> Track progress without
                    clutter
                  </li>
                </ul>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Rich Text Editor
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Full formatting:</strong> Headings, bold, italic,
                    underline, lists
                  </li>
                  <li>
                    <strong>Tables & images:</strong> Insert and edit tables,
                    upload images
                  </li>
                  <li>
                    <strong>Keyboard shortcuts:</strong> Cmd/Ctrl+B/I/U/K/F/Z
                    for fast editing
                  </li>
                  <li>
                    <strong>Auto-save:</strong> Your work is continuously saved
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "darkMode":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>🌙 Dark Mode</h4>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    How to Use Dark Mode
                  </h5>
                  <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      Look for the <strong>🌙/☀️</strong> button in the top
                      right
                    </li>
                    <li>Click to toggle between light and dark themes</li>
                    <li>Your preference is saved automatically</li>
                    <li>Works across all pages and modals</li>
                  </ol>
                </div>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Benefits of Dark Mode
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Reduces eye strain</strong> during long writing
                    sessions
                  </li>
                  <li>
                    <strong>Saves battery</strong> on OLED/AMOLED screens
                  </li>
                  <li>
                    <strong>Better for late-night writing</strong> - less blue
                    light
                  </li>
                  <li>
                    <strong>Professional appearance</strong> for focused work
                  </li>
                  <li>
                    <strong>Matches system preference</strong> automatically
                  </li>
                </ul>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Dark Mode Colors
                </h5>
                <p>
                  Our dark theme uses QuillPilot's signature cream/tan palette:
                </p>
                <ul className="quickstart-list">
                  <li>
                    <strong>Background:</strong> Dark brown (#1a1816)
                  </li>
                  <li>
                    <strong>Text:</strong> Cream (#e8d5b7)
                  </li>
                  <li>
                    <strong>Accent:</strong> Orange (#ef8432) - unchanged for
                    brand identity
                  </li>
                  <li>
                    <strong>Borders:</strong> Muted brown tones
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "analysis":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>📚 Understanding Analysis Results</h4>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  10 Learning Science Principles
                </h5>
                <p>QuillPilot analyzes your writing across:</p>
                <ol className="quickstart-order">
                  <li>
                    <strong>Deep Processing</strong> - Encouraging thoughtful
                    engagement
                  </li>
                  <li>
                    <strong>Spaced Repetition</strong> - Optimal concept
                    reinforcement
                  </li>
                  <li>
                    <strong>Retrieval Practice</strong> - Active recall
                    opportunities
                  </li>
                  <li>
                    <strong>Interleaving</strong> - Mixed concept presentation
                  </li>
                  <li>
                    <strong>Dual Coding</strong> - Visual + verbal information
                  </li>
                  <li>
                    <strong>Generative Learning</strong> - Reader prediction
                    prompts
                  </li>
                  <li>
                    <strong>Metacognition</strong> - Self-reflection cues
                  </li>
                  <li>
                    <strong>Schema Building</strong> - Knowledge structure
                    development
                  </li>
                  <li>
                    <strong>Cognitive Load</strong> - Mental effort management
                  </li>
                  <li>
                    <strong>Emotion & Relevance</strong> - Engagement and
                    connection
                  </li>
                </ol>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Genre-Specific Analysis
                </h5>
                <p>QuillPilot adapts analysis for your genre:</p>
                <ul className="quickstart-list">
                  <li>
                    <strong>Fiction:</strong> Character development, pacing,
                    show vs tell
                  </li>
                  <li>
                    <strong>Mystery/Thriller:</strong> Tension, clues, red
                    herrings
                  </li>
                  <li>
                    <strong>Romance:</strong> Relationship progression,
                    emotional beats
                  </li>
                  <li>
                    <strong>Fantasy/Sci-Fi:</strong> World-building, magic
                    systems, technology
                  </li>
                  <li>
                    <strong>Literary Fiction:</strong> Theme, symbolism, prose
                    quality
                  </li>
                  <li>
                    <strong>Non-Fiction:</strong> Clarity, structure, evidence
                    support
                  </li>
                </ul>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Score Interpretation
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>80-100:</strong> Excellent - Professional quality
                  </li>
                  <li>
                    <strong>60-79:</strong> Good - Minor improvements possible
                  </li>
                  <li>
                    <strong>40-59:</strong> Fair - Several areas need work
                  </li>
                  <li>
                    <strong>0-39:</strong> Needs improvement - Significant
                    revision required
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "troubleshooting":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>🔧 Troubleshooting</h4>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    "Upload Failed"
                  </h5>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      <strong>Check file format:</strong> Only .docx, .txt, .md
                      supported
                    </li>
                    <li>
                      <strong>Check file size:</strong> Free tier max 200 pages,
                      Premium 650, Professional 1000
                    </li>
                    <li>
                      <strong>Check file integrity:</strong> Ensure file isn't
                      corrupted
                    </li>
                    <li>
                      <strong>Try another format:</strong> Convert to .txt if
                      Word file fails
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    "Analysis Taking Too Long"
                  </h5>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      <strong>Document size:</strong> Large documents (50k+
                      words) take 30-60 seconds
                    </li>
                    <li>
                      <strong>Wait for completion:</strong> Don't refresh the
                      page during analysis
                    </li>
                    <li>
                      <strong>Check connection:</strong> Ensure stable internet
                      for cloud processing
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    "Export Not Working"
                  </h5>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      <strong>Document loaded:</strong> Make sure a document is
                      uploaded
                    </li>
                    <li>
                      <strong>Browser compatibility:</strong> Use modern
                      browsers (Chrome, Firefox, Safari, Edge)
                    </li>
                    <li>
                      <strong>Pop-up blockers:</strong> Disable for export
                      downloads
                    </li>
                    <li>
                      <strong>Try different format:</strong> If PDF fails, try
                      DOCX or HTML
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#ef8432" }}>
                    "Dark Mode Not Applying"
                  </h5>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      <strong>Hard refresh:</strong> Press Cmd+Shift+R (Mac) or
                      Ctrl+Shift+R (Windows)
                    </li>
                    <li>
                      <strong>Clear cache:</strong> Browser may be caching old
                      styles
                    </li>
                    <li>
                      <strong>Check toggle:</strong> Ensure toggle shows 🌙
                      (dark mode active)
                    </li>
                  </ul>
                </div>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  Still Having Issues?
                </h5>
                <p>Contact support:</p>
                <ul className="quickstart-list">
                  <li>
                    <strong>Email:</strong> support@quillpilot.com
                  </li>
                  <li>
                    <strong>Response Time:</strong>
                    <ul className="quickstart-sublist">
                      <li>Free tier: 72 hours</li>
                      <li>Premium: 48 hours</li>
                      <li>Professional: 24 hours</li>
                    </ul>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "tips":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>💡 Pro Tips</h4>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  For First-Time Users
                </h5>
                <ul className="quickstart-list">
                  <li>
                    Start with the <strong>Free tier</strong> to test features
                  </li>
                  <li>
                    Upload a <strong>sample chapter</strong> (200 pages max on
                    Free)
                  </li>
                  <li>
                    Try both <strong>Analysis and Writer modes</strong>
                  </li>
                  <li>
                    Export to see <strong>formatting options</strong>
                  </li>
                  <li>
                    Check the <strong>Reference Library</strong> for concept
                    definitions
                  </li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  For Premium Users
                </h5>
                <ul className="quickstart-list">
                  <li>
                    Use <strong>custom genre profiles</strong> for specialized
                    feedback
                  </li>
                  <li>
                    Export <strong>analysis reports</strong> for revision
                    planning
                  </li>
                  <li>
                    Create <strong>custom concept libraries</strong> for series
                    work
                  </li>
                  <li>
                    Track <strong>character arcs</strong> across multiple books
                  </li>
                  <li>
                    Enable <strong>dark mode</strong> for late-night writing
                    sessions
                  </li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  For Professional Users
                </h5>
                <ul className="quickstart-list">
                  <li>
                    Organize large projects with{" "}
                    <strong>unlimited uploads</strong>
                  </li>
                  <li>
                    Use <strong>revision history</strong> to track changes over
                    time
                  </li>
                  <li>
                    Set <strong>daily writing goals</strong> to build momentum
                  </li>
                  <li>
                    Export in <strong>manuscript format</strong> for submissions
                  </li>
                  <li>
                    Leverage <strong>Character Manager</strong> for complex
                    casts
                  </li>
                </ul>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  Writing Best Practices
                </h5>
                <ol className="quickstart-order">
                  <li>
                    <strong>Write First, Analyze Later</strong> - Don't let
                    analysis block creativity
                  </li>
                  <li>
                    <strong>Use Analysis for Revision</strong> - Focus on top
                    3-5 recommendations
                  </li>
                  <li>
                    <strong>Export Regularly</strong> - Keep backup copies in
                    multiple formats
                  </li>
                  <li>
                    <strong>Track Progress</strong> - Monitor word count and
                    completion milestones
                  </li>
                  <li>
                    <strong>Iterate</strong> - Re-analyze after major revisions
                    to see improvement
                  </li>
                </ol>

                <h5 style={{ color: "#000000", marginTop: "1.5rem" }}>
                  Keyboard Shortcuts
                </h5>
                <ul className="quickstart-list">
                  <li>
                    <strong>Cmd/Ctrl + B:</strong> Bold text
                  </li>
                  <li>
                    <strong>Cmd/Ctrl + I:</strong> Italic text
                  </li>
                  <li>
                    <strong>Cmd/Ctrl + U:</strong> Underline text
                  </li>
                  <li>
                    <strong>Cmd/Ctrl + K:</strong> Insert link
                  </li>
                  <li>
                    <strong>Cmd/Ctrl + F:</strong> Find in document
                  </li>
                  <li>
                    <strong>Cmd/Ctrl + Z:</strong> Undo
                  </li>
                  <li>
                    <strong>Cmd/Ctrl + Shift + Z:</strong> Redo
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );

      case "related":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section className="quickstart-card">
                <h4>📚 Related Resources</h4>
                <p style={{ marginBottom: "1.5rem", color: "#000000" }}>
                  Explore these additional guides to get the most out of
                  QuillPilot.
                </p>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Reference Library
                </h5>
                <p style={{ marginBottom: "1rem", color: "#000000" }}>
                  Deep-dive into every writing concept QuillPilot analyzes—from
                  Pacing and Flow to Sensory Detail Density to the 12 Fiction
                  Elements. Includes definitions, examples, and color coding
                  explanations. Access it from the ☰ menu → Reference Library.
                </p>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Writer's Reference
                </h5>
                <p style={{ marginBottom: "1rem", color: "#000000" }}>
                  Comprehensive documentation for Writer Mode, including the
                  editor toolbar, Advanced Tools Panel, AI Writing Assistant,
                  and all productivity features like Focus Mode and Word
                  Sprints. Access it from the ☰ menu → Writer's Reference.
                </p>

                <h5
                  style={{
                    color: "#000000",
                    marginTop: "1.5rem",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  Advanced Tools
                </h5>
                <p style={{ marginBottom: "1rem", color: "#000000" }}>
                  Professional-tier features like the Beat Sheet Generator,
                  Character Manager, Dialogue Enhancer, and POV Checker.
                  Available in Writer Mode via the Advanced Tools Panel.
                </p>

                <div
                  style={{
                    background: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem 1.5rem",
                    margin: "1rem 0",
                    borderRadius: "0 0.5rem 0.5rem 0",
                    color: "#000000",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#000000" }}>
                    💡 Tip:
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#000000" }}>
                    Start here with Quick Start, then explore the Reference
                    Library to understand what the analysis means, and finally
                    dive into Writer's Reference when you're ready to use Writer
                    Mode.
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
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
            padding: "1.5rem",
            borderBottom: "2px solid #ef8432",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f7e6d0",
            color: "#000000",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AnimatedLogo size={96} animate={true} />
            <div>
              <span
                style={{
                  fontFamily: "'Georgia', 'Palatino', serif",
                  fontSize: "2.2rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                Quill Pilot
              </span>
              <div
                style={{
                  fontSize: "1.1rem",
                  color: "#000000",
                  marginTop: "0.25rem",
                }}
              >
                Quick Start Guide
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "2rem",
              color: "#000000",
              cursor: "pointer",
              padding: "0.5rem",
              lineHeight: 1,
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar Navigation */}
          <div
            style={{
              width: "200px",
              borderRight: "1px solid #ef8432",
              padding: "1rem",
              overflowY: "auto",
              background: "#fef5e7",
            }}
          >
            {Object.entries(sections).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  background: activeSection === key ? "#f7e6d0" : "transparent",
                  color: activeSection === key ? "#2c3e50" : "#6b7280",
                  border: activeSection === key ? "1px solid #ef8432" : "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: activeSection === key ? "600" : "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== key) {
                    e.currentTarget.style.backgroundColor = "#f7e6d0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== key) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              padding: "2rem",
              overflowY: "auto",
              background: "white",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
