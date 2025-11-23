import { useState } from "react";
import { PrincipleEvaluation } from "@/types";

/**
 * Props interface for PrincipleScoreCard component
 */
interface PrincipleScoreCardProps {
  /** Principle evaluation data */
  principle: PrincipleEvaluation;
  /** Display number for this principle (1-based index) */
  displayNumber: number;
}

/**
 * PrincipleScoreCard Component
 *
 * Displays score and details for a single learning principle.
 * Expandable to show findings and suggestions.
 *
 * Parent: PrincipleScoresGrid
 *
 * @param {PrincipleScoreCardProps} props - Component props from parent
 * @returns {JSX.Element} Expandable principle score card
 */
function PrincipleScoreCard({
  principle,
  displayNumber,
}: PrincipleScoreCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  /**
   * Determines color based on score
   */
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  /**
   * Formats principle name for display
   * Converts camelCase to Title Case with proper capitalization
   */
  const formatPrincipleName = (name: string): string => {
    // Add space before capital letters, capitalize all words
    return name
      .replace(/([A-Z])/g, " $1") // Add space before caps
      .trim() // Remove leading space
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const { score, findings, suggestions } = principle;
  const scoreColor = getScoreColor(score);
  const displayName = formatPrincipleName(principle.principle);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-soft transition-shadow">
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left flex items-start gap-3">
          {/* Subtle principle number */}
          <span className="text-gray-400 text-sm font-medium mt-0.5 flex-shrink-0 w-6">
            {displayNumber}.
          </span>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{displayName}</h4>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreColor(
                    score
                  )} transition-all duration-500`}
                  style={{ width: `${Math.round(score)}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${scoreColor}`}>
                {Math.round(score)}/100
              </span>
            </div>
          </div>
        </div>
        <span className="text-gray-500 text-xl transition-transform">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
          {/* Findings */}
          {findings && findings.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                Findings
              </h5>
              <ul className="space-y-2">
                {findings.slice(0, 2).map((finding, index) => (
                  <li key={index} className="text-xs text-gray-700 flex gap-2">
                    <span className="text-primary-500 flex-shrink-0">•</span>
                    <span>{finding.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                Top Suggestion
              </h5>
              <div className="text-xs bg-primary-50 border border-primary-200 rounded p-2 text-primary-900">
                <p className="font-medium mb-1">{suggestions[0].title}</p>
                <p className="text-primary-800">{suggestions[0].description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PrincipleScoreCard;
