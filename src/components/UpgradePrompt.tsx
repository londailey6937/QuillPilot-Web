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
    "✓ Full 10-Principle Learning Analysis",
    "✓ Complete Concept Graphs & Relationships",
    "✓ Detailed Pattern Recognition",
    "✓ Export Results (DOCX, JSON)",
    "✓ All Visualization Charts",
    "✓ Comprehensive Recommendations",
  ];

  const professionalFeatures = [
    "✓ Everything in Premium, plus:",
    "✓ Writer Mode with Live Analysis",
    "✓ Unlimited Document Analyses",
    "✓ 1,000 Page Upload Limit (Single Book)",
    "✓ Priority Support",
  ];

  const features =
    targetLevel === "premium" ? premiumFeatures : professionalFeatures;
  const price = targetLevel === "premium" ? "$9.99/mo" : "$19.99/mo";
  const tierName = targetLevel === "premium" ? "Premium" : "Professional";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border-2 border-gray-200">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to {tierName}
          </h2>
          <p className="text-gray-600">
            Unlock <strong>{feature}</strong> and more
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 mb-6">
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
          </div>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-sm text-gray-700"
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
                border: "1px solid #d1d5db",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.borderColor = "#ef8432";
                e.currentTarget.style.color = "#2c3e50";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              Maybe Later
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
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
  const tierName = targetLevel === "premium" ? "Premium" : "Professional";
  const icon = targetLevel === "premium" ? "🔒" : "👑";

  return (
    <div className="bg-white border-2 border-gray-300 rounded-3xl p-6 my-4">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{feature}</h3>
          <p className="text-gray-700 mb-4">{description}</p>
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
