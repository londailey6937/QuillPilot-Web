import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface ReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ReferenceLibraryModal Component - Complete feature reference and technical documentation
 *
 * Displays comprehensive guide to all features, export formats, domains, and technical specs.
 */
export function ReferenceLibraryModal({
  isOpen,
  onClose,
}: ReferenceLibraryModalProps): JSX.Element | null {
  const [activeSection, setActiveSection] = useState<string>("spacing");

  if (!isOpen) return null;

  const sections = {
    spacing: "Spacing Analysis",
    dualCoding: "Dual Coding",
    export: "Export Formats",
    domains: "Domain Libraries",
    tiers: "Access Tiers",
    writer: "Writer Mode",
    colors: "Color Coding",
    technical: "Technical Specs",
    matching: "Concept Matching",
    faq: "FAQ",
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
                <h4>Concept Matching Strategy</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  How We Identify Concepts
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  Our analysis engine uses a sophisticated{" "}
                  <strong>Two-Pass Logic</strong> to ensure both accuracy and
                  flexibility when identifying concepts in your text.
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
                    The Matching Workflow
                  </h5>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: "1.5rem",
                      color: "#334155",
                    }}
                  >
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Strict Match (Pass 1):</strong> We first look for
                      the exact, canonical name of the concept (e.g., "Real
                      option exercise rule"). This ensures the most specific
                      terminology is recognized.
                    </li>
                    <li>
                      <strong>Flexible Match (Pass 2):</strong> If the exact
                      name isn't found, we scan for approved aliases and
                      variations (e.g., "exercise rule"). This captures natural
                      language usage while mapping it back to the core concept.
                    </li>
                  </ol>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  False Positive Reporting
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  Language is complex, and sometimes a word might be matched out
                  of context (e.g., "Bond" as a name vs. "Bond" as a financial
                  instrument).
                </p>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  You can now <strong>Report False Positives</strong> directly
                  from the concept list. Look for the flag icon{" "}
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
                  on any concept pill to flag it for review. This helps us
                  refine our libraries and improve accuracy for everyone.
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
                <h4>Spacing Analysis Reference</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  What is Spacing Analysis?
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  Spacing analysis evaluates how concepts are distributed across
                  your chapter to support <strong>spaced repetition</strong> - a
                  proven learning technique where information is revisited at
                  optimal intervals.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Paragraph Spacing Indicators
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
                        Optimal paragraph length for learning
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🔵 <strong>Blue</strong> (Compact)
                      </td>
                      <td style={{ padding: "0.5rem" }}>&lt;60 words</td>
                      <td style={{ padding: "0.5rem" }}>
                        Too brief, may lack detail
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🟠 <strong>Orange</strong> (Extended)
                      </td>
                      <td style={{ padding: "0.5rem" }}>&gt;160 words</td>
                      <td style={{ padding: "0.5rem" }}>
                        Too long, cognitive overload risk
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  How Spacing Scores Are Calculated
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  <strong>Score Range: 0-100</strong>
                </p>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>80-100 (High):</strong> Strong spaced repetition
                    with concepts revisited 3-5 times at good intervals
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>50-79 (Medium):</strong> Moderate spacing, some
                    concepts repeated but intervals could be better
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>0-49 (Low):</strong> Poor spacing, concepts either
                    mentioned once or clustered together
                  </li>
                </ul>
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
                <h4>Dual Coding Analysis Reference</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  What is Dual Coding?
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  <strong>Dual coding</strong> combines verbal (text) and visual
                  (images, diagrams) representations to enhance learning and
                  memory retention.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Visual Suggestion Types
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
                        Visual Type
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        When Suggested
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        📊 <strong>Diagram</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Spatial relationships, structures
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🧭 <strong>Flowchart</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Processes, sequences, steps
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        📈 <strong>Graph</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Data, trends, comparisons
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🎨 <strong>Illustration</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Physical descriptions
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        🧠 <strong>Concept Map</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        Abstract relationships
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Priority Levels
                </h3>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>High Priority</strong> 🔴 - Critical: Complex
                    content suffers without visual
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Medium Priority</strong> 🟡 - Beneficial: Would
                    improve comprehension
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Low Priority</strong> ⚪ - Optional: Minor
                    enhancement
                  </li>
                </ul>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  How Dual Coding Scores Are Calculated
                </h3>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>80-100 (High):</strong> Excellent visual support
                    with diagrams/images for complex concepts
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>50-79 (Medium):</strong> Some visual elements
                    present but opportunities missed
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>0-49 (Low):</strong> Text-heavy with little to no
                    visual representation
                  </li>
                </ul>
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
                    color: "#374151",
                  }}
                >
                  HTML Export (.html)
                </h3>
                <p style={{ marginBottom: "0.5rem", lineHeight: "1.6" }}>
                  <strong>Best for:</strong> Sharing, viewing in browser,
                  printing
                </p>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  <strong>Features:</strong> Self-contained file, works in any
                  browser, color-coded indicators, print-optimized, responsive
                  design
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  DOCX Export (.docx)
                </h3>
                <p style={{ marginBottom: "0.5rem", lineHeight: "1.6" }}>
                  <strong>Best for:</strong> Editing in Word, collaborating,
                  formal documents
                </p>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  <strong>Features:</strong> Editable in Microsoft Word, colored
                  shaded backgrounds, professional formatting
                </p>
                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Color Coding:
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>Blue background = Compact spacing (too brief)</li>
                    <li>Green background = Balanced spacing (ideal)</li>
                    <li>Orange background = Extended spacing (too long)</li>
                    <li>Yellow background = Dual-coding suggestion</li>
                  </ul>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  JSON Export (.json)
                </h3>
                <p style={{ marginBottom: "0.5rem", lineHeight: "1.6" }}>
                  <strong>Best for:</strong> Developers, data analysis,
                  integrations
                </p>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
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
                <h4>Domain Libraries Explained</h4>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  What Are Domain Libraries?
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  Domain libraries are pre-built concept dictionaries tailored
                  to specific subject areas. They help the analyzer recognize
                  subject-specific terminology, extract domain concepts more
                  accurately, and evaluate content relevance to the field.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Built-in Domains
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
                        Domain
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Concepts
                      </th>
                      <th style={{ padding: "0.5rem", textAlign: "left" }}>
                        Best For
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Chemistry</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>150+</td>
                      <td style={{ padding: "0.5rem" }}>
                        General chemistry, organic, reactions
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Mathematics</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>600+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Elementary arithmetic through advanced calculus, linear
                        algebra, discrete math
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Computing</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>180+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Programming, data structures, algorithms
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Finance</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>90+</td>
                      <td style={{ padding: "0.5rem" }}>
                        Financial concepts, markets, accounting
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.5rem" }}>
                        <strong>Web Development</strong>
                      </td>
                      <td style={{ padding: "0.5rem" }}>170+</td>
                      <td style={{ padding: "0.5rem" }}>
                        JavaScript fundamentals, ES6+, React, hooks, DOM, async
                        patterns
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Mathematics Library Details
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  Our comprehensive mathematics library covers elementary
                  through graduate-level concepts with intelligent prerequisite
                  ordering:
                </p>
                <ul
                  style={{
                    paddingLeft: "1.5rem",
                    marginBottom: "1rem",
                    lineHeight: "1.8",
                  }}
                >
                  <li>
                    <strong>Level 0 - Elementary:</strong> Arithmetic
                    fundamentals, basic operations, fractions, decimals,
                    percentages, ratios (75+ concepts)
                  </li>
                  <li>
                    <strong>Level 1 - Foundations:</strong> Algebra
                    fundamentals, equations, polynomials, basic geometry, number
                    theory (100+ concepts)
                  </li>
                  <li>
                    <strong>Level 2 - Intermediate:</strong> Functions,
                    graphing, trigonometry, geometry, coordinate geometry (150+
                    concepts)
                  </li>
                  <li>
                    <strong>Level 3 - Advanced:</strong> Advanced trigonometry,
                    matrices, vectors, linear algebra, discrete mathematics
                    (150+ concepts)
                  </li>
                  <li>
                    <strong>Level 4 - Calculus:</strong> Limits, derivatives,
                    integrals (75+ concepts)
                  </li>
                  <li>
                    <strong>Level 5 - Graduate:</strong> Multivariable calculus,
                    differential equations, optimization (50+ concepts)
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
                    🔍 Prerequisite Order Check:
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#78350f" }}>
                    For mathematics chapters, the system automatically checks if
                    concepts appear before their prerequisites (e.g., calculus
                    before trigonometry). Only flags issues for concepts{" "}
                    <em>explicitly mentioned in your document</em> — assumes
                    foundational knowledge from prior chapters.
                  </p>
                </div>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Auto-Detection Feature
                </h3>
                <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                  When you upload a document, Chapter Checker analyzes your
                  content and suggests the most likely domain based on keyword
                  analysis and concept frequency. You can always change the
                  detected domain by clicking "Change Domain" and selecting from
                  the dropdown.
                </p>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0c392",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600" }}>💡 Tip:</p>
                  <p style={{ margin: "0.5rem 0 0 0" }}>
                    Always verify the detected domain matches your chapter's
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
                      ✅ <strong>Spacing & Pacing Analysis</strong>{" "}
                      (paragraph-by-paragraph)
                    </li>
                    <li>
                      ✅ <strong>Dual-Coding AI</strong> (visual opportunity
                      detection)
                    </li>
                    <li>✅ Color-coded pills & banners in your document</li>
                    <li>✅ Smart sidebar with detailed analysis cards</li>
                    <li>✅ Upload DOCX files with images (up to 200 pages)</li>
                    <li>✅ All 8 built-in academic domains</li>
                    <li>✅ Auto-domain detection</li>
                    <li>✅ Read-only document viewer</li>
                    <li>❌ No editing capabilities (view-only)</li>
                    <li>❌ No rich text editor</li>
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
                    <li>All 10 learning principles (not just 2)</li>
                    <li>Export to HTML, DOCX, JSON</li>
                    <li>Interactive concept graphs</li>
                    <li>Create custom domains</li>
                    <li>Analyze entire textbooks (600-1000 pages)</li>
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
                    <strong>Perfect for:</strong> Students, educators testing
                    the tool, single-chapter analysis, anyone wanting to see
                    what learning science can do for their content.
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
                    👑 Premium Tier - Unlock Everything
                  </h3>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    <strong>Everything in Free, PLUS:</strong>
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>
                      ⭐ <strong>Full 10-Principle Analysis</strong> - Complete
                      learning science evaluation
                    </li>
                    <li>
                      ⭐ <strong>Interactive Concept Highlighting</strong> -
                      Click any concept to see all mentions throughout the
                      chapter
                    </li>
                    <li>
                      ⭐ <strong>Prerequisite Order Check</strong> - Automatic
                      detection of out-of-sequence concepts (e.g., calculus
                      before trig)
                    </li>
                    <li>
                      ⭐ <strong>Export Anywhere</strong> - HTML, DOCX, JSON
                      formats
                    </li>
                    <li>
                      ⭐ <strong>Interactive Concept Graphs</strong> - Visual
                      knowledge mapping
                    </li>
                    <li>
                      ⭐ <strong>Custom Domains</strong> - Build your own
                      concept libraries
                    </li>
                    <li>
                      ⭐ <strong>Up to 650 pages</strong> - Analyze entire
                      textbooks
                    </li>
                    <li>⭐ Comprehensive recommendations dashboard</li>
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
                      works. Premium gives you the complete toolkit to transform
                      your entire curriculum with research-backed learning
                      science.
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
                    <strong>Perfect for:</strong> Professional educators,
                    instructional designers, content creators, textbook authors,
                    curriculum developers.
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
                      ✅ <strong>Writer Mode</strong> (edit + live updates)
                    </li>
                    <li>
                      ✅ <strong>Real-time highlighting</strong> as you type
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
                    <strong>Best for:</strong> Publishers, textbook authors,
                    instructional designers, teams
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
                    color: "#374151",
                  }}
                >
                  Accessing Writer Mode
                </h3>
                <ol style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Upload a document</strong> (DOCX or OBT)
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Run analysis</strong> (select domain first)
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Click "✍️ Writer" tab</strong> (Professional tier
                    required)
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Editor opens</strong> with your document text
                  </li>
                </ol>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Editing Features (Pro Tier Only)
                </h3>
                <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Text Editing:</strong> Type directly in the editor,
                    copy/paste formatted text, word count updates live
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Spacing Controls:</strong> Toggle spacing indicators
                    on/off, dashed lines show paragraph boundaries
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Dual Coding Controls:</strong> Toggle visual
                    callouts on/off, yellow boxes appear inline
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <strong>Search & Highlight:</strong> Search for concepts,
                    click concept name to highlight all mentions
                  </li>
                </ul>

                <div
                  style={{
                    background: "#fef5e7",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600" }}>💡 Pro Tip:</p>
                  <p style={{ margin: "0.5rem 0 0 0" }}>
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
                    color: "#374151",
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
                    color: "#374151",
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
                    color: "#374151",
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
                    color: "#374151",
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
                    <tr>
                      <td style={{ padding: "0.5rem" }}>Open Book Text</td>
                      <td style={{ padding: "0.5rem" }}>.obt</td>
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
                  approximately 350 words per page (typical textbook density).
                  Free tier accommodates a generous single chapter, Premium tier
                  handles full undergraduate textbooks, and Professional tier
                  supports large comprehensive texts like reference books and
                  handbooks.
                </p>

                <h3
                  style={{
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Browser Requirements
                </h3>
                <p style={{ marginBottom: "0.5rem", lineHeight: "1.6" }}>
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
                    color: "#374151",
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
                    color: "#374151",
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
                      ✅ Custom domains saved <strong>locally</strong> only
                    </li>
                    <li>✅ No tracking or analytics</li>
                  </ul>
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
                    color: "#374151",
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
                    A: 2-5 seconds for typical chapters (1000-5000 words). Very
                    large documents may take 15-30 seconds.
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
                    color: "#374151",
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
                    <li>Concepts mentioned only once (no repetition)</li>
                    <li>Concepts clustered in one section</li>
                    <li>Very short or very long paragraphs</li>
                    <li>Lack of review/summary sections</li>
                  </ul>

                  <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Q: Why is my dual coding score low?
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
                    <li>No images, diagrams, or visual elements</li>
                    <li>Text-heavy descriptions of visual concepts</li>
                    <li>Processes described without flowcharts</li>
                    <li>Data presented without graphs</li>
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
                    color: "#374151",
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
              Tome{" "}
              <span style={{ fontStyle: "italic", fontWeight: "700" }}>IQ</span>
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
