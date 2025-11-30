import React from "react";
import { CustomEditor } from "./CustomEditor";
import { Character, CharacterMapping } from "../types";

export interface HeaderFooterSettings {
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
  pageNumberPosition: "header" | "footer";
  headerAlign: "left" | "center" | "right" | "justify";
  footerAlign: "left" | "center" | "right" | "justify";
  facingPages: boolean;
}

interface DocumentEditorProps {
  initialText: string;
  htmlContent?: string | null;
  searchText?: string | null;
  onTextChange: (text: string) => void;
  onContentChange?: (content: { plainText: string; html: string }) => void;
  showSpacingIndicators?: boolean;
  showVisualSuggestions?: boolean;
  highlightPosition: number | null;
  searchWord: string | null;
  searchOccurrence: number;
  onSave?: () => void;
  readOnly?: boolean;
  scrollToTopSignal?: number;
  onScrollDepthChange?: (hasScrolled: boolean) => void;
  isCompactLayout?: boolean;
  analysisResult?: any;
  viewMode?: string;
  isTemplateMode?: boolean;
  onExitTemplateMode?: () => void;
  concepts?: string[];
  onConceptClick?: (concept: string) => void;
  isFreeMode?: boolean;
  leftMargin?: number;
  rightMargin?: number;
  firstLineIndent?: number;
  // Ruler props
  showRuler?: boolean;
  onLeftMarginChange?: (value: number) => void;
  onRightMarginChange?: (value: number) => void;
  onFirstLineIndentChange?: (value: number) => void;
  // Tier 3 - Character management
  characters?: Character[];
  onCharacterLink?: (textOccurrence: string, characterId: string) => void;
  onOpenCharacterManager?: () => void;
  isProfessionalTier?: boolean;
  onEditorLayoutChange?: (layout: { width: number; left: number }) => void;
  // Header/Footer settings for export
  onHeaderFooterChange?: (settings: HeaderFooterSettings) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialText,
  htmlContent,
  onTextChange,
  onContentChange,
  showSpacingIndicators,
  showVisualSuggestions,
  highlightPosition,
  searchWord,
  searchOccurrence,
  onSave,
  readOnly,
  concepts,
  onConceptClick,
  isFreeMode = false,
  viewMode,
  leftMargin = 48,
  rightMargin = 48,
  firstLineIndent = 32,
  showRuler = false,
  onLeftMarginChange,
  onRightMarginChange,
  onFirstLineIndentChange,
  characters,
  onCharacterLink,
  onOpenCharacterManager,
  isProfessionalTier = false,
  onEditorLayoutChange,
  onHeaderFooterChange,
}) => {
  // Determine initial content: prefer HTML if available, otherwise text
  const startContent = htmlContent || initialText;

  const handleUpdate = (content: { html: string; text: string }) => {
    onTextChange(content.text);
    if (onContentChange) {
      onContentChange({ plainText: content.text, html: content.html });
    }
  };

  return (
    <div
      className="document-editor-wrapper"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CustomEditor
        content={startContent}
        onUpdate={handleUpdate}
        onSave={onSave}
        isEditable={!readOnly}
        showSpacingIndicators={showSpacingIndicators}
        showVisualSuggestions={showVisualSuggestions}
        concepts={concepts}
        onConceptClick={onConceptClick}
        isFreeMode={isFreeMode}
        viewMode={viewMode as "analysis" | "writer" | undefined}
        leftMargin={leftMargin}
        rightMargin={rightMargin}
        firstLineIndent={firstLineIndent}
        showRuler={showRuler}
        onLeftMarginChange={onLeftMarginChange}
        onRightMarginChange={onRightMarginChange}
        onFirstLineIndentChange={onFirstLineIndentChange}
        characters={characters}
        onCharacterLink={onCharacterLink}
        onOpenCharacterManager={onOpenCharacterManager}
        isProfessionalTier={isProfessionalTier}
        onLayoutChange={onEditorLayoutChange}
        onHeaderFooterChange={onHeaderFooterChange}
        style={{ flex: 1, minHeight: 0 }}
      />
    </div>
  );
};
