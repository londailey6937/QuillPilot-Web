import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface ReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ReferenceLibraryModal Component - Complete feature reference and technical documentation
 *
 * Displays comprehensive guide to all features, export formats, genres, and technical specs.
 */
export function ReferenceLibraryModal({
  isOpen,
  onClose,
}: ReferenceLibraryModalProps): JSX.Element | null {
  const [activeSection, setActiveSection] = useState<string>("spacing");

  if (!isOpen) return null;

  const sections = {
    spacing: "Pacing & Flow",
    dualCoding: "Sensory Detail Density",
    export: "Export Formats",
    domains: "Genre Libraries",
    tiers: "Access Tiers",
    writer: "Writer Mode",
    colors: "Color Coding",
    technical: "Technical Specs",
    matching: "Character & Element Tracking",
    fictionElements: "12 Fiction Elements",
    faq: "FAQ",
    related: "📚 Related Resources",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "matching":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Character & Element Tracking</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  How We Identify Characters & Story Elements
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Our analysis engine uses intelligent{" "}
                  <strong>pattern recognition</strong> to identify and track
                  characters, story elements, themes, and narrative devices
                  throughout your manuscript.
                </p>

                <div
                  style={{
                    backgroundColor: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#ef8432",
                      fontSize: "1rem",
                    }}
                  >
                    The Tracking Workflow
                  </h5>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: "1.5rem",
                      color: "#334155",
                    }}
                  >
                    <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                      <strong>Character Recognition:</strong> Identifies
                      character names (like "Sarah" or "Detective Morgan") and
                      tracks their appearances, development, and relationships
                      throughout your story.
                    </li>
                    <li>
                      <strong>Element Detection:</strong> Recognizes story
                      elements like plot devices, themes, symbols, and
                      genre-specific patterns (e.g., "the prophecy", "red
                      herring", "romantic tension").
                    </li>
                  </ol>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Improving Accuracy
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Fiction writing is nuanced, and sometimes the system might
                  flag common words as character names (e.g., "Will" as a name
                  vs. "will" as a helping verb).
                </p>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  You can <strong>Report False Positives</strong> directly from
                  the element list. Look for the flag icon{" "}
                  <span
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                  </span>{" "}
                  on any element pill to flag it for review. This helps us
                  refine our genre libraries and improve accuracy for everyone.
                </p>
              </section>
            </div>
          </div>
        );

      case "spacing":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Pacing & Flow Reference</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  What is Pacing & Flow Analysis?
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Pacing analysis evaluates how narrative elements are
                  distributed throughout your manuscript to maintain{" "}
                  <strong>reader engagement</strong> - balancing action with
                  reflection, dialogue with description, and tension with
                  release.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Paragraph Pacing Indicators
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Indicator Color
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Word Count Range
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🟢 <strong>Green</strong> (Good)
                      </td>
                      <td style={{ padding: "0.5rem" }}>60-160 words</td>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>"On target"</strong> - Optimal paragraph length
                        for readability, balanced pacing
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🔵 <strong>Blue</strong> (Compact)
                      </td>
                      <td style={{ padding: "0.5rem" }}>&lt;60 words</td>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>"Expand detail"</strong> - Fast-paced, may feel
                        rushed; consider adding examples or explanation
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🟠 <strong>Orange</strong> (Extended)
                      </td>
                      <td style={{ padding: "0.5rem" }}>&gt;160 words</td>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>"Consider splitting"</strong> - Too long, may
                        overwhelm readers; split or add subheading
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  How Pacing Scores Are Calculated
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Score Range: 0-100</strong>
                </p>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>80-100 (High):</strong> Strong narrative flow with
                    varied paragraph lengths and good rhythm
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>50-79 (Medium):</strong> Moderate pacing, some
                    variety but could use more balance
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>0-49 (Low):</strong> Monotonous pacing with little
                    paragraph variety
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
                      onClick={() => setActiveSection("dualCoding")}
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
                      Sensory Details
                    </button>
                    <button
                      onClick={() => setActiveSection("fictionElements")}
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
                      12 Fiction Elements
                    </button>
                    <button
                      onClick={() => setActiveSection("colors")}
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
                      Color Coding
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );

      case "dualCoding":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Sensory Detail Density Analysis Reference</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  What is Sensory Detail Density?
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Sensory Detail Density</strong> measures how much
                  immersive, sensory language appears in your writing. Effective
                  fiction engages readers through the five senses, making scenes
                  vivid and memorable rather than abstract and distant.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  The Five Senses in Writing
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Sensory Type
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        When to Use
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        👁️ <strong>Visual Details</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Character appearance, settings, body language
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        👂 <strong>Auditory Details</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Dialogue tone, environmental sounds, music
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        👃 <strong>Olfactory Details</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Scents that evoke emotion or memory
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        ✋ <strong>Tactile Details</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Physical sensations, texture, temperature
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        👅 <strong>Taste Details</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Food scenes, emotional associations
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Priority Levels
                </h3>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>High Priority</strong> 🔴 - &lt;5% sensory density:
                    Very low sensory detail, needs concrete descriptions
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Medium Priority</strong> 🟡 - 5-8% sensory density:
                    Low sensory detail, consider adding more sensory language
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Low Priority</strong> ⚪ - 8-12% sensory density:
                    Moderate sensory detail, could benefit from enhancement
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Good</strong> ✅ - &gt;12% sensory density: Strong
                    sensory engagement
                  </li>
                </ul>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  How Sensory Detail Scores Are Calculated
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Score is based on the ratio of paragraphs needing more sensory
                  details:
                </p>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>95 (Excellent):</strong> &lt;10% of paragraphs need
                    improvement
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>85 (Very Good):</strong> 10-20% of paragraphs need
                    improvement
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>75 (Good):</strong> 20-30% of paragraphs need
                    improvement
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>65 (Fair):</strong> 30-40% of paragraphs need
                    improvement
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>55 (Needs Work):</strong> 40-50% of paragraphs need
                    improvement
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>45 (Poor):</strong> &gt;50% of paragraphs need
                    improvement
                  </li>
                </ul>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Target:</strong> Aim for at least 12% sensory word
                  density across your manuscript. Strong descriptive passages
                  may reach 15-20%, while dialogue-heavy scenes naturally have
                  lower density.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Five Sensory Categories
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  The analyzer tracks 540+ sensory words across five categories:
                </p>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Visual (200+ words):</strong> shimmer, gleaming,
                    shadowy, vibrant, translucent, flickering
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Auditory (150+ words):</strong> whisper, thunder,
                    crackling, melodic, resonant, muffled
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Olfactory (50+ words):</strong> fragrant, musty,
                    acrid, earthy, pungent, aromatic
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Tactile (100+ words):</strong> rough, silky, cold,
                    prickly, clammy, velvety
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Gustatory (40+ words):</strong> bitter, sweet,
                    tangy, savory, bland, zesty
                  </li>
                </ul>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Pro Tip:</strong> The analyzer identifies which senses
                  are missing from each paragraph. A well-rounded scene engages
                  multiple senses, not just sight. Try adding sound, smell, or
                  tactile details to create immersive experiences.
                </p>
              </section>
            </div>
          </div>
        );

      case "export":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Export Formats Guide</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  PDF Export (.pdf)
                </h3>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Best for:</strong> Professional submissions,
                  agent/publisher formatting, print-ready manuscripts
                </p>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Features:</strong> Manuscript format with Courier 12pt
                  font, double-spaced lines, 1.25" margins, automatic page
                  numbering, optional analysis summary included
                </p>
                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#000000",
                    }}
                  >
                    💡 Perfect For:
                  </p>
                  <ul
                    style={{
                      paddingLeft: "1.5rem",
                      margin: 0,
                      color: "#000000",
                    }}
                  >
                    <li>Literary agent submissions</li>
                    <li>Publisher manuscript formatting</li>
                    <li>Professional presentation</li>
                    <li>Print-ready documents</li>
                  </ul>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  HTML Export (.html)
                </h3>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Best for:</strong> Analysis reports, sharing results,
                  viewing in browser
                </p>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Features:</strong> Self-contained file with embedded
                  analysis, color-coded indicators, print-optimized, responsive
                  design
                </p>
                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    borderLeft: "4px solid #d4a574",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "0",
                      color: "#8b5a2b",
                      fontWeight: "500",
                    }}
                  >
                    ℹ️ HTML export creates an <strong>analysis report</strong>{" "}
                    with pacing/sensory highlights. Not intended for round-trip
                    editing—use DOCX for that workflow.
                  </p>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  DOCX Export (.docx)
                </h3>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Best for:</strong> Round-trip editing, Word
                  collaboration, preserving styles
                </p>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Features:</strong> Full Word compatibility, styles
                  preserved on re-import (Book Title, Chapter Heading,
                  Subtitle), professional formatting
                </p>
                <div
                  style={{
                    background: "#f5ebe0",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    borderLeft: "4px solid #c9a87c",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "0",
                      color: "#6b4423",
                      fontWeight: "500",
                    }}
                  >
                    ✓ <strong>Round-trip fidelity:</strong> Write in QuillPilot
                    → Save as DOCX → Edit in Word → Re-import to QuillPilot.
                    Your Book Title, Chapter Heading, and Subtitle styles come
                    back exactly as you left them.
                  </p>
                </div>
                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#000000",
                    }}
                  >
                    Color Coding (Analysis Export):
                  </p>
                  <ul
                    style={{
                      paddingLeft: "1.5rem",
                      margin: 0,
                      color: "#000000",
                    }}
                  >
                    <li>Blue background = Compact spacing (too brief)</li>
                    <li>Green background = Balanced spacing (ideal)</li>
                    <li>Orange background = Extended spacing (too long)</li>
                    <li>Yellow background = Sensory detail suggestion</li>
                  </ul>
                </div>

                <h3
                  style={{
                    marginTop: "2rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  HTML vs DOCX: Quick Comparison
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Feature
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "center",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        HTML
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "center",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        DOCX
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        <strong>Purpose</strong>
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        Analysis report
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        Round-trip editing
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "#fafafa" }}>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        <strong>Round-trip</strong>
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        ❌ No
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        ✓ Yes
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        <strong>Styles preserved</strong>
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        Visual only
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        ✓ Word styles
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "#fafafa" }}>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        <strong>Best use</strong>
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        Share/print analysis
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                        }}
                      >
                        Save/collaborate
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  JSON Export (.json)
                </h3>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Best for:</strong> Developers, data analysis,
                  integrations
                </p>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Contains:</strong> Complete raw analysis data, all
                  scores, findings, suggestions, visualization data, and
                  metadata
                </p>
              </section>
            </div>
          </div>
        );

      case "domains":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Genre Libraries Explained</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  What Are Genre Libraries?
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Genre libraries are specialized pattern databases tailored to
                  specific fiction genres. They help the analyzer recognize
                  genre-specific tropes, character archetypes, plot structures,
                  and stylistic conventions unique to each genre.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Built-in Genre Libraries
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Genre
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Patterns Tracked
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Best For
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Romance</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>120+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Emotional beats, relationship arcs, tropes
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Mystery/Thriller</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>150+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Clue placement, red herrings, suspense techniques
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Fantasy</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>180+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Magic systems, worldbuilding, quest structures
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Science Fiction</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>160+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Tech concepts, worldbuilding, speculative elements
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Literary Fiction</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>100+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Character depth, themes, literary devices
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Genre-Specific Analysis Details
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Each genre library includes specialized analysis for common
                  storytelling patterns:
                </p>
                <ul
                  style={{
                    paddingLeft: "1.5rem",
                    marginBottom: "1rem",
                    lineHeight: "1.8",
                  }}
                >
                  <li>
                    <strong>Romance:</strong> Meet-cute, emotional beats,
                    conflict types, happily-ever-after/HFN tracking, intimacy
                    progression, romantic tension patterns
                  </li>
                  <li>
                    <strong>Mystery/Thriller:</strong> Clue placement timing,
                    red herring distribution, suspect introduction, revelation
                    pacing, twist effectiveness, suspense building
                  </li>
                  <li>
                    <strong>Fantasy:</strong> Magic system consistency,
                    worldbuilding depth, prophecy/chosen one tropes, mentor
                    archetype, quest structure, power progression
                  </li>
                  <li>
                    <strong>Science Fiction:</strong> Technology integration,
                    hard vs soft SF elements, future world consistency,
                    scientific accuracy, speculation grounding
                  </li>
                  <li>
                    <strong>Literary Fiction:</strong> Thematic depth, character
                    psychology, symbolism, metaphor usage, internal vs external
                    conflict balance
                  </li>
                </ul>
                <div
                  style={{
                    background: "#fef3c7",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #f59e0b",
                    marginBottom: "1rem",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#92400e" }}>
                    🔍 Genre Convention Check:
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#78350f" }}>
                    The system automatically checks if your manuscript follows
                    genre conventions and reader expectations. For example, in
                    Romance it verifies emotional beat placement; in Mystery it
                    checks clue distribution and red herring timing.
                  </p>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Auto-Detection Feature
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  When you upload a manuscript, Quill Pilot analyzes your
                  content and suggests the most likely genre based on character
                  patterns, plot structure, and stylistic markers. You can
                  always change the detected genre by clicking "Change Genre"
                  and selecting from the dropdown.
                </p>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0c392",
                    color: "#000000",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#000000" }}>
                    💡 Tip:
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#000000" }}>
                    Always verify the detected genre matches your manuscript's
                    primary subject for best results!
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      case "tiers":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Access Tiers & Features</h4>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1.5rem",
                    border: "2px solid #e0c392",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "0.5rem",
                      color: "#2c3e50",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    🎉 Free Tier - Start Here!
                  </h3>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    <strong>Powerful Features, Zero Cost:</strong>
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      ✅ <strong>Pacing & Flow Analysis</strong>{" "}
                      (paragraph-by-paragraph)
                    </li>
                    <li>
                      ✅ <strong>Sensory Detail Density</strong> (identifies
                      passages lacking sensory engagement)
                    </li>
                    <li>
                      ✅ Color-coded indicators throughout your manuscript
                    </li>
                    <li>✅ Smart sidebar with detailed analysis insights</li>
                    <li>✅ Upload DOCX files (up to 200 pages)</li>
                    <li>✅ All 5 built-in genre libraries</li>
                    <li>✅ Auto-genre detection</li>
                    <li>✅ Read-only manuscript viewer</li>
                    <li>❌ No editing capabilities (view-only)</li>
                    <li>❌ No Writer Mode</li>
                  </ul>
                  <p
                    style={{
                      marginTop: "0.75rem",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "#ef8432",
                      fontWeight: "600",
                    }}
                  >
                    🔒 Want More? Upgrade to unlock:
                  </p>
                  <ul
                    style={{
                      paddingLeft: "1.5rem",
                      margin: 0,
                      fontSize: "0.9rem",
                      color: "#6b7280",
                    }}
                  >
                    <li>All 30+ fiction craft elements (not just 2)</li>
                    <li>Export to HTML, DOCX, JSON</li>
                    <li>Character relationship mapping</li>
                    <li>Create custom genre libraries</li>
                    <li>Analyze full-length novels (600-1000 pages)</li>
                  </ul>
                  <p
                    style={{
                      marginTop: "0.75rem",
                      marginBottom: 0,
                      fontSize: "0.9rem",
                      color: "#2c3e50",
                      fontStyle: "italic",
                    }}
                  >
                    <strong>Perfect for:</strong> New writers, aspiring authors
                    testing the tool, single-chapter analysis, anyone wanting to
                    see what fiction craft analysis can reveal.
                  </p>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1.5rem",
                    border: "2px solid #e0c392",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "0.5rem",
                      color: "#2c3e50",
                    }}
                  >
                    👑 Premium Tier - Full Analysis
                  </h3>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    <strong>Everything in Free, PLUS:</strong>
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      ⭐ <strong>Full 30+ Element Analysis</strong> - Complete
                      fiction craft evaluation
                    </li>
                    <li>
                      ⭐ <strong>Interactive Character Highlighting</strong> -
                      Click any character or element to see all mentions
                      throughout manuscript
                    </li>
                    <li>
                      ⭐ <strong>Story Arc Tracking</strong> - Automatic
                      detection of character development and plot progression
                    </li>
                    <li>
                      ⭐ <strong>Export Anywhere</strong> - HTML, DOCX, JSON
                      formats
                    </li>
                    <li>
                      ⭐ <strong>Interactive Story Graphs</strong> - Visual
                      relationship mapping for characters and themes
                    </li>
                    <li>
                      ⭐ <strong>Custom Genre Libraries</strong> - Build your
                      own pattern databases
                    </li>
                    <li>
                      ⭐ <strong>Up to 650 pages</strong> - Analyze full-length
                      novels
                    </li>
                    <li>⭐ Comprehensive craft recommendations dashboard</li>
                    <li>⭐ Priority feature access</li>
                  </ul>
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.75rem",
                      background: "#fef5e7",
                      borderRadius: "6px",
                      border: "1px solid #e0c392",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "#2c3e50",
                      }}
                    >
                      <strong>💡 Why Upgrade?</strong> Free tier proves the AI
                      works. Premium gives you the complete toolkit to polish
                      your entire manuscript with professional-grade fiction
                      craft analysis.
                    </p>
                  </div>
                  <p
                    style={{
                      marginTop: "0.75rem",
                      marginBottom: 0,
                      fontSize: "0.9rem",
                      color: "#2c3e50",
                      fontStyle: "italic",
                    }}
                  >
                    <strong>Perfect for:</strong> Serious fiction writers,
                    aspiring novelists, self-publishing authors, writing
                    coaches, beta readers.
                  </p>
                </div>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    border: "2px solid #e0c392",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "0.5rem",
                      color: "#2c3e50",
                    }}
                  >
                    Professional Tier 💼
                  </h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    <strong>What You Get:</strong>
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>✅ Everything in Premium</li>
                    <li>
                      ✅ <strong>Writer Mode</strong> (edit + live craft
                      analysis)
                    </li>
                    <li>
                      ✅ <strong>Real-time feedback</strong> as you write
                    </li>
                    <li>
                      ✅ <strong>Unlimited analyses</strong>
                    </li>
                  </ul>
                  <p
                    style={{
                      marginTop: "0.5rem",
                      marginBottom: 0,
                      fontSize: "0.9rem",
                      color: "#2c3e50",
                    }}
                  >
                    <strong>Best for:</strong> Professional novelists,
                    publishers, writing coaches, editorial teams
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      case "writer":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Writer Mode Workflow</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Accessing Writer Mode
                </h3>
                <ol style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Upload a document</strong> (.docx, .txt, or .md)
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Run analysis</strong> (select genre first)
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Click "✍️ Writer" tab</strong> (Professional tier
                    required)
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Editor opens</strong> with your document text
                  </li>
                </ol>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Editing Features (Pro Tier Only)
                </h3>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Text Editing:</strong> Type directly in the editor,
                    copy/paste formatted text, word count updates live
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Pacing Controls:</strong> Toggle pacing indicators
                    on/off, dashed lines show paragraph boundaries
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Sensory Detail Controls:</strong> Toggle craft
                    callouts on/off, yellow boxes appear inline
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>Search & Highlight:</strong> Search for characters
                    or elements, click name to highlight all mentions
                  </li>
                </ul>

                <h4
                  style={{
                    marginTop: "1rem",
                    marginBottom: "0.25rem",
                    color: "#000000",
                  }}
                >
                  Autosave Behavior & Recovery
                </h4>
                <p
                  style={{
                    marginBottom: "0.75rem",
                    lineHeight: "1.5",
                    color: "#000000",
                  }}
                >
                  Writer Mode keeps one rolling backup named&nbsp;
                  <code>quillpilot_autosave</code> in your browser's local
                  storage. Every new edit replaces the previous snapshot. A
                  <strong> "✓ Draft protected"</strong> badge appears next to
                  your document title. Press <strong>Cmd/Ctrl+S</strong> to save
                  to your computer — you choose where to save it.
                </p>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    Closing or restarting the browser does <em>not</em> delete
                    the snapshot unless site data is cleared or you're using a
                    private/incognito window.
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    Use the "Dismiss" option on the restore banner to skip a
                    stale draft; this stores a skip token so the same snapshot
                    won't prompt again.
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    Only one draft is stored at a time. Before starting a new
                    document, use Save Analysis or export (DOCX/HTML/JSON) if
                    you need separate backups.
                  </li>
                </ul>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Writing Productivity Tools
                </h3>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>⌨️ Typewriter Mode:</strong> Keeps the current line
                    centered in the editor viewport as you write. Works with all
                    cursor movements - typing, arrow keys, mouse clicks, and
                    navigation shortcuts. Creates a distraction-free writing
                    experience by maintaining consistent eye position.
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>🎯 Focus Mode:</strong> Hides all craft indicators
                    and analysis highlights for pure writing without
                    distractions. Toggle on when drafting, off when revising.
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>⏱️ Sprint Mode:</strong> Set a timer (5-60 minutes)
                    for focused writing sessions. Tracks word count progress and
                    helps build consistent writing habits.
                  </li>
                  <li style={{ marginBottom: "0.5rem", color: "#000000" }}>
                    <strong>📝 Word Count Tracking:</strong> Real-time updates
                    showing total words and sprint progress. Helps maintain
                    daily writing goals.
                  </li>
                </ul>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    color: "#000000",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#000000" }}>
                    💡 Pro Tip:
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#000000" }}>
                    Edit in your external editor, then upload new versions to
                    track improvement over time!
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      case "colors":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Color Coding System</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Score Badges
                </h3>
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#10b981",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontWeight: "600",
                      }}
                    >
                      80-100
                    </span>
                    <span>Strong application</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#f59e0b",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontWeight: "600",
                      }}
                    >
                      50-79
                    </span>
                    <span>Moderate application</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#ef4444",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontWeight: "600",
                      }}
                    >
                      0-49
                    </span>
                    <span>Needs improvement</span>
                  </div>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Spacing Indicators
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Background Color
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        Light Blue (#DBEAFE)
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Compact spacing (&lt;60 words)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        Light Green (#D1FAE5)
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Balanced length (60-160 words)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        Light Orange (#FED7AA)
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Extended paragraph (&gt;160 words)
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Priority Badges
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#dc2626",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      High Priority
                    </span>
                    <span>Critical suggestions</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#f59e0b",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      Medium Priority
                    </span>
                    <span>Beneficial suggestions</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#6b7280",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      Low Priority
                    </span>
                    <span>Optional suggestions</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );

      case "technical":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Technical Specifications</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Supported File Formats
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Format
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Extension
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Max Size
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Page Limits by Tier
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>Microsoft Word</td>
                      <td style={{ padding: "0.5rem" }}>.docx</td>
                      <td style={{ padding: "0.5rem" }}>200 MB</td>
                      <td style={{ padding: "0.5rem", fontSize: "0.9em" }}>
                        Free: 200 pages
                        <br />
                        Premium: 650 pages
                        <br />
                        Professional: 1,000 pages
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    fontSize: "0.95em",
                    color: "#6b7280",
                  }}
                >
                  <strong>Note:</strong> Page count is estimated at
                  approximately 350 words per page (typical manuscript density).
                  Free tier accommodates short stories or novellas, Premium tier
                  handles full-length novels, and Professional tier supports
                  epic fantasies and series bibles.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Browser Requirements
                </h3>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  <strong>Minimum:</strong>
                </p>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li>Chrome 90+</li>
                  <li>Firefox 88+</li>
                  <li>Safari 14+</li>
                  <li>Edge 90+</li>
                </ul>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Analysis Performance
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Document Size
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Analysis Time
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Memory Usage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>~5,000 words</td>
                      <td style={{ padding: "0.5rem" }}>1-2 seconds</td>
                      <td style={{ padding: "0.5rem" }}>~40 MB</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>~28,000 words</td>
                      <td style={{ padding: "0.5rem" }}>4-6 seconds</td>
                      <td style={{ padding: "0.5rem" }}>~80 MB</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        ~162,500 words (650 pages)
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        ~5 seconds (DOCX load)
                      </td>
                      <td style={{ padding: "0.5rem" }}>~300 MB</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>~210,000 words</td>
                      <td style={{ padding: "0.5rem" }}>25-35 seconds</td>
                      <td style={{ padding: "0.5rem" }}>~400 MB</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        ~250,000 words (1,000 pages)
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        ~8-10 seconds (estimated)
                      </td>
                      <td style={{ padding: "0.5rem" }}>~500 MB</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>~350,000 words</td>
                      <td style={{ padding: "0.5rem" }}>40-60 seconds</td>
                      <td style={{ padding: "0.5rem" }}>~650 MB</td>
                    </tr>
                  </tbody>
                </table>

                <p
                  style={{
                    fontSize: "0.9em",
                    color: "#6b7280",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>Note:</strong> Load times are measured for DOCX file
                  upload and initial rendering. 650-page documents load in
                  approximately 5 seconds (tested). 1,000-page documents
                  estimated at 8-10 seconds based on scaling patterns.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Data Privacy
                </h3>
                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0c392",
                  }}
                >
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    🔒 Your Data is Safe:
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      ✅ All analysis runs <strong>in your browser</strong>
                    </li>
                    <li>
                      ✅ Documents <strong>never uploaded</strong> to servers
                    </li>
                    <li>
                      ✅ Custom genre libraries saved <strong>locally</strong>{" "}
                      only
                    </li>
                    <li>✅ No tracking or analytics</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        );

      case "fictionElements":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>12 Core Fiction Elements</h4>

                <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                  Quill Pilot analyzes your manuscript across 12 essential
                  fiction craft elements to provide comprehensive insights into
                  your storytelling.
                </p>

                <div
                  style={{
                    backgroundColor: "#fef5e7",
                    borderLeft: "4px solid #3b82f6",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#1e40af",
                      fontSize: "1rem",
                    }}
                  >
                    📖 Characters
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Tracks character names, development arcs, relationships, and
                    presence throughout your manuscript. Identifies protagonist,
                    antagonist, and supporting characters, analyzing how they
                    evolve and interact.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#ef8432",
                      fontSize: "1rem",
                    }}
                  >
                    🏔️ Setting
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Evaluates place descriptions, atmosphere, and environmental
                    details. Measures sensory depth (sight, sound, smell, touch,
                    taste) and how effectively setting grounds readers in your
                    story world.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderLeft: "4px solid #10b981",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#059669",
                      fontSize: "1rem",
                    }}
                  >
                    ⏰ Time
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Analyzes temporal flow, pacing markers, and time
                    transitions. Identifies scene breaks, flashbacks, time
                    jumps, and the rhythm of your narrative's progression
                    through story time.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    borderLeft: "4px solid #ef4444",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#dc2626",
                      fontSize: "1rem",
                    }}
                  >
                    📊 Plot
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Examines story events, causality, and narrative structure.
                    Tracks key plot points, turning points, and how events build
                    upon each other to create a cohesive story arc.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fdf4ff",
                    borderLeft: "4px solid #a855f7",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#9333ea",
                      fontSize: "1rem",
                    }}
                  >
                    ⚔️ Conflict
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Identifies sources of tension, obstacles, and stakes.
                    Analyzes internal and external conflicts, antagonistic
                    forces, and how tension escalates throughout your story.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    borderLeft: "4px solid #f59e0b",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#d97706",
                      fontSize: "1rem",
                    }}
                  >
                    💡 Theme
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Detects underlying meanings, recurring motifs, and thematic
                    patterns. Identifies the deeper ideas your story explores
                    and how they're woven through narrative events.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#f5f3ff",
                    borderLeft: "4px solid #8b5cf6",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#7c3aed",
                      fontSize: "1rem",
                    }}
                  >
                    🎙️ Voice
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Evaluates narrative style, point of view, and distinctive
                    language choices. Measures consistency in voice, tonal
                    qualities, and how effectively your narrator's perspective
                    shapes the story.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#ecfccb",
                    borderLeft: "4px solid #84cc16",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#65a30d",
                      fontSize: "1rem",
                    }}
                  >
                    🎭 Genre Elements
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Identifies genre-specific markers like magical systems
                    (fantasy), technology (sci-fi), romantic tension (romance),
                    or investigative clues (mystery). Ensures your story
                    delivers expected genre elements.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#ef8432",
                      fontSize: "1rem",
                    }}
                  >
                    🏗️ Structure
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Analyzes narrative organization, chapter breaks, and story
                    architecture. Examines how scenes connect, where act breaks
                    fall, and whether your structure serves the story
                    effectively.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fef5e7",
                    borderLeft: "4px solid #ef8432",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#0284c7",
                      fontSize: "1rem",
                    }}
                  >
                    ⚡ Pacing
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Measures narrative rhythm and momentum. Tracks sentence
                    length variation, scene tempo, action vs. reflection
                    balance, and whether your story maintains reader engagement
                    throughout.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#f0fdfa",
                    borderLeft: "4px solid #14b8a6",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#0f766e",
                      fontSize: "1rem",
                    }}
                  >
                    🌍 Worldbuilding
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Evaluates consistency and depth of your story world. Tracks
                    rules, systems, cultural details, and how thoroughly you've
                    established the reality in which your story unfolds.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fff1f2",
                    borderLeft: "4px solid #f43f5e",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0 0.5rem 0.5rem 0",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#e11d48",
                      fontSize: "1rem",
                    }}
                  >
                    ❤️ Emotional Core
                  </h5>
                  <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
                    Analyzes emotional resonance and reader engagement
                    potential. Identifies emotional beats, character
                    vulnerability, stakes that matter, and moments designed to
                    create reader emotional investment.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "1rem",
                    marginTop: "1.5rem",
                    borderRadius: "0.5rem",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#1e293b",
                      fontSize: "1rem",
                    }}
                  >
                    💡 How to Use This Analysis
                  </h5>
                  <p style={{ margin: 0, color: "#475569", lineHeight: "1.6" }}>
                    Each element receives a score showing how effectively it's
                    executed in your manuscript. Use these scores to identify
                    strengths to leverage and weaknesses to address. The
                    combined analysis reveals your storytelling patterns and
                    opportunities for improvement.
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>Frequently Asked Questions</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  General Questions
                </h3>

                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: How long does analysis take?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: 2-5 seconds for typical scenes (1000-5000 words). Full
                    manuscripts may take 15-30 seconds.
                  </p>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Can I analyze multiple chapters at once?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Currently one at a time. Open multiple browser tabs for
                    parallel analysis (Premium/Pro).
                  </p>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Does this work offline?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Yes! Once loaded, the app runs entirely in your browser
                    without internet.
                  </p>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Is my document secure?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Completely. Nothing uploads to servers - all analysis
                    happens locally in your browser.
                  </p>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Analysis Questions
                </h3>

                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Why is my spacing score low?
                  </p>
                  <p
                    style={{
                      marginBottom: "0.5rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Common causes:
                  </p>
                  <ul style={{ marginBottom: "1rem", paddingLeft: "2.5rem" }}>
                    <li>Elements mentioned only once (no development)</li>
                    <li>Plot threads clustered in one section</li>
                    <li>Very short or very long paragraphs</li>
                    <li>Lack of callbacks or thematic echoes</li>
                  </ul>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Why is my sensory detail score low?
                  </p>
                  <p
                    style={{
                      marginBottom: "0.5rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Common causes:
                  </p>
                  <ul style={{ marginBottom: "1rem", paddingLeft: "2.5rem" }}>
                    <li>Telling emotions instead of showing reactions</li>
                    <li>Lack of sensory details and physical descriptions</li>
                    <li>Character traits stated rather than demonstrated</li>
                    <li>Summarizing events instead of dramatizing scenes</li>
                  </ul>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Can I disagree with a recommendation?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Yes! The analyzer uses heuristics that may not fit your
                    pedagogical approach. Use professional judgment.
                  </p>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Export Questions
                </h3>

                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Which export format should I use?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: <strong>HTML</strong> for quick sharing and viewing,{" "}
                    <strong>DOCX</strong> for editing and collaboration,{" "}
                    <strong>JSON</strong> for data analysis and tracking.
                  </p>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Do exports include my edits from Writer Mode?
                  </p>
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      paddingLeft: "1rem",
                    }}
                  >
                    A: Yes! DOCX and HTML exports include your final edited
                    text.
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      case "related":
        return (
          <div className="quickstart-shell">
            <div className="quickstart-content">
              <section
                className="quickstart-card"
                style={{ borderRadius: "1rem" }}
              >
                <h4>📚 Related Resources</h4>
                <p
                  style={{
                    marginBottom: "1.5rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Explore these additional guides to get the most out of
                  QuillPilot.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Quick Start Guide
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  New to QuillPilot? The Quick Start Guide walks you through
                  uploading your first document, running analysis, and
                  understanding results. Access it from the ☰ menu → Quick
                  Start.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  Writer's Reference
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Comprehensive documentation for Writer Mode, including the
                  editor toolbar, Advanced Tools Panel, AI Writing Assistant,
                  and all productivity features. Access it from the ☰ menu →
                  Writer's Reference.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#000000",
                  }}
                >
                  12 Fiction Elements
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    color: "#000000",
                  }}
                >
                  Learn about every writing concept QuillPilot analyzes—from
                  Show vs Tell to Pacing to Dialogue Tags. See the "12 Fiction
                  Elements" section in this Reference Library for definitions
                  and examples.
                </p>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginTop: "1.5rem",
                    borderLeft: "4px solid #ef8432",
                    color: "#000000",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#000000" }}>
                    💡 Tip:
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#000000" }}>
                    Use the sidebar navigation to jump between any section. Each
                    guide is designed to complement the others—start with Quick
                    Start, then explore the Reference Library and Writer's
                    Reference as you grow.
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
            background: "#f7e6d0",
            color: "#2c3e50",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AnimatedLogo size={96} animate={true} />
            <span
              style={{
                fontFamily: "'Georgia', 'Palatino', serif",
                fontSize: "2.2rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                lineHeight: 1,
                marginRight: "0.5rem",
              }}
            >
              Quill Pilot
            </span>
            <span
              style={{
                fontSize: "1.2rem",
                color: "#6b7280",
                marginLeft: "0.5rem",
              }}
            >
              Reference Library
            </span>
          </div>
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
