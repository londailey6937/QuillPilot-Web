import { Recommendation } from "@/types";
import RecommendationCard from "./RecommendationCard";

/**
 * Props interface for RecommendationsSection component
 */
interface RecommendationsSectionProps {
  /** Array of recommendations */
  recommendations: Recommendation[];
}

/**
 * RecommendationsSection Component
 *
 * Displays prioritized recommendations for improving chapter content.
 * Shows top recommendations with implementation details.
 *
 * Parent: ChapterAnalysisDashboard
 * Children: RecommendationCard
 *
 * @param {RecommendationsSectionProps} props - Component props from parent
 * @returns {JSX.Element} Recommendations section with cards
 */
function RecommendationsSection({
  recommendations,
}: RecommendationsSectionProps): JSX.Element {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold">Recommendations</h2>
        </div>
        <div className="card-body">
          <p className="text-gray-600">
            No recommendations available at this time.
          </p>
        </div>
      </div>
    );
  }

  // Separate recommendations by priority
  const highPriority = recommendations.filter((r) => r.priority === "high");
  const mediumPriority = recommendations.filter((r) => r.priority === "medium");
  const lowPriority = recommendations.filter((r) => r.priority === "low");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Recommendations ({recommendations.length})
      </h2>

      {/* High Priority */}
      {highPriority.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            High Priority ({highPriority.length})
          </h3>
          <div className="space-y-4">
            {highPriority.slice(0, 5).map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority */}
      {mediumPriority.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-yellow-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-600 rounded-full" />
            Medium Priority ({mediumPriority.length})
          </h3>
          <div className="space-y-4">
            {mediumPriority.slice(0, 3).map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-600 rounded-full" />
            Low Priority ({lowPriority.length})
          </h3>
          <div className="space-y-4">
            {lowPriority.slice(0, 3).map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationsSection;
