/**
 * Props interface for ErrorAlert component
 */
interface ErrorAlertProps {
  /** Error message to display */
  message: string;
  /** Callback when alert is dismissed */
  onDismiss: () => void;
}

/**
 * ErrorAlert Component
 *
 * Displays error messages in a styled alert box.
 * Provides dismiss button to clear the alert.
 *
 * Parent: ChapterInput
 *
 * @param {ErrorAlertProps} props - Component props from parent
 * @returns {JSX.Element} Error alert element
 */
function ErrorAlert({ message, onDismiss }: ErrorAlertProps): JSX.Element {
  return (
    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg flex items-start justify-between">
      <div className="flex items-start gap-3">
        <span className="text-xl">🚨</span>
        <div>
          <h4 className="font-semibold text-red-900">Error</h4>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-700 hover:text-red-900 font-bold text-lg"
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}

export default ErrorAlert;
