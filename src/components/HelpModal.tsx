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
    concepts: "Characters & Elements",
    relationships: "Story Relationships",
    patterns: "Pattern Recognition",
    principles: "Fiction Elements",
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
              Quill Pilot
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
            <strong>Designed for Full Manuscript Analysis</strong>
          </p>
          <p>Quill Pilot can handle complete novels and long manuscripts:</p>
          <ul className="quickstart-list">
            <li>
              <strong>Tested up to 200 MB</strong> - Approximately 800-1,200
              pages
            </li>
            <li>
              A typical <strong>80,000-word novel manuscript</strong> (300-350
              pages) is usually 1-5 MB as plain text
            </li>
            <li>
              Comfortably handles even <strong>epic fantasy novels</strong>,
              multi-book series, or complete story compilations
            </li>
          </ul>
          <p>
            <strong>Supported formats:</strong> <code>.docx</code>,{" "}
            <code>.txt</code>, and <code>.obt</code>
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How to Use Quill Pilot</h4>
          <ol className="quickstart-order">
            <li>
              <span className="quickstart-step-title">
                Upload or Paste Your Manuscript
              </span>
              <ul className="quickstart-sublist">
                <li>
                  Click "Upload Document" to select a file from your computer
                </li>
                <li>Or paste text directly into the Writer Mode editor</li>
                <li>Supports .docx, .txt, and .obt formats</li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">
                Select Genre (Optional)
              </span>
              <ul className="quickstart-sublist">
                <li>
                  Choose your story genre: Fantasy, Romance, Mystery, Thriller,
                  Science Fiction, Literary Fiction, etc.
                </li>
                <li>Or use "Auto-detect" for automatic genre identification</li>
                <li>
                  <strong>Premium/Pro users:</strong> Create custom genre
                  profiles with specific trope expectations
                </li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">Analyze Manuscript</span>
              <ul className="quickstart-sublist">
                <li>Click the "Analyze" button</li>
                <li>Processing may take 10-30 seconds for full novels</li>
                <li>Web workers prevent UI freezing during analysis</li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">Review Results</span>
              <ul className="quickstart-sublist">
                <li>Overall score shows writing quality and craft (0-100)</li>
                <li>
                  30+ fiction elements scored individually (pacing, dialogue,
                  POV, etc.)
                </li>
                <li>Actionable recommendations for strengthening your story</li>
                <li>
                  Character arcs, emotional pacing, and scene structure
                  visualizations
                </li>
              </ul>
            </li>
            <li>
              <span className="quickstart-step-title">Edit and Improve</span>
              <ul className="quickstart-sublist">
                <li>
                  <strong>Writer Mode:</strong> Edit directly in the integrated
                  editor
                </li>
                <li>
                  Use inline analysis indicators to identify issues in real-time
                </li>
                <li>Export results as HTML, DOCX, or manuscript format</li>
                <li>Compare before/after analyses to track improvements</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Tips for Best Results</h4>
          <ul className="quickstart-list">
            <li>
              <strong>Complete Scenes/Chapters:</strong> Upload full chapters
              rather than fragments for accurate pacing and character arc
              analysis
            </li>
            <li>
              <strong>Genre Selection:</strong> Choose the correct genre for
              more accurate trope detection and convention analysis
            </li>
            <li>
              <strong>Context Matters:</strong> Prologue, middle chapters, and
              climax have different expected patterns
            </li>
            <li>
              <strong>Iterative Revision:</strong> Re-analyze after making
              improvements to track your progress and validate changes
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Gets Analyzed</h4>
          <ul className="quickstart-list">
            <li>
              <strong>30+ Fiction Elements:</strong> Show vs Tell, pacing,
              dialogue, POV consistency, character development, theme depth, and
              more
            </li>
            <li>
              <strong>Character Analysis:</strong> Character arcs, emotional
              journeys, development patterns, and role consistency
            </li>
            <li>
              <strong>Story Structure:</strong> Scene/sequel balance, conflict
              tracking, tension curves, and emotional pacing
            </li>
            <li>
              <strong>Writing Craft:</strong> Prose style, word choice, sentence
              variety, active voice, adverb usage, readability, and filtering
              words
            </li>
            <li>
              <strong>Genre Conventions:</strong> Trope adherence,
              genre-specific expectations, and reader satisfaction patterns
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
            each metric means, and how to interpret the findings when revising
            and strengthening your fiction manuscript.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Gets Analyzed</h4>
          <ul className="quickstart-list">
            <li>
              <strong>Writing Craft:</strong> 30+ fiction elements including
              pacing, dialogue, POV, show vs tell, and prose style
            </li>
            <li>
              <strong>Characters:</strong> Character development, emotional
              arcs, role consistency, and reader engagement
            </li>
            <li>
              <strong>Story Structure:</strong> Scene/sequel patterns, conflict
              escalation, tension curves, and narrative rhythm
            </li>
            <li>
              <strong>Genre & Style:</strong> Genre convention adherence, trope
              usage, tone consistency, and reader expectations
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How to Use This Guide</h4>
          <p>Use the sidebar navigation to quickly jump to details on:</p>
          <ul className="quickstart-list">
            <li>Interpreting each score and understanding the scale</li>
            <li>How fiction metrics are calculated and weighted</li>
            <li>Common findings and what they signal about your manuscript</li>
            <li>Recommended actions for strengthening story craft</li>
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
            The overall score is a weighted average of 30+ fiction elements,
            producing a single quality metric for your manuscript. It reflects
            both the presence and strength of essential storytelling craft
            elements.
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
                  level: "Publication Ready",
                  interpretation:
                    "Professional-level craft with strong storytelling",
                },
                {
                  range: "80-89",
                  level: "Strong Draft",
                  interpretation:
                    "Solid foundation with minor refinements needed",
                },
                {
                  range: "70-79",
                  level: "Good Progress",
                  interpretation:
                    "Core story works but needs revision in key areas",
                },
                {
                  range: "60-69",
                  level: "Needs Work",
                  interpretation: "Multiple craft elements require attention",
                },
                {
                  range: "Below 60",
                  level: "Early Draft",
                  interpretation: "Foundational storytelling issues to address",
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
          <h4>Character & Element Analysis Overview</h4>
          <p>
            The analysis identifies major characters, key story elements,
            themes, and narrative devices that are essential to your story. Core
            characters and recurring elements appear to help you track
            consistency and development throughout your manuscript.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Major Character Tracking</h4>
          <p>
            Major characters are tracked throughout the story - protagonists,
            antagonists, and significant supporting cast members.
          </p>
          <ul className="quickstart-list">
            <li>Track character presence and development across chapters</li>
            <li>Monitor emotional arcs and character growth patterns</li>
            <li>Identify inconsistencies in characterization or voice</li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>How Importance Is Determined</h4>
          <ul className="quickstart-list">
            <li>
              <strong>Frequency:</strong> Characters and elements that appear
              throughout the manuscript
            </li>
            <li>
              <strong>Context:</strong> Appearances in key scenes, dialogue,
              action sequences, or emotional moments
            </li>
            <li>
              <strong>Relationships:</strong> The number and strength of
              connections to other characters and plot threads
            </li>
            <li>
              <strong>Story Role:</strong> Participation in conflict, character
              arcs, and narrative structure
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Genre-Specific Analysis</h4>
          <p>
            Different genres include specialized tracking to help authors meet
            reader expectations:
          </p>
          <ul className="quickstart-list">
            <li>
              Romance: Emotional beats, relationship development, trope
              adherence
            </li>
            <li>
              Mystery/Thriller: Clue placement, red herrings, tension escalation
            </li>
            <li>
              Fantasy: Worldbuilding consistency, magic system rules, lore
              tracking
            </li>
            <li>Literary: Theme depth, symbolism, prose sophistication</li>
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
          <h4>Story Relationships</h4>
          <p>
            This view maps how characters, plot threads, themes, and story
            elements connect throughout your manuscript. It reveals the
            narrative structure, character relationships, thematic connections,
            and plot dependencies.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Relationship Types</h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {storyRelationshipTypes.map((type) => (
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
            <li>Well-integrated plot threads with clear connections</li>
            <li>Character relationships that drive conflict and growth</li>
            <li>Thematic consistency throughout the narrative</li>
            <li>Satisfying payoffs for established setups</li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>What Weak Relationships Indicate</h4>
          <ul className="quickstart-list">
            <li>Isolated plot threads that may confuse readers</li>
            <li>Missing character motivations or relationship development</li>
            <li>Opportunities to strengthen thematic resonance</li>
            <li>Dropped subplots or unresolved story elements</li>
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
            Pattern detection highlights storytelling structures and narrative
            devices that make fiction more engaging, emotionally resonant, and
            satisfying to read. Results are grouped into universal fiction
            patterns that appear across all genres and genre-specific patterns
            tailored to your story type.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Universal Fiction Patterns</h4>
          <ul className="quickstart-list">
            {universalFictionPatterns.map((pattern) => (
              <li key={pattern.name}>
                <strong>{pattern.name}:</strong> {pattern.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Genre-Specific Patterns</h4>
          <p>Examples of patterns analyzed based on your genre selection:</p>
          <ul className="quickstart-list">
            {genreSpecificPatterns.map((pattern) => (
              <li key={pattern.name}>
                <strong>{pattern.name}:</strong> {pattern.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Why Patterns Matter</h4>
          <ul className="quickstart-list">
            <li>Provide structure and rhythm that meets reader expectations</li>
            <li>Support character development and emotional engagement</li>
            <li>Create narrative momentum and pacing variation</li>
            <li>Reveal opportunities to strengthen story beats and payoffs</li>
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
          <h4>Fiction Elements Overview</h4>
          <p>
            Quill Pilot analyzes 30+ fiction craft elements, scoring each from 0
            to 100 based on presence, quality, and effectiveness in your
            manuscript. Below are the most critical elements that significantly
            impact reader engagement and story quality.
          </p>
        </section>

        {fictionElementsData.map((element) => (
          <section
            key={element.name}
            className="quickstart-card"
            style={{ borderRadius: "1rem" }}
          >
            <h4>{element.name}</h4>
            <p style={{ fontStyle: "italic", color: "#4b5563" }}>
              {element.definition}
            </p>
            <p>
              <strong>Why it matters:</strong> {element.why}
            </p>
            <p>
              <strong>What's evaluated:</strong>
            </p>
            <ul className="quickstart-list">
              {element.evaluated.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              <strong>Score ranges:</strong>
            </p>
            <ul className="quickstart-list">
              <li>
                <strong>80-100:</strong> {element.ranges.high}
              </li>
              <li>
                <strong>50-79:</strong> {element.ranges.medium}
              </li>
              <li>
                <strong>0-49:</strong> {element.ranges.low}
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
            actionable steps for improving your manuscript's craft and
            storytelling effectiveness. Each suggestion ties back to one or more
            fiction elements and reader engagement principles.
          </p>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Recommendation Priorities</h4>
          <ul className="quickstart-list">
            <li>
              <strong>High priority:</strong> Critical craft issues when an
              element scores below 50 (affects reader engagement)
            </li>
            <li>
              <strong>Medium priority:</strong> Meaningful improvements for
              scores between 50 and 79 (strengthen storytelling)
            </li>
            <li>
              <strong>Low priority:</strong> Polish opportunities when elements
              score 80-89 (publication-level refinement)
            </li>
          </ul>
        </section>

        <section className="quickstart-card" style={{ borderRadius: "1rem" }}>
          <h4>Types of Recommendations</h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {fictionRecommendationTypes.map((type) => (
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
              Start with high-priority items to address critical craft
              weaknesses
            </li>
            <li>
              Focus on one or two elements per revision pass for manageable
              progress
            </li>
            <li>Use Writer Mode's inline analysis to see issues in context</li>
            <li>
              Re-analyze after revisions to track improvements and validate
              changes
            </li>
            <li>Balance technical fixes with preserving your unique voice</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

// Section data helpers
const storyRelationshipTypes = [
  {
    name: "Character Relationships",
    meaning:
      "How characters connect emotionally, socially, or through conflict",
    example: "Protagonist and mentor, rivals, love interests, family bonds",
    importance: "Drives character development and creates emotional stakes",
  },
  {
    name: "Plot Dependencies",
    meaning: "Story events that must occur in a specific sequence",
    example: "Setup in Act 1 must payoff in Act 3, clues lead to revelations",
    importance: "Creates narrative causality and satisfying story logic",
  },
  {
    name: "Thematic Connections",
    meaning: "How themes echo and reinforce throughout the story",
    example: "Redemption theme appears in multiple character arcs and subplots",
    importance: "Provides depth and resonance beyond plot events",
  },
  {
    name: "Symbolic Links",
    meaning:
      "Recurring symbols, motifs, or imagery that connect story elements",
    example:
      "A broken compass symbolizing lost direction appears at key moments",
    importance: "Creates layers of meaning and emotional cohesion",
  },
];

const universalFictionPatterns = [
  {
    name: "Scene-Sequel Structure",
    description:
      "Action scenes followed by reflection/reaction sequences that deepen character response",
  },
  {
    name: "Setup-Payoff",
    description:
      "Elements introduced early that deliver emotional or plot payoffs later",
  },
  {
    name: "Rising Tension",
    description:
      "Escalating stakes and conflict intensity as the story progresses",
  },
  {
    name: "Character Arc Beats",
    description:
      "Character transformation shown through consistent developmental moments",
  },
  {
    name: "Dialogue-Action-Reflection",
    description: "Balanced rhythm between talking, doing, and internalizing",
  },
];

const genreSpecificPatterns = [
  {
    name: "Romance: Emotional Beats",
    description:
      "Meeting, attraction, obstacle, dark moment, resolution structure",
  },
  {
    name: "Mystery: Clue Placement",
    description:
      "Strategic revelation of information to maintain suspense and fairness",
  },
  {
    name: "Fantasy: Worldbuilding Layers",
    description:
      "Gradual revelation of magic systems, history, and cultural rules",
  },
  {
    name: "Thriller: Escalating Danger",
    description:
      "Ticking clocks, narrowing options, increasing personal stakes",
  },
];

const fictionRecommendationTypes = [
  {
    title: "Show Don't Tell",
    description:
      "Transform exposition into vivid scenes with sensory details and action",
    items: [
      "Replace emotional telling with physical reactions and dialogue",
      "Add sensory details (sight, sound, smell, touch, taste)",
      "Show character traits through actions rather than description",
      "Use specific concrete details instead of abstract statements",
    ],
  },
  {
    title: "Pacing & Structure",
    description: "Adjust narrative rhythm to maintain reader engagement",
    items: [
      "Vary sentence length to control pacing",
      "Balance action scenes with quieter character moments",
      "Cut unnecessary backstory that slows momentum",
      "Add scene breaks or white space for natural pauses",
    ],
  },
  {
    title: "Character Development",
    description: "Deepen character arcs and make protagonists more engaging",
    items: [
      "Give characters clear internal and external goals",
      "Show character change through contrasting behaviors",
      "Add character-specific voice patterns in dialogue",
      "Develop meaningful relationships and conflicts",
    ],
  },
  {
    title: "Dialogue Quality",
    description: "Make dialogue natural, purposeful, and character-revealing",
    items: [
      "Remove unnecessary dialogue tags (said is sufficient)",
      "Ensure each character has distinct speech patterns",
      "Use subtext - characters don't always say what they mean",
      "Cut small talk that doesn't advance plot or character",
    ],
  },
];

// Fiction Elements data
const fictionElementsData = [
  {
    name: "1. Show vs Tell",
    definition:
      "Revealing story through action, dialogue, and sensory details rather than exposition",
    why: "Showing creates immersive experiences; telling distances readers from the story",
    evaluated: [
      "Ratio of action/dialogue to exposition",
      "Use of sensory details (sight, sound, smell, touch, taste)",
      "Physical reactions instead of emotional labels",
      "Character actions revealing personality",
    ],
    ranges: {
      high: "Vivid, immersive scenes with strong sensory grounding",
      medium: "Mix of showing and telling, could be more immersive",
      low: "Heavy exposition, lacking sensory engagement",
    },
  },
  {
    name: "2. Pacing & Flow",
    definition:
      "The rhythm and speed at which the story unfolds, controlling reader engagement",
    why: "Varied pacing maintains interest; monotonous rhythm causes reader fatigue",
    evaluated: [
      "Sentence length variation",
      "Balance of action vs. reflection scenes",
      "Chapter/scene length distribution",
      "Tension escalation patterns",
    ],
    ranges: {
      high: "Dynamic pacing with strategic rhythm changes",
      medium: "Generally good flow with some slow spots",
      low: "Monotonous or inconsistent pacing",
    },
  },
  {
    name: "3. Character Development",
    definition:
      "Growth, change, and complexity in characters throughout the story",
    why: "Readers connect with characters who feel real and evolve meaningfully",
    evaluated: [
      "Character arc presence and clarity",
      "Internal and external goals",
      "Consistent but evolving behavior patterns",
      "Meaningful relationships and conflicts",
    ],
    ranges: {
      high: "Rich, layered characters with clear arcs",
      medium: "Decent development, some depth lacking",
      low: "Flat or inconsistent characterization",
    },
  },
  {
    name: "4. Dialogue Quality",
    definition:
      "Natural, purposeful conversation that reveals character and advances plot",
    why: "Good dialogue feels authentic while serving multiple story functions",
    evaluated: [
      "Distinct character voices",
      "Subtext and tension in conversations",
      "Minimal dialogue tags (overuse of adverbs)",
      "Balance of dialogue vs. narrative",
    ],
    ranges: {
      high: "Natural, character-specific dialogue with purpose",
      medium: "Functional dialogue, could be more distinctive",
      low: "Stilted or indistinguishable character voices",
    },
  },
  {
    name: "5. POV Consistency",
    definition:
      "Maintaining clear and consistent point of view throughout scenes",
    why: "POV shifts confuse readers and break immersion",
    evaluated: [
      "Head-hopping frequency",
      "Filter word usage (saw, heard, felt, thought)",
      "Appropriate access to character thoughts",
      "Clear scene POV ownership",
    ],
    ranges: {
      high: "Clean, consistent POV with clear transitions",
      medium: "Mostly consistent with occasional slips",
      low: "Frequent head-hopping or unclear POV",
    },
  },
  {
    name: "6. Conflict & Tension",
    definition:
      "Obstacles, stakes, and opposition that drive the narrative forward",
    why: "Conflict creates investment; without it, stories feel aimless",
    evaluated: [
      "Conflict presence in scenes",
      "Stakes clarity and escalation",
      "Internal and external opposition",
      "Tension maintenance between action beats",
    ],
    ranges: {
      high: "Strong, escalating conflict throughout",
      medium: "Adequate conflict, could intensify",
      low: "Minimal conflict or unclear stakes",
    },
  },
];
