/**
 * Props interface for WordCounter component
 */
interface WordCounterProps {
  /** Current word count */
  count: number;
}

/**
 * WordCounter Component
 * 
 * Displays the current word count of chapter text.
 * Shows warning if below recommended minimum.
 * 
 * Parent: ChapterInput
 * 
 * @param {WordCounterProps} props - Component props from parent
 * @returns {JSX.Element} Word count display element
 */
function WordCounter({ count }: WordCounterProps): JSX.Element {
  const isLowCount = count < 200;
  const statusColor = isLowCount ? 'text-red-600' : 'text-green-600';
  const statusIcon = isLowCount ? '⚠️' : '✓';

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${statusColor}`}>
      <span>{statusIcon}</span>
      <span>
        {count} words {isLowCount && `(minimum 200 required)`}
      </span>
    </div>
  );
}

export default WordCounter;
