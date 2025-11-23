/**
 * Props interface for InfoCard component
 */
interface InfoCardProps {
  /** Card title */
  title: string;
  /** Array of items to display in the card */
  items: string[];
}

/**
 * InfoCard Component
 *
 * Displays informational content in a styled card with a list of items.
 * Used for tips, features, and benefits display.
 *
 * Parent: ChapterInput
 *
 * @param {InfoCardProps} props - Component props from parent
 * @returns {JSX.Element} Information card with list of items
 */
function InfoCard({ title, items }: InfoCardProps): JSX.Element {
  return (
    <div className="card hover:shadow-soft-lg">
      <div className="card-body">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm text-gray-700"
            >
              <span className="text-primary-500 font-bold mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InfoCard;
