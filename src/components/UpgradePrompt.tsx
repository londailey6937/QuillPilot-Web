import React from "react";
import { AccessLevel } from "../../types";

interface UpgradePromptProps {
  currentLevel: AccessLevel;
  targetLevel: "premium" | "professional";
  feature: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  currentLevel,
  targetLevel,
  feature,
  onUpgrade,
  onDismiss,
}) => {
  const premiumFeatures = [
    "✓ Upload limit: Up to 650 pages",
    "✓ Detailed pacing scores with rhythm analysis",
    "✓ Show-vs-tell heatmaps",
    "✓ Auto-generated writing recommendations",
    "✓ Export results (DOCX, JSON, HTML)",
    "✓ Create custom genre profiles",
  ];

  const professionalFeatures = [
    "✓ Everything in Premium, plus:",
    "✓ Upload limit: Up to 1,000 pages",
    "✓ Writer Mode with live analysis updates",
    "✓ Unlimited manuscript analyses",
    "✓ Priority support",
    "✓ Advanced formatting and collaboration tools",
  ];

  const features =
    targetLevel === "premium" ? premiumFeatures : professionalFeatures;
  const price = targetLevel === "premium" ? "$9.99/mo" : "$19.99/mo";
  const tierName =
    targetLevel === "premium" ? "Premium Author" : "Professional Writer";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
        style={{
          backgroundColor: "#fef5e7",
          border: "2px solid #e0c392",
        }}
      >
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 text-2xl w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f7e6d0";
              e.currentTarget.style.color = "#ef8432";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
            aria-label="Close"
          >
            ×
          </button>
        )}

        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              backgroundColor: "#ef8432",
            }}
          >
            <span className="text-3xl text-white">
              {targetLevel === "premium" ? "📚" : "✍️"}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2c3e50" }}>
            Upgrade to {tierName}
          </h2>
          <p style={{ color: "#374151" }}>
            Unlock <strong>{feature}</strong> and more
          </p>
        </div>

        <div
          className="rounded-3xl p-4 mb-6"
          style={{
            backgroundColor: "#f7e6d0",
            border: "2px solid #e0c392",
          }}
        >
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-4xl font-bold" style={{ color: "#2c3e50" }}>
              {price}
            </span>
          </div>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-sm"
                style={{ color: "#2c3e50" }}
              >
                <span className="mr-2">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-full font-semibold transition-all"
            style={{
              backgroundColor: "white",
              color: "#2c3e50",
              border: "2px solid #ef8432",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f7e6d0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            Upgrade to {tierName}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full py-2 rounded-full transition-colors"
              style={{
                backgroundColor: "white",
                color: "#6b7280",
                border: "1px solid #e0c392",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.borderColor = "#ef8432";
                e.currentTarget.style.color = "#2c3e50";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e0c392";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              Maybe Later
            </button>
          )}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: "#6b7280" }}>
          7-day free trial • Cancel anytime
        </p>
      </div>
    </div>
  );
};

interface InlineUpgradePromptProps {
  targetLevel: "premium" | "professional";
  feature: string;
  description: string;
  onUpgrade?: () => void;
}

export const InlineUpgradePrompt: React.FC<InlineUpgradePromptProps> = ({
  targetLevel,
  feature,
  description,
  onUpgrade,
}) => {
  const tierName =
    targetLevel === "premium" ? "Premium Author" : "Professional Writer";
  const icon = targetLevel === "premium" ? "📚" : "✍️";

  return (
    <div
      className="rounded-3xl p-6 my-4"
      style={{
        backgroundColor: "#fef5e7",
        border: "2px solid #e0c392",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2" style={{ color: "#2c3e50" }}>
            {feature}
          </h3>
          <p className="mb-4" style={{ color: "#374151" }}>
            {description}
          </p>
          <button
            onClick={onUpgrade}
            className="px-6 py-2 rounded-full font-semibold transition-all"
            style={{
              backgroundColor: "white",
              color: "#2c3e50",
              border: "2px solid #ef8432",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f7e6d0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            Upgrade to {tierName}
          </button>
        </div>
      </div>
    </div>
  );
};
