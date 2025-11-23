/**
 * Props interface for TextAreaInput component
 */
interface TextAreaInputProps {
  /** Current textarea value */
  value: string;
  /** Callback when textarea value changes */
  onChange: (value: string) => void;
  /** Placeholder text for textarea */
  placeholder: string;
  /** Whether input is disabled */
  disabled: boolean;
}

/**
 * TextAreaInput Component
 * 
 * Provides a styled textarea for chapter text input.
 * Handles text input and change events.
 * 
 * Parent: ChapterInput
 * 
 * @param {TextAreaInputProps} props - Component props from parent
 * @returns {JSX.Element} Textarea input element
 */
function TextAreaInput({
  value,
  onChange,
  placeholder,
  disabled,
}: TextAreaInputProps): JSX.Element {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="input-base h-80 resize-vertical font-mono text-sm"
    />
  );
}

export default TextAreaInput;
