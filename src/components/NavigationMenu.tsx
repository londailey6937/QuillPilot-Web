import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onOpenReferenceLibrary: () => void;
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
                Tome{" "}
                <span style={{ fontStyle: "italic", fontWeight: "700" }}>
                  IQ
                </span>
              </h2>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.875rem",
                  opacity: 1,
                  color: "#2c3e50",
                }}
              >
                AI-Powered Learning Content Analysis
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
                For Education • Corporate Training • Research • K-12 • Emerging
                Fields
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
                onOpenHelp();
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
                transition: "transform 0.2s, background-color 0.2s",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.backgroundColor = "#f7e6d0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.backgroundColor = "white";
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
                border: "1.5px solid #ef8432",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "background-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>📖</span>
              <span>Reference Library</span>
            </button>

            <button
              onClick={() => {
                window.open(
                  "https://github.com/londailey6937/Chapter-Analysis/issues/new",
                  "_blank"
                );
                onClose();
              }}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                backgroundColor: "white",
                color: "#2c3e50",
                border: "1.5px solid #dc2626",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "background-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fee2e2";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.transform = "translateY(0)";
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
              <span style={{ fontSize: "1.1rem" }}>🎓</span>
              <span>
                <strong>Education</strong> - Textbooks, Courses, Exam Prep
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
              <span style={{ fontSize: "1.1rem" }}>💼</span>
              <span>
                <strong>Corporate</strong> - Training, Handbooks, SOPs
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
                <strong>Documentation</strong> - APIs, Manuals, Guides
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
              <span style={{ fontSize: "1.1rem" }}>⚕️</span>
              <span>
                <strong>Healthcare</strong> - Clinical Protocols, Training
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
              <span style={{ fontSize: "1.1rem" }}>⚖️</span>
              <span>
                <strong>Compliance</strong> - Safety, Policy, Regulatory
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
              <span style={{ fontSize: "1.1rem" }}>🔬</span>
              <span>
                <strong>Research</strong> - Academic, Non-Profit, Government
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
            Analyze any learning or reference material
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
                icon: "📊",
                title: "10 Learning Principles",
                desc: "Evidence-based cognitive science evaluation",
              },
              {
                icon: "🎯",
                title: "Weighted Scoring",
                desc: "0-100 quality metrics with detailed breakdowns",
              },
              {
                icon: "💡",
                title: "Actionable Insights",
                desc: "Priority-ranked improvement recommendations",
              },
              {
                icon: "📈",
                title: "Real-Time Analysis",
                desc: "Web Worker processing for instant results",
              },
            ]}
          />

          {/* Domain Intelligence */}
          <FeatureSection
            title="Domain Intelligence"
            icon="🔬"
            isExpanded={expandedSection === "domain"}
            onToggle={() => toggleSection("domain")}
            badge="NEW!"
            features={[
              {
                icon: "⚗️",
                title: "Chemical Equations",
                desc: "Reaction detection with difficulty assessment",
              },
              {
                icon: "🧮",
                title: "Stoichiometry",
                desc: "Mole/mass calculation recognition",
              },
              {
                icon: "⚛️",
                title: "Lewis Structures",
                desc: "Molecular diagram identification",
              },
              {
                icon: "🔬",
                title: "Lab Procedures",
                desc: "Experimental method analysis",
              },
              {
                icon: "🏷️",
                title: "Nomenclature",
                desc: "IUPAC naming exercise detection",
              },
              {
                icon: "🔄",
                title: "Mechanisms",
                desc: "Multi-step reaction pathway tracking",
              },
            ]}
          />

          {/* Pattern Recognition */}
          <FeatureSection
            title="Pattern Recognition"
            icon="🎨"
            isExpanded={expandedSection === "patterns"}
            onToggle={() => toggleSection("patterns")}
            features={[
              {
                icon: "📝",
                title: "Definition-Example",
                desc: "Concept introduction patterns",
              },
              {
                icon: "🔄",
                title: "Compare-Contrast",
                desc: "Side-by-side analysis detection",
              },
              {
                icon: "📊",
                title: "Problem-Solution",
                desc: "Challenge/resolution structures",
              },
              {
                icon: "📚",
                title: "Elaboration",
                desc: "Progressive detail expansion",
              },
            ]}
          />

          {/* Concept Analysis */}
          <FeatureSection
            title="Concept Analysis"
            icon="🗺️"
            isExpanded={expandedSection === "concepts"}
            onToggle={() => toggleSection("concepts")}
            features={[
              {
                icon: "🔥",
                title: "Importance Ranking",
                desc: "High/Medium/Low classification",
              },
              {
                icon: "🔗",
                title: "Relationship Mapping",
                desc: "4 types: Prerequisites, Related, Examples, Contrasts",
              },
              {
                icon: "🏷️",
                title: "Domain Metadata",
                desc: "Chemistry-specific tags and classifications",
              },
              {
                icon: "🌐",
                title: "Visual Network",
                desc: "Interactive concept connection graphs",
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
                icon: "🎯",
                title: "Concept Highlighting",
                desc: "Click concepts to highlight in text",
              },
              {
                icon: "📊",
                title: "Interactive Charts",
                desc: "Rich data visualizations",
              },
              {
                icon: "🎨",
                title: "Color-Coded Scores",
                desc: "Visual principle performance",
              },
            ]}
          />

          {/* Data & Export */}
          <FeatureSection
            title="Data Management"
            icon="💼"
            isExpanded={expandedSection === "data"}
            onToggle={() => toggleSection("data")}
            features={[
              {
                icon: "💾",
                title: "Export Analysis",
                desc: "Save results as JSON",
              },
              {
                icon: "📂",
                title: "Load Previous",
                desc: "Review past evaluations",
              },
              {
                icon: "⚙️",
                title: "Custom Concepts",
                desc: "Add domain vocabulary",
              },
              {
                icon: "🎛️",
                title: "Configurable",
                desc: "Section hints & TOC management",
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
            desc="Learn about our mission and team"
            onClick={() => {
              alert(
                "About: Tome IQ is an AI-powered tool that helps educators create better learning materials using evidence-based cognitive science principles."
              );
            }}
          />

          {/* Pricing */}
          <MenuLink
            icon="💳"
            title="Pricing"
            desc="Plans for individuals and teams"
            badge="FREE"
            onClick={() => {
              alert(
                "Pricing:\n\n🎓 Free Plan:\n- Unlimited chapter analysis\n- All 10 learning principles\n- Export results as JSON\n- Community support\n\n🚀 Pro Plan (Coming Soon):\n- Priority processing\n- Custom report exports\n- Custom branding\n- API access\n- Priority support"
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
                "Support:\n\nNeed help? We're here for you!\n\n📧 Email: support@tomeiq.ai\n💬 Live Chat: Available Mon-Fri 9am-5pm EST\n📚 Documentation: Quick Start Guide from Quick Actions\n🐛 Report Bug: Use feedback option below"
              );
            }}
          />

          {/* Contact */}
          <MenuLink
            icon="📧"
            title="Contact"
            desc="Reach out to our team"
            onClick={() => {
              alert(
                "Contact Us:\n\n📧 General: hello@tomeiq.ai\n💼 Partnerships: partners@tomeiq.ai\n🎓 Education: education@tomeiq.ai\n📰 Press: press@tomeiq.ai\n\n📍 Location: San Francisco, CA"
              );
            }}
          />

          {/* Resources */}
          <MenuLink
            icon="📚"
            title="Resources"
            desc="Guides, tutorials, and research"
            onClick={() => {
              alert(
                "Resources:\n\n📖 User Guide: Built into the app\n🎥 Video Tutorials: Coming soon\n📊 Case Studies: See how educators use Tome IQ\n🔬 Research: Based on peer-reviewed cognitive science\n📝 Blog: Tips for better educational content\n🎓 Webinars: Monthly learning science workshops"
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
                "We'd love to hear from you!\n\n💡 Feature Requests: What would make Tome IQ better?\n🐛 Bug Reports: Found an issue? Let us know\n⭐ Testimonials: Share your success story\n\n📧 Send feedback to: feedback@tomeiq.ai"
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
                "Terms of Service:\n\n• Free to use for educational purposes\n• Analyze unlimited chapters\n• Export and share your results\n• No warranty on analysis accuracy\n• Use responsibly and ethically\n\nFull terms available at:\ntomeiq.ai/terms"
              );
            }}
          />

          <MenuLink
            icon="🔒"
            title="Privacy Policy"
            desc="How we protect your data"
            onClick={() => {
              alert(
                "Privacy Policy:\n\n✅ Your data stays local - processed in your browser\n✅ No server uploads of chapter content\n✅ We don't sell your data\n✅ Minimal analytics for improvements\n✅ GDPR & CCPA compliant\n\nFull policy at:\ntomeiq.ai/privacy"
              );
            }}
          />

          <MenuLink
            icon="🍪"
            title="Cookie Policy"
            desc="How we use cookies"
            onClick={() => {
              alert(
                "Cookie Policy:\n\n🍪 Essential cookies only\n📊 Optional analytics (with consent)\n🎯 No advertising cookies\n✅ Full control over your preferences\n\nManage cookies at:\ntomeiq.ai/cookies"
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
              icon="🧬"
              title="Biology Domain"
              desc="DNA, cells, genetics patterns"
            />
            <ComingSoonItem
              icon="�"
              title="Comparative Analysis"
              desc="Compare multiple chapters"
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
            Evidence-based learning science at your fingertips
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
          border: isExpanded ? "2px solid #ef8432" : "1.5px solid #ef8432",
          borderRadius: "20px",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = "#f7e6d0";
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = "white";
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
                borderRadius: "6px",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
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
        borderRadius: "6px",
        border: "1.5px solid #ef8432",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
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
        borderRadius: "6px",
        border: "1.5px solid #ef8432",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f7e6d0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "white";
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
