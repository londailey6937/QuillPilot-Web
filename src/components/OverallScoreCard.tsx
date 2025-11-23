/**
 * Props interface for OverallScoreCard component
 */
interface OverallScoreCardProps {
  /** Overall score from 0-100 */
  score: number;
}

/**
 * OverallScoreCard Component
 * 
 * Displays the overall pedagogical effectiveness score.
 * Shows score interpretation with visual feedback.
 * 
 * Parent: ChapterAnalysisDashboard
 * 
 * @param {OverallScoreCardProps} props - Component props from parent
 * @returns {JSX.Element} Overall score card with visualization
 */
function OverallScoreCard({ score }: OverallScoreCardProps): JSX.Element {
  /**
   * Determines the score interpretation and color
   */
  const getScoreInterpretation = (
    scoreValue: number
  ): { label: string; color: string; bgColor: string } => {
    if (scoreValue >= 80) {
      return {
        label: 'Excellent',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
      };
    }
    if (scoreValue >= 60) {
      return {
        label: 'Good',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
      };
    }
    if (scoreValue >= 40) {
      return {
        label: 'Fair',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
      };
    }
    return {
      label: 'Needs Improvement',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
    };
  };

  const interpretation = getScoreInterpretation(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`card border-2 ${interpretation.bgColor}`}>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
            <p className={`text-lg font-semibold ${interpretation.color}`}>
              {interpretation.label}
            </p>
            <p className="text-sm text-gray-600 mt-3">
              {score >= 80 &&
                'Excellent learning design with strong implementation of core principles.'}
              {score >= 60 &&
                score < 80 &&
                'Good foundation with room for targeted improvements.'}
              {score >= 40 &&
                score < 60 &&
                'Moderate effectiveness; significant improvements recommended.'}
              {score < 40 && 'Substantial revision needed for optimal learning outcomes.'}
            </p>
          </div>

          {/* Circular Score Indicator */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={interpretation.color}
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{score}</span>
              <span className="text-xs text-gray-600 font-medium">/ 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverallScoreCard;
