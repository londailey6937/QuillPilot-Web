import { PrincipleEvaluation } from "@/types";
import PrincipleScoreCard from "./PrincipleScoreCard";

/**
 * Props interface for PrincipleScoresGrid component
 */
interface PrincipleScoresGridProps {
  /** Array of principle evaluation results */
  principles: PrincipleEvaluation[];
}

/**
 * PrincipleScoresGrid Component
 *
 * Displays scores for all 10 learning principles in a grid layout.
 * Allows users to view principle-specific feedback and suggestions.
 *
 * Parent: ChapterAnalysisDashboard
 * Children: PrincipleScoreCard
 *
 * @param {PrincipleScoresGridProps} props - Component props from parent
 * @returns {JSX.Element} Grid of principle score cards
 */
function PrincipleScoresGrid({
  principles,
}: PrincipleScoresGridProps): JSX.Element {
  if (!principles || principles.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600">No principle evaluations available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-2xl font-bold">Learning Principles Evaluation</h2>
        <p className="text-sm text-gray-600 mt-2">
          Scores based on 10 evidence-based learning science principles
        </p>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {principles.map((principle, index) => (
            <PrincipleScoreCard
              key={principle.principle}
              principle={principle}
              displayNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrincipleScoresGrid;
