import React from "react";

/**
 * Props interface for FileUploadButton component
 */
interface FileUploadButtonProps {
  /** Callback when file is selected */
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Whether button is disabled */
  isDisabled: boolean;
  /** Ref to hidden file input element */
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * FileUploadButton Component
 *
 * Provides a styled button for uploading chapter files.
 * Accepts .docx and .obt files.
 *
 * Parent: ChapterInput
 *
 * @param {FileUploadButtonProps} props - Component props from parent
 * @returns {JSX.Element} File upload button with hidden input
 */
function FileUploadButton({
  onUpload,
  isDisabled,
  fileInputRef,
}: FileUploadButtonProps): JSX.Element {
  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled}
        className="btn-secondary"
      >
        📄 Upload File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.obt"
        onChange={onUpload}
        className="hidden"
        aria-label="Upload chapter file (.docx or .obt)"
      />
    </>
  );
}

export default FileUploadButton;
