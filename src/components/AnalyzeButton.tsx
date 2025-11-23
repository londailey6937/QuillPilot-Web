/**
 * Props interface for AnalyzeButton component
 */
interface AnalyzeButtonProps {
  /** Click handler for analyze action */
  onClick: () => Promise<void>;
  /** Whether button is disabled */
  disabled: boolean;
  /** Whether analysis is in progress */
  isLoading: boolean;
  /** Current progress message */
  progress: string;
}

/**
 * AnalyzeButton Component
 *
 * Primary action button for starting chapter analysis.
 * Shows loading state and progress message during analysis.
 *
 * Parent: ChapterInput
 *
 * @param {AnalyzeButtonProps} props - Component props from parent
 * @returns {JSX.Element} Analyze button with loading state
 */
function AnalyzeButton({
  onClick,
  disabled,
  isLoading,
  progress,
}: AnalyzeButtonProps): JSX.Element {
  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={disabled}
        className="btn-primary w-full py-3 text-lg"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {progress || "Analyzing..."}
          </>
        ) : (
          <>🔍 Analyze Chapter</>
        )}
      </button>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
            <span
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <span
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          <span>Analysis in progress...</span>
        </div>
      )}
    </div>
  );
}

export default AnalyzeButton;
