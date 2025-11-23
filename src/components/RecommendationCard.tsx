import { Recommendation } from "@/types";

/**
 * Props interface for RecommendationCard component
 */
interface RecommendationCardProps {
  /** Recommendation data */
  recommendation: Recommendation;
}

/**
 * RecommendationCard Component
 *
 * Displays a single recommendation with title, description, and action items.
 * Shows priority, effort estimate, and expected outcome.
 *
 * Parent: RecommendationsSection
 *
 * @param {RecommendationCardProps} props - Component props from parent
 * @returns {JSX.Element} Individual recommendation card
 */
function RecommendationCard({
  recommendation,
}: RecommendationCardProps): JSX.Element {
  const {
    title,
    description,
    priority,
    estimatedEffort,
    actionItems,
    expectedOutcome,
  } = recommendation;

  /**
   * Gets color classes based on priority
   */
  const getPriorityColors = (
    priorityLevel: string
  ): { border: string; bg: string; text: string; badge: string } => {
    switch (priorityLevel) {
      case "high":
        return {
          border: "border-red-200",
          bg: "bg-red-50",
          text: "text-red-900",
          badge: "bg-red-100 text-red-700",
        };
      case "medium":
        return {
          border: "border-yellow-200",
          bg: "bg-yellow-50",
          text: "text-yellow-900",
          badge: "bg-yellow-100 text-yellow-700",
        };
      default:
        return {
          border: "border-green-200",
          bg: "bg-green-50",
          text: "text-green-900",
          badge: "bg-green-100 text-green-700",
        };
    }
  };

  /**
   * Gets icon based on category
   */
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      restructure: "🔄",
      enhance: "✨",
      add: "➕",
      clarify: "📝",
      remove: "➖",
    };
    return icons[category] || "💡";
  };

  const colors = getPriorityColors(priority);

  return (
    <div className={`card border-l-4 ${colors.border} ${colors.bg}`}>
      <div className="card-body space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">
                {getCategoryIcon(recommendation.category)}
              </span>
              <h4 className={`font-semibold text-lg ${colors.text}`}>
                {title}
              </h4>
            </div>
            <p className={`text-sm ${colors.text} opacity-90`}>{description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`badge-base ${colors.badge} text-xs`}>
              {priority}
            </span>
            <span className="badge-base bg-gray-100 text-gray-700 text-xs">
              {estimatedEffort}
            </span>
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3 bg-white/60 rounded-lg border border-current/10">
          <p className="text-xs font-semibold mb-1 opacity-75">
            Expected Outcome
          </p>
          <p className={`text-sm ${colors.text}`}>{expectedOutcome}</p>
        </div>

        {/* Action Items */}
        {actionItems && actionItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2 opacity-75">
              Action Items
            </p>
            <ul className="space-y-1">
              {actionItems.map((item, index) => (
                <li key={index} className={`text-sm flex gap-2 ${colors.text}`}>
                  <span className="flex-shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;
