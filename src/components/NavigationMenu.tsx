import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onOpenReferenceLibrary: () => void;
  onOpenWritersReference: () => void;
  onOpenQuickStart: () => void;
}

/**
 * NavigationMenu Component - Modern sliding navigation with feature showcase
 *
 * Features:
 * - Slide-in animation from left
 * - Expandable feature sections
 * - Links to documentation and help
 * - Feature highlights with icons
 * - Smooth transitions and modern design
 */
export function NavigationMenu({
  isOpen,
  onClose,
  onOpenHelp,
  onOpenReferenceLibrary,
  onOpenWritersReference,
  onOpenQuickStart,
}: NavigationMenuProps): JSX.Element | null {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={onClose}
      />

      {/* Navigation Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          zIndex: 1000,
          overflowY: "auto",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.15)",
          animation: "slideInLeft 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            background: "#f7e6d0",
            color: "#2c3e50",
            borderBottom: "2px solid #ef8432",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AnimatedLogo size={96} animate={true} />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                }}
              >
                Quill Pilot
              </h2>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.875rem",
                  opacity: 1,
                  color: "#2c3e50",
                }}
              >
                AI-Powered Writing and Analysis
              </p>
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  fontSize: "0.75rem",
                  opacity: 0.9,
                  color: "#2c3e50",
                  lineHeight: "1.3",
                }}
              >
                17 Writing Tools • Story Analysis • Genre Intelligence • Writer
                Productivity
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#fef5e7",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <button
              onClick={() => {
                onOpenQuickStart();
                onClose();
              }}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "white",
                color: "#2c3e50",
                border: "2px solid #ef8432",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition:
                  "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>📚</span>
              <span>Quick Start Guide</span>
            </button>

            <button
              onClick={() => {
                onOpenReferenceLibrary();
                onClose();
              }}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                backgroundColor: "white",
                color: "#2c3e50",
                border: "2px solid #ef8432",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition:
                  "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>📖</span>
              <span>Reference Library</span>
            </button>

            <button
              onClick={() => {
                onOpenWritersReference();
                onClose();
              }}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                backgroundColor: "white",
                color: "#2c3e50",
                border: "2px solid #ef8432",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition:
                  "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>✍️</span>
              <span>Writer's Reference</span>
            </button>

            <button
              onClick={() => {
                window.open(
                  "https://github.com/londailey6937/QuillPilot/issues",
                  "_blank"
                );
                onClose();
              }}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                backgroundColor: "white",
                color: "#2c3e50",
                border: "2px solid #dc2626",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition:
                  "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fee2e2";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>🐛</span>
              <span>Report Bug</span>
            </button>
          </div>
        </div>

        {/* Use Cases Highlight */}
        <div
          style={{
            padding: "1.5rem",
            background: "#fef5e7",
            borderTop: "1px solid #ef8432",
            borderBottom: "1px solid #ef8432",
          }}
        >
          <h3
            style={{
              margin: "0 0 0.75rem 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            🌟 Perfect For
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>✍️</span>
              <span>
                <strong>Fiction Writers</strong> - Novels, Short Stories,
                Novellas
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📚</span>
              <span>
                <strong>Genre Fiction</strong> - Romance, Thriller, Fantasy,
                Sci-Fi, Mystery
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🎭</span>
              <span>
                <strong>Literary Fiction</strong> - Character-driven narratives
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🔮</span>
              <span>
                <strong>Speculative Fiction</strong> - Fantasy, Horror,
                Metaphysical
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🤠</span>
              <span>
                <strong>Western & Historical</strong> - Period fiction, Western
                adventures
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📖</span>
              <span>
                <strong>Manuscript Editing</strong> - Developmental editing,
                self-editing
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🎬</span>
              <span>
                <strong>Screenwriters</strong> - Film & TV scripts with industry
                formatting
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🪶</span>
              <span>
                <strong>Poetry Writers</strong> - Verse, sonnets, free-form
                poetry
              </span>
            </div>
          </div>
          <p
            style={{
              margin: "0.75rem 0 0 0",
              fontSize: "0.75rem",
              color: "#6b7280",
              fontStyle: "italic",
            }}
          >
            Analyze any fiction manuscript across all genres
          </p>
        </div>

        {/* Features Section */}
        <div style={{ padding: "1.5rem", backgroundColor: "#fef5e7" }}>
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Features
          </h3>

          {/* Core Analysis */}
          <FeatureSection
            title="Core Analysis"
            icon="🎯"
            isExpanded={expandedSection === "core"}
            onToggle={() => toggleSection("core")}
            features={[
              {
                icon: "📖",
                title: "12 Fiction Elements",
                desc: "Characters, Setting, Plot, Theme, Voice, and more",
              },
              {
                icon: "🎯",
                title: "Craft Scoring",
                desc: "0-100 quality metrics for each element",
              },
              {
                icon: "💡",
                title: "Actionable Insights",
                desc: "Priority-ranked improvement recommendations",
              },
              {
                icon: "📈",
                title: "On-Demand Analysis",
                desc: "Comprehensive analysis when you're ready",
              },
            ]}
          />

          {/* Genre Intelligence */}
          <FeatureSection
            title="Genre Intelligence"
            icon="🎭"
            isExpanded={expandedSection === "domain"}
            onToggle={() => toggleSection("domain")}
            badge="NEW!"
            features={[
              {
                icon: "💝",
                title: "Romance Tropes",
                desc: "Enemies-to-lovers, forced proximity, slow burn",
              },
              {
                icon: "⚔️",
                title: "Fantasy Elements",
                desc: "Magic systems, worldbuilding, prophecies",
              },
              {
                icon: "🔪",
                title: "Thriller Beats",
                desc: "Tension, pacing, red herrings, reveals",
              },
              {
                icon: "🔍",
                title: "Mystery Structure",
                desc: "Clues, suspects, misdirection analysis",
              },
              {
                icon: "🚀",
                title: "Sci-Fi Concepts",
                desc: "Technology, future worlds, speculation",
              },
              {
                icon: "👻",
                title: "Horror Techniques",
                desc: "Atmosphere, dread, supernatural elements",
              },
            ]}
          />

          {/* Story Patterns */}
          <FeatureSection
            title="Story Patterns"
            icon="🎨"
            isExpanded={expandedSection === "patterns"}
            onToggle={() => toggleSection("patterns")}
            features={[
              {
                icon: "👁️",
                title: "Sensory Detail Density",
                desc: "Tracks 540+ sensory words across 5 senses",
              },
              {
                icon: "💬",
                title: "Dialogue Balance",
                desc: "Conversation vs narrative ratio",
              },
              {
                icon: "⚡",
                title: "Pacing Analysis",
                desc: "Scene rhythm and momentum tracking",
              },
              {
                icon: "🎪",
                title: "Emotional Beats",
                desc: "Reader engagement and impact points",
              },
            ]}
          />

          {/* Character Analysis */}
          <FeatureSection
            title="Character Analysis"
            icon="🗺️"
            isExpanded={expandedSection === "concepts"}
            onToggle={() => toggleSection("concepts")}
            features={[
              {
                icon: "👤",
                title: "Character Tracking",
                desc: "Names, appearances, development arcs",
              },
              {
                icon: "🔗",
                title: "Relationship Mapping",
                desc: "Character connections and dynamics",
              },
              {
                icon: "💭",
                title: "Voice Consistency",
                desc: "POV and narrative style analysis",
              },
              {
                icon: "🌐",
                title: "Character Network",
                desc: "Interactive character connection graphs",
              },
            ]}
          />

          {/* Visualization */}
          <FeatureSection
            title="Visualization"
            icon="🎨"
            isExpanded={expandedSection === "visual"}
            onToggle={() => toggleSection("visual")}
            features={[
              {
                icon: "",
                title: "Side-by-Side Viewer",
                desc: "View document while analyzing",
              },
              {
                icon: "📊",
                title: "Interactive Charts",
                desc: "Rich data visualizations",
              },
              {
                icon: "🎨",
                title: "Color-Coded Scores",
                desc: "Visual element performance",
              },
            ]}
          />

          {/* Data & Export */}
          <FeatureSection
            title="Export Options"
            icon="💼"
            isExpanded={expandedSection === "data"}
            onToggle={() => toggleSection("data")}
            features={[
              {
                icon: "💾",
                title: "Export Analysis",
                desc: "Save as HTML, DOCX, PDF, or JSON",
              },
              {
                icon: "📄",
                title: "Document Export",
                desc: "Export edited document with formatting",
              },
            ]}
          />

          {/* Genre-Specific Tools */}
          <FeatureSection
            title="Genre-Specific Tools"
            icon="🎭"
            isExpanded={expandedSection === "genre"}
            onToggle={() => toggleSection("genre")}
            badge="NEW!"
            features={[
              {
                icon: "🔮",
                title: "Fantasy Tropes",
                desc: "Magic systems, prophecies, chosen ones",
              },
              {
                icon: "🚀",
                title: "Sci-Fi Elements",
                desc: "Technology, world-building, first contact",
              },
              {
                icon: "💀",
                title: "Mystery Beats",
                desc: "Clues, red herrings, plot twists",
              },
              {
                icon: "💕",
                title: "Romance Arc",
                desc: "Meet-cute, conflict, emotional beats",
              },
              {
                icon: "🎯",
                title: "Thriller Pacing",
                desc: "Tension, stakes, ticking clocks",
              },
              {
                icon: "🏰",
                title: "Historical Details",
                desc: "Period accuracy, cultural context",
              },
              {
                icon: "🎬",
                title: "Screenplay Format",
                desc: "Industry formatting, scene structure",
              },
              {
                icon: "🪶",
                title: "Poetry Analysis",
                desc: "Verse, rhythm, imagery, form",
              },
            ]}
          />
        </div>

        {/* Company & Support Section */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#fef5e7",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Company & Support
          </h3>

          {/* About */}
          <MenuLink
            icon="ℹ️"
            title="About"
            desc="Learn about Quill Pilot"
            onClick={() => {
              alert(
                "About Quill Pilot:\n\nQuill Pilot is an AI-powered writing and analysis tool for fiction, nonfiction, poetry, and screenplays. Using pattern recognition and craft analysis, it evaluates 12 key fiction elements including character development, plot structure, dialogue, pacing, and more.\n\n✨ Key Features:\n• 12 Fiction Elements Analysis\n• 17 Writing & Analysis Tools\n• Genre-Specific Intelligence (Romance, Thriller, Fantasy, Poetry, etc.)\n• Craft Quality Scoring\n• Writer Mode with productivity tools\n• AI Writing Assistant\n• World-Building & Research Tools\n\nPerfect for novelists, poets, screenwriters, nonfiction writers, and storytellers of all kinds."
              );
            }}
          />

          {/* Pricing */}
          <MenuLink
            icon="💳"
            title="Pricing"
            desc="Access tiers and features"
            badge="FREE"
            onClick={() => {
              alert(
                "Access Tiers:\n\n🌟 Free Tier:\n• 2 Fiction Elements (Spacing & Show vs Tell)\n• Up to 200 pages\n• Export to PDF\n• No full analysis dashboard\n\n👑 Premium Tier:\n• Full analysis of 12 fiction elements\n• Up to 650 pages\n• Export to HTML, DOCX, PDF, JSON\n• Custom genres\n• View full analysis dashboard\n\n✨ Professional Tier:\n• Everything in Premium\n• Up to 1,000 pages\n• Writer Mode with editing tools\n• Beat Sheet Generator\n• AI Writing Assistant\n• Focus & Typewriter modes"
              );
            }}
          />

          {/* Support */}
          <MenuLink
            icon="💬"
            title="Support"
            desc="Get help with your analysis"
            onClick={() => {
              alert(
                "Support:\n\nNeed help? Here are your options:\n\n📚 Documentation:\n• Quick Start Guide - Basic workflow\n• Reference Library - All features\n• Writer's Reference - Pro writing tools\n\n💡 Tips:\n• Select a genre before analysis for best results\n• Use sidebar navigation in documentation\n• Hover over elements for tooltips\n\n💬 Community:\nShare feedback through GitHub Issues."
              );
            }}
          />

          {/* Contact */}
          <MenuLink
            icon="📧"
            title="Contact"
            desc="Reach out with questions"
            onClick={() => {
              alert(
                "Contact:\n\n💡 Feature Requests:\nSubmit feature ideas through GitHub Issues.\n\n💬 Community:\nJoin discussions and share your experience with other writers using Quill Pilot.\n\n📝 Feedback:\nWe welcome suggestions for improving Quill Pilot!"
              );
            }}
          />

          {/* Resources */}
          <MenuLink
            icon="📚"
            title="Resources"
            desc="Guides and documentation"
            onClick={() => {
              alert(
                "Resources:\n\n📖 Built-in Guides:\n• Quick Start Guide - Get started in minutes\n• Reference Library - Complete feature docs\n• Writer's Reference - Pro tier writing tools\n\n🎭 Genre Support:\n• Romance, Thriller, Mystery\n• Fantasy, Sci-Fi, Horror\n• Literary Fiction\n• Western, Historical\n• Screenplay formatting\n• Poetry analysis\n• Nonfiction & Academic writing\n\n✨ Analysis Features:\n• 12 Fiction Elements\n• Craft Quality Scoring\n• Character & Plot tracking\n• Pacing & Dialogue analysis\n• POV & Emotion tracking\n• Beat Sheet & Story Structure\n\n🛠️ Writing Tools:\n• AI Writing Assistant\n• Dialogue Enhancer\n• Readability Metrics\n• Cliché Detector\n• Character Name Generator\n• World-Building Notebook\n• Research Notes & Mood Boards"
              );
            }}
          />

          {/* Feedback */}
          <MenuLink
            icon="💡"
            title="Feedback"
            desc="Share your ideas and suggestions"
            onClick={() => {
              alert(
                "We'd love to hear from you!\n\n💡 Feature Requests:\nWhat would make Quill Pilot better for your writing workflow?\n\n⭐ Success Stories:\nTell us how Quill Pilot helped improve your manuscript!\n\n🎯 Genre Requests:\nWant analysis for a specific genre? Let us know!\n\nSubmit feedback through GitHub Issues."
              );
            }}
          />
        </div>

        {/* Legal Section */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#fef5e7",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Legal
          </h3>

          <MenuLink
            icon="📜"
            title="Terms of Service"
            desc="Usage terms and conditions"
            onClick={() => {
              alert(
                "Terms of Service:\n\n• Free tier available with full analysis features\n• Premium and Professional tiers unlock additional features\n• Analyze manuscripts across all fiction genres\n• Export and share your analysis results\n• Analysis is pattern-based, not a substitute for human editing\n• Use responsibly - respect copyright on uploaded content\n• Your manuscripts are processed locally in your browser"
              );
            }}
          />

          <MenuLink
            icon="🔒"
            title="Privacy Policy"
            desc="How we protect your data"
            onClick={() => {
              alert(
                "Privacy Policy:\n\n✅ Your data stays local - processed in your browser\n✅ No server uploads of chapter content\n✅ We don't sell your data\n✅ Minimal analytics for improvements\n✅ GDPR & CCPA compliant\n\nFull policy at:\nquillpilot.ai/privacy"
              );
            }}
          />

          <MenuLink
            icon="🍪"
            title="Cookie Policy"
            desc="How we use cookies"
            onClick={() => {
              alert(
                "Cookie Policy:\n\n🍪 Essential cookies only\n📊 Optional analytics (with consent)\n🎯 No advertising cookies\n✅ Full control over your preferences\n\nManage cookies at:\nquillpilot.ai/cookies"
              );
            }}
          />
        </div>

        {/* Coming Soon */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#fef5e7",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Coming Soon
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <ComingSoonItem
              icon="💉"
              title="More Genre Detection"
              desc="Expanded genre libraries and trope analysis"
            />
            <ComingSoonItem
              icon="🌎"
              title="Additional Genres"
              desc="Urban fantasy, paranormal, dystopian, and more"
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
            Built with ⚛️ React • TypeScript • Tailwind CSS
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "0.75rem",
              color: "#9ca3af",
            }}
          >
            Craft compelling stories with confidence
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

// Feature Section Component
interface FeatureSectionProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: string;
  features: Array<{ icon: string; title: string; desc: string }>;
}

function FeatureSection({
  title,
  icon,
  isExpanded,
  onToggle,
  badge,
  features,
}: FeatureSectionProps) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "0.875rem 1rem",
          marginBottom: "0.75rem",
          background: isExpanded ? "#f7e6d0" : "white",
          color: "#2c3e50",
          border: "2px solid #ef8432",
          borderRadius: "20px",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
          boxShadow: isExpanded
            ? "0 4px 12px rgba(0, 0, 0, 0.15)"
            : "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = "#f7e6d0";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>{icon}</span>
          <span>{title}</span>
          {badge && (
            <span
              style={{
                padding: "0.125rem 0.5rem",
                backgroundColor: "white",
                color: "white",
                fontSize: "0.625rem",
                fontWeight: "700",
                borderRadius: "9999px",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: "1rem",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            backgroundColor: "#fef5e7",
            borderRadius: "20px",
            border: "1.5px solid #ef8432",
            animation: "expandIn 0.2s ease-out",
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                padding: "0.75rem",
                marginBottom: idx < features.length - 1 ? "0.5rem" : 0,
                backgroundColor: "white",
                borderRadius: "12px",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
              }}
            >
              <span style={{ fontSize: "1.25rem", marginTop: "0.125rem" }}>
                {feature.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    marginBottom: "0.25rem",
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    lineHeight: "1.4",
                  }}
                >
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes expandIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Coming Soon Item Component
interface ComingSoonItemProps {
  icon: string;
  title: string;
  desc: string;
}

function ComingSoonItem({ icon, title, desc }: ComingSoonItemProps) {
  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        backgroundColor: "white",
        borderRadius: "20px",
        border: "2px solid #ef8432",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{ fontWeight: "600", fontSize: "0.875rem", color: "#1f2937" }}
        >
          {title}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{desc}</div>
      </div>
      <span
        style={{ fontSize: "0.625rem", color: "#9ca3af", fontWeight: "600" }}
      >
        SOON
      </span>
    </div>
  );
}

// Menu Link Component
interface MenuLinkProps {
  icon: string;
  title: string;
  desc: string;
  badge?: string;
  onClick: () => void;
}

function MenuLink({ icon, title, desc, badge, onClick }: MenuLinkProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "0.75rem 1rem",
        marginBottom: "0.5rem",
        backgroundColor: "white",
        borderRadius: "20px",
        border: "2px solid #ef8432",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f7e6d0";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "white";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <span
            style={{
              fontWeight: "600",
              fontSize: "0.875rem",
              color: "#1f2937",
            }}
          >
            {title}
          </span>
          {badge && (
            <span
              style={{
                padding: "0.125rem 0.5rem",
                backgroundColor: "white",
                color: "white",
                fontSize: "0.625rem",
                fontWeight: "700",
                borderRadius: "9999px",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{desc}</div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "#9ca3af" }}
      >
        <path d="M6 12l4-4-4-4" />
      </svg>
    </button>
  );
}
