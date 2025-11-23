import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * HelpModal Component - In-app documentation for analysis results
 *
 * Displays comprehensive guide to interpreting analysis results,
 * learning principles, scores, and recommendations.
 */
export function HelpModal({
  isOpen,
  onClose,
}: HelpModalProps): JSX.Element | null {
  const [activeSection, setActiveSection] = useState<string>("quickStart");

  if (!isOpen) return null;

  const sections = {
    quickStart: "Quick Start",
    overview: "Overview",
    overallScore: "Overall Score",
    concepts: "Concept Analysis",
    relationships: "Concept Relationships",
    patterns: "Pattern Recognition",
    principles: "Learning Principles",
    recommendations: "Recommendations",
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
              Quick Start Guide
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
            }}
          >
            {activeSection === "quickStart" && <QuickStartSection />}
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "overallScore" && <OverallScoreSection />}
            {activeSection === "concepts" && <ConceptsSection />}
            {activeSection === "relationships" && <RelationshipsSection />}
            {activeSection === "patterns" && <PatternsSection />}
            {activeSection === "principles" && <PrinciplesSection />}
            {activeSection === "recommendations" && <RecommendationsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Components

function QuickStartSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Document Size Support</h4>
          <p>
            <strong>Designed for True "Tome" Analysis</strong>
          </p>
          <p>Tome IQ can handle large academic documents:</p>
          <ul className="quickstart-list">
            <li>
              <strong>Tested up to 200 MB</strong> - Approximately 800-1,200
              pages
            </li>
            <li>
              A typical <strong>500-page academic textbook</strong> with
              moderate images is usually 50-80 MB
            </li>
            <li>
              Comfortably handles even the{" "}
              <strong>largest scholarly works</strong> or complete multi-volume
              compilations
            </li>
          </ul>
          <p>
            <strong>Supported formats:</strong> <code>.docx</code> and{" "}
            <code>.obt</code>
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How to Use Tome IQ</h4>
          <ol className="quickstart-order">
            <li>
              <span className="quickstart-step-title">
                Upload or Paste Your Document
              </span>
              <ul className="quickstart-sublist">
                <li>
                  Click "Upload Document" to select a file from your computer
                </li>
                <li>Or paste text directly into the text area</li>
                <li>Documents can include images (automatically processed)</li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">
                Select Domain (Optional)
              </span>
              <ul className="quickstart-sublist">
                <li>
                  Choose the subject area: Chemistry, Finance,
                  Algebra/Trigonometry
                </li>
                <li>
                  Or use "Auto-detect" for automatic domain identification
                </li>
                <li>
                  <strong>Premium/Pro users:</strong> Create custom domains with
                  your own concepts
                </li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">Analyze Chapter</span>
              <ul className="quickstart-sublist">
                <li>Click the "Analyze Chapter" button</li>
                <li>Processing may take 10-30 seconds for large documents</li>
                <li>Web workers prevent UI freezing during analysis</li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">Review Results</span>
              <ul className="quickstart-sublist">
                <li>Overall score shows learning effectiveness (0-100)</li>
                <li>10 learning principles each scored individually</li>
                <li>Actionable recommendations for improvement</li>
                <li>Concept maps and relationship visualizations</li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">
                Export or Take Action
              </span>
              <ul className="quickstart-sublist">
                <li>
                  <strong>Premium/Pro:</strong> Export results as DOCX
                </li>
                <li>Use recommendations to improve content in your editor</li>
                <li>Compare before/after analyses to track improvements</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Tips for Best Results</h4>
          <ul className="quickstart-list">
            <li>
              <strong>Complete Chapters:</strong> Upload full chapters rather
              than fragments for accurate analysis
            </li>
            <li>
              <strong>Include Images:</strong> Visual content (diagrams, charts)
              improves dual coding scores
            </li>
            <li>
              <strong>Domain Selection:</strong> Choose the correct domain for
              more accurate concept extraction
            </li>
            <li>
              <strong>Multiple Passes:</strong> Re-analyze after making
              improvements to see progress
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Gets Analyzed</h4>
          <ul className="quickstart-list">
            <li>
              <strong>10 Learning Principles:</strong> Evidence-based cognitive
              science metrics
            </li>
            <li>
              <strong>Concept Extraction:</strong> Automatic identification of
              key ideas and relationships
            </li>
            <li>
              <strong>Pattern Recognition:</strong> Domain-specific and
              universal learning patterns
            </li>
            <li>
              <strong>Structure Analysis:</strong> Content organization,
              spacing, and interleaving
            </li>
            <li>
              <strong>Cognitive Load:</strong> Information density and
              complexity assessment
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Guide Purpose</h4>
          <p>
            This reference explains every section of the analysis results, what
            each metric means, and how to interpret the findings when improving
            educational materials.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Gets Analyzed</h4>
          <ul className="quickstart-list">
            <li>
              <strong>Content Quality:</strong> Ten evidence-based learning
              principles scored individually
            </li>
            <li>
              <strong>Concepts:</strong> Key ideas that appear in the chapter
              and their relationships
            </li>
            <li>
              <strong>Patterns:</strong> Universal and domain-specific learning
              structures that aid comprehension
            </li>
            <li>
              <strong>Structure:</strong> Organization, sequencing, and cohesion
              across sections
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How to Use This Guide</h4>
          <p>Use the sidebar navigation to quickly jump to details on:</p>
          <ul className="quickstart-list">
            <li>Interpreting each score and understanding the scale</li>
            <li>How metrics are calculated and weighted</li>
            <li>Common findings and what they signal about the content</li>
            <li>Recommended actions tied to the learning principles</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function OverallScoreSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Overall Score Overview</h4>
          <p>
            The overall score is a weighted average of the ten learning
            principles, producing a single quality metric for the chapter. It
            reflects both the presence and the strength of each principle.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Score Interpretation</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f7e6d0" }}>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    borderBottom: "2px solid #ef8432",
                  }}
                >
                  Score Range
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    borderBottom: "2px solid #ef8432",
                  }}
                >
                  Quality Level
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    borderBottom: "2px solid #ef8432",
                  }}
                >
                  Interpretation
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  range: "90-100",
                  level: "Excellent",
                  interpretation: "Exemplifies evidence-based learning design",
                },
                {
                  range: "80-89",
                  level: "Good",
                  interpretation:
                    "Strong foundation with room for minor refinements",
                },
                {
                  range: "70-79",
                  level: "Adequate",
                  interpretation: "Meets basic standards but has clear gaps",
                },
                {
                  range: "60-69",
                  level: "Needs Improvement",
                  interpretation: "Missing multiple key principles",
                },
                {
                  range: "Below 60",
                  level: "Critical",
                  interpretation: "Requires a pedagogical redesign",
                },
              ].map((row) => (
                <tr key={row.range}>
                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #fad5a5",
                    }}
                  >
                    {row.range}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #fad5a5",
                    }}
                  >
                    <strong>{row.level}</strong>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #fad5a5",
                    }}
                  >
                    {row.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How It's Calculated</h4>
          <div
            style={{
              backgroundColor: "#fef5e7",
              padding: "1rem",
              borderRadius: "0.75rem",
              marginBottom: "1rem",
              fontFamily:
                "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
            }}
          >
            Overall Score = sum(Principle Score * Weight) / sum(Weights)
          </div>
          <ul className="quickstart-list">
            <li>
              <strong>Deep Processing:</strong> 0.95
            </li>
            <li>
              <strong>Retrieval Practice:</strong> 0.90
            </li>
            <li>
              <strong>Schema Building:</strong> 0.90
            </li>
            <li>
              <strong>Dual Coding:</strong> 0.85
            </li>
            <li>
              <strong>Generative Learning:</strong> 0.85
            </li>
            <li>
              <strong>Spaced Repetition:</strong> 0.80
            </li>
            <li>
              <strong>Interleaving:</strong> 0.75
            </li>
            <li>
              <strong>Worked Examples:</strong> 0.70
            </li>
            <li>
              <strong>Self-Explanation:</strong> 0.65
            </li>
            <li>
              <strong>Elaboration:</strong> 0.60
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ConceptsSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Concept Analysis Overview</h4>
          <p>
            The analysis identifies fundamental ideas, terms, and theories that
            are essential to understanding the chapter. Only core-level concepts
            appear to keep the focus on knowledge students must master.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Core Concept Highlights</h4>
          <p>
            Core concepts are foundational to the topic - for example: function,
            variable, loop, or array in a programming chapter.
          </p>
          <ul className="quickstart-list">
            <li>Signal what must be explained thoroughly</li>
            <li>Appear in headings, callouts, and key paragraphs</li>
            <li>Create anchors for examples, visuals, and practice</li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How Importance Is Determined</h4>
          <ul className="quickstart-list">
            <li>
              <strong>Frequency:</strong> Concepts that occur throughout the
              document
            </li>
            <li>
              <strong>Context:</strong> Appearances in definitions, headings, or
              assessment items
            </li>
            <li>
              <strong>Relationships:</strong> The number and strength of
              connections to other concepts
            </li>
            <li>
              <strong>Patterns:</strong> Participation in learning patterns and
              pedagogical structures
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Domain-Specific Metadata</h4>
          <p>
            Specialized domains include extra tagging to help authors tune the
            level of rigor and support:
          </p>
          <ul className="quickstart-list">
            <li>Reaction types or mechanisms</li>
            <li>Physical states or classifications (solid, liquid, gas)</li>
            <li>Compound categories such as acid, base, or salt</li>
            <li>Difficulty ratings for scaffolding</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function RelationshipsSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Concept Relationships</h4>
          <p>
            This view maps how concepts connect to each other, revealing the
            knowledge structure of the chapter and exposing prerequisite chains,
            conceptual clusters, and contrasting ideas.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Relationship Types</h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {conceptRelationshipTypes.map((type) => (
              <div
                key={type.name}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  backgroundColor: "#fef5e7",
                }}
              >
                <strong>{type.name}</strong>
                <p style={{ margin: "0.35rem 0" }}>
                  <strong>Meaning:</strong> {type.meaning}
                </p>
                <p style={{ margin: "0.35rem 0" }}>
                  <strong>Example:</strong> {type.example}
                </p>
                <p style={{ margin: "0.35rem 0" }}>
                  <strong>Why it matters:</strong> {type.importance}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Strong Relationships Indicate</h4>
          <ul className="quickstart-list">
            <li>Well-integrated content with clear conceptual connections</li>
            <li>Logical progressions that build prerequisite knowledge</li>
            <li>Dense networks that support schema building</li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Weak Relationships Indicate</h4>
          <ul className="quickstart-list">
            <li>Isolated concepts that may confuse learners</li>
            <li>Missing prerequisite explanations or bridges</li>
            <li>Opportunities to add comparisons, contrasts, or examples</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function PatternsSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Pattern Recognition Overview</h4>
          <p>
            Pattern detection highlights instructional structures that make
            content easier to process, remember, and apply. Results are grouped
            into universal patterns that appear across disciplines and
            domain-specific patterns tailored for chemistry.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Universal Patterns</h4>
          <ul className="quickstart-list">
            {universalPatterns.map((pattern) => (
              <li key={pattern.name}>
                <strong>{pattern.name}:</strong> {pattern.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Chemistry-Specific Patterns</h4>
          <ul className="quickstart-list">
            {chemistryPatterns.map((pattern) => (
              <li key={pattern.name}>
                <strong>{pattern.name}:</strong> {pattern.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Why Patterns Matter</h4>
          <ul className="quickstart-list">
            <li>Provide structure and predictability for learners</li>
            <li>Support schema development and transfer</li>
            <li>Reduce cognitive load by signaling important moves</li>
            <li>
              Reveal opportunities to add examples, contrasts, or practice
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function PrinciplesSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Learning Principles Overview</h4>
          <p>
            The analysis scores ten evidence-based learning principles from 0 to
            100 based on the presence, quality, and depth of each instructional
            move in the chapter.
          </p>
        </section>

        {principlesData.map((principle) => (
          <section
            key={principle.name}
            className="quickstart-card"
            style={{ borderRadius: "1rem" }}
          >
            <h4>{principle.name}</h4>
            <p style={{ fontStyle: "italic", color: "#4b5563" }}>
              {principle.definition}
            </p>
            <p>
              <strong>Why it matters:</strong> {principle.why}
            </p>
            <p>
              <strong>What's evaluated:</strong>
            </p>
            <ul className="quickstart-list">
              {principle.evaluated.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              <strong>Score ranges:</strong>
            </p>
            <ul className="quickstart-list">
              <li>
                <strong>80-100:</strong> {principle.ranges.high}
              </li>
              <li>
                <strong>50-79:</strong> {principle.ranges.medium}
              </li>
              <li>
                <strong>0-49:</strong> {principle.ranges.low}
              </li>
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function RecommendationsSection() {
  return (
    <div className="quickstart-shell">
      <div className="quickstart-content">
        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Recommendation Overview</h4>
          <p>
            Recommendations translate analysis findings into specific,
            actionable steps for improving learning effectiveness. Each
            suggestion ties back to one or more learning principles.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Recommendation Priorities</h4>
          <ul className="quickstart-list">
            <li>
              <strong>High priority:</strong> Critical improvements when a
              principle scores below 50
            </li>
            <li>
              <strong>Medium priority:</strong> Meaningful enhancements for
              scores between 50 and 79
            </li>
            <li>
              <strong>Low priority:</strong> Fine-tuning opportunities when
              principles score 80-89
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Types of Recommendations</h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {recommendationTypes.map((type) => (
              <div
                key={type.title}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: "0.75rem",
                  padding: "0.85rem",
                  backgroundColor: "#fef5e7",
                }}
              >
                <h5 style={{ margin: 0 }}>{type.title}</h5>
                <p style={{ margin: "0.5rem 0" }}>{type.description}</p>
                <ul className="quickstart-list">
                  {type.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How to Use Recommendations</h4>
          <ol className="quickstart-order">
            <li>
              Start with the highest-priority items to address critical gaps
            </li>
            <li>
              Adapt suggestions to your teaching context and student needs
            </li>
            <li>Implement in manageable increments to track impact</li>
            <li>Re-run the analysis after changes to confirm improvements</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

// Section data helpers
const conceptRelationshipTypes = [
  {
    name: "Prerequisites (requires)",
    meaning: "Concept A must be understood before Concept B",
    example: "Atomic structure -> chemical bonding",
    importance: "Shows the logical learning sequence and reveals gaps",
  },
  {
    name: "Related (relates-to)",
    meaning: "Concepts share features or frequently appear together",
    example: "Acids and bases appear together for comparisons",
    importance: "Identifies conceptual clusters that support schema building",
  },
  {
    name: "Examples (example-of)",
    meaning: "Concrete instances of abstract ideas",
    example: "HCl is an example of an acid",
    importance: "Connects abstract ideas to tangible representations",
  },
  {
    name: "Contrasts (contrasts-with)",
    meaning: "Concepts are compared or contrasted",
    example: "Ionic bonds versus covalent bonds",
    importance: "Highlights distinctions that clarify nuanced differences",
  },
];

const universalPatterns = [
  {
    name: "Definition-Example",
    description:
      "Concept introduced formally and reinforced with concrete examples",
  },
  {
    name: "Compare-Contrast",
    description:
      "Multiple concepts juxtaposed to emphasize similarities and differences",
  },
  {
    name: "Problem-Solution",
    description:
      "A problem is posed and solved step-by-step to model reasoning",
  },
  {
    name: "Elaboration",
    description: "Concepts explained in increasing depth with layered details",
  },
];

const chemistryPatterns = [
  {
    name: "Reaction Mechanism",
    description: "Step-by-step breakdown of chemical reactions with equations",
  },
  {
    name: "Lab Procedure",
    description:
      "Experimental methods that include safety, materials, and observations",
  },
  {
    name: "Stoichiometry Problem",
    description:
      "Quantitative calculations showing balanced units and reasoning",
  },
];

const recommendationTypes = [
  {
    title: "Content Additions",
    description:
      "Prompt authors to add missing elements that reinforce learning",
    items: [
      "Practice questions for retrieval",
      "Visual diagrams for dual coding",
      "Worked examples for problem solving",
      "Review sections for spaced repetition",
    ],
  },
  {
    title: "Structural Changes",
    description: "Suggest reorganizing material to improve flow and spacing",
    items: [
      "Interleaving related concepts",
      "Adding prerequisite explanations",
      "Breaking down complex ideas",
      "Creating concept maps",
    ],
  },
  {
    title: "Pedagogical Techniques",
    description: "Encourage instructional strategies that deepen processing",
    items: [
      "Prompts for self-explanation",
      "Elaboration questions",
      "Comparative analysis activities",
      "Generative exercises",
    ],
  },
];

// Principles data
const principlesData = [
  {
    name: "1. Deep Processing",
    definition:
      "Engaging with material at a meaningful level through analysis, synthesis, and critical thinking",
    why: "Surface-level reading leads to poor retention. Deep processing creates stronger, more durable memories",
    evaluated: [
      "Questions requiring analysis/synthesis",
      "Critical thinking prompts",
      "Application to new contexts",
      "Conceptual explanations beyond facts",
    ],
    ranges: {
      high: "Excellent deep processing opportunities throughout",
      medium: "Some deep processing, could be enhanced",
      low: "Primarily surface-level content, needs depth",
    },
  },
  {
    name: "2. Dual Coding",
    definition:
      "Combining verbal and visual information to create multiple memory pathways",
    why: "Visual + verbal encoding creates redundant memory traces, improving recall",
    evaluated: [
      "Presence of diagrams, charts, illustrations",
      "Visual representations of abstract concepts",
      "Integration of text and images",
      "Spatial arrangements that aid understanding",
    ],
    ranges: {
      high: "Rich multimodal content throughout",
      medium: "Some visuals, could use more integration",
      low: "Text-heavy, needs visual support",
    },
  },
  {
    name: "3. Retrieval Practice",
    definition: "Testing yourself to strengthen memory through active recall",
    why: "Testing effect - recalling information is more powerful than re-reading",
    evaluated: [
      "Practice questions and exercises",
      "Self-assessment opportunities",
      "Prompts to recall prior learning",
      "Variety of question types",
    ],
    ranges: {
      high: "Abundant retrieval opportunities",
      medium: "Some practice, could expand",
      low: "Minimal testing/practice",
    },
  },
  {
    name: "4. Spaced Repetition",
    definition: "Reviewing material at increasing intervals over time",
    why: "Distributed practice leads to better long-term retention than cramming",
    evaluated: [
      "Built-in review sections",
      "Callbacks to earlier concepts",
      "Cumulative exercises",
      "Suggestions for future review",
    ],
    ranges: {
      high: "Clear spaced review structure",
      medium: "Some review, could be more systematic",
      low: "Limited review opportunities",
    },
  },
  {
    name: "5. Interleaving",
    definition:
      "Mixing different types of problems or concepts rather than blocking them",
    why: "Strengthens discrimination between concepts and improves transfer",
    evaluated: [
      "Mixed practice problems",
      "Alternating between related concepts",
      "Varied question formats",
      "Cross-concept integration",
    ],
    ranges: {
      high: "Well-interleaved content and practice",
      medium: "Some mixing, mostly blocked",
      low: "Heavily blocked organization",
    },
  },
  {
    name: "6. Elaboration",
    definition:
      "Explaining and describing ideas with many details and connections",
    why: "Rich elaboration creates more retrieval cues and deeper understanding",
    evaluated: [
      "Detailed explanations",
      "Multiple examples per concept",
      "Connections to prior knowledge",
      "Real-world applications",
    ],
    ranges: {
      high: "Thorough elaboration throughout",
      medium: "Adequate detail, could expand",
      low: "Sparse, superficial treatment",
    },
  },
  {
    name: "7. Worked Examples",
    definition: "Step-by-step demonstrations of problem-solving procedures",
    why: "Reduces cognitive load and provides clear procedural models",
    evaluated: [
      "Presence of worked examples",
      "Step-by-step solutions",
      "Explanations of reasoning",
      "Gradual fading to independence",
    ],
    ranges: {
      high: "Comprehensive worked examples",
      medium: "Some examples, could be more detailed",
      low: "Few or no worked examples",
    },
  },
  {
    name: "8. Self-Explanation",
    definition: "Prompting learners to explain concepts to themselves",
    why: "Reveals gaps in understanding and promotes active sense-making",
    evaluated: [
      "Prompts to explain reasoning",
      "'Why' and 'How' questions",
      "Opportunities to justify answers",
      "Reflection activities",
    ],
    ranges: {
      high: "Frequent self-explanation prompts",
      medium: "Some prompts, could be more frequent",
      low: "Rare self-explanation opportunities",
    },
  },
  {
    name: "9. Generative Learning",
    definition: "Creating new content or products from learned material",
    why: "Active generation leads to deeper processing and better transfer",
    evaluated: [
      "Creative application tasks",
      "Synthesis activities",
      "Open-ended questions",
      "Project-based learning",
    ],
    ranges: {
      high: "Strong emphasis on generation",
      medium: "Some generative activities",
      low: "Mostly receptive learning",
    },
  },
  {
    name: "10. Schema Building",
    definition: "Organizing knowledge into coherent mental structures",
    why: "Schemas facilitate expert-like thinking and efficient retrieval",
    evaluated: [
      "Explicit organization and structure",
      "Concept maps or frameworks",
      "Hierarchical relationships",
      "Integration of new with existing knowledge",
    ],
    ranges: {
      high: "Clear schema development",
      medium: "Some structure, could be clearer",
      low: "Disconnected information",
    },
  },
];
