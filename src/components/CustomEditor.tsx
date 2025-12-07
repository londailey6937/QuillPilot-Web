import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { creamPalette as palette } from "../styles/palette";
import {
  analyzeParagraphSpacing,
  countWords,
  detectPassiveVoice,
} from "@/utils/spacingInsights";
import { SensoryDetailAnalyzer } from "@/utils/sensoryDetailAnalyzer";
import { Character, CharacterMapping } from "../types";
import { AIWritingAssistant } from "./AIWritingAssistant";
import { DialogueEnhancer } from "./DialogueEnhancer";
import { ReadabilityAnalyzer } from "./ReadabilityAnalyzer";
import { ClicheDetector } from "./ClicheDetector";
import { BeatSheetGenerator } from "./BeatSheetGenerator";
import { POVChecker } from "./POVChecker";
import { EmotionTracker } from "./EmotionTracker";
import { MotifTracker } from "./MotifTracker";
import { PoetryMeterAnalyzer } from "./PoetryMeterAnalyzer";
import { NonFictionOutlineGenerator } from "./NonFictionOutlineGenerator";
import { AcademicCitationManager } from "./AcademicCitationManager";
import { CharacterNameGenerator } from "./CharacterNameGenerator";
import { WorldBuildingNotebook } from "./WorldBuildingNotebook";
import { ResearchNotesPanel } from "./ResearchNotesPanel";
import { ImageMoodBoard } from "./ImageMoodBoard";
import { VersionHistory } from "./VersionHistory";
import { CommentAnnotation } from "./CommentAnnotation";
import {
  PaginatedEditor,
  PaginatedEditorRef,
} from "@/components/PaginatedEditor";
import { DocumentStylesState, StyleTemplate } from "../types/documentStyles";
import { ColorWheelDropdown } from "./ColorWheelDropdown";
import { useTheme } from "./ThemeProvider";

interface CustomEditorProps {
  content: string;
  onUpdate?: (content: { html: string; text: string }) => void;
  onSave?: () => void;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showSpacingIndicators?: boolean;
  showVisualSuggestions?: boolean;
  concepts?: string[];
  onConceptClick?: (concept: string) => void;
  isFreeMode?: boolean;
  viewMode?: "analysis" | "writer";
  leftMargin?: number;
  rightMargin?: number;
  firstLineIndent?: number;
  // Ruler and margin callbacks
  showRuler?: boolean;
  onLeftMarginChange?: (value: number) => void;
  onRightMarginChange?: (value: number) => void;
  onFirstLineIndentChange?: (value: number) => void;
  // Tier 3 - Character management
  characters?: Character[];
  onCharacterLink?: (textOccurrence: string, characterId: string) => void;
  onOpenCharacterManager?: () => void;
  isProfessionalTier?: boolean;
  onLayoutChange?: (layout: { width: number; left: number }) => void;
  // Help callback for opening tool-specific help
  onOpenHelp?: (section: string) => void;
  // Header/Footer settings callback for export
  onHeaderFooterChange?: (settings: {
    headerText: string;
    footerText: string;
    showPageNumbers: boolean;
    pageNumberPosition: "header" | "footer";
    headerAlign: "left" | "center" | "right" | "justify";
    footerAlign: "left" | "center" | "right" | "justify";
    facingPages: boolean;
  }) => void;
  // Document tools to render between toolbars
  documentTools?: React.ReactNode;
  // Saved chapters hook for toolbar placeholder actions
  onOpenChapterLibrary?: () => void;
  // Callback when page count changes
  onPageCountChange?: (count: number) => void;
}

const INCH_IN_PX = 96;
const PAGE_WIDTH_PX = INCH_IN_PX * 8;
const PAGE_HEIGHT_PX = INCH_IN_PX * 11; // 11 inches for US Letter
// Header area: 1 inch from top for header text
const HEADER_RESERVED_PX = INCH_IN_PX * 1;
// Footer area: 1 inch from bottom for footer text and page number
const FOOTER_RESERVED_PX = INCH_IN_PX * 1;
const RULER_BACKGROUND_LEFT_OVERHANG = 0;
const RULER_BACKGROUND_RIGHT_OVERHANG = 0;
const POINT_TO_PX = 96 / 72;
const PAGE_WIDTH_PT = PAGE_WIDTH_PX / POINT_TO_PX; // 576pt on an 8" page
const PAGE_CENTER_PT = PAGE_WIDTH_PT / 2; // 288pt (page midpoint)
const TITLE_STYLE_POINT_SIZE = 20;
const BLOCK_TYPE_TEXT_COLOR = palette.heading;

const PREVIEW_BASE_PAGE_WIDTH_PX = 490;
const PREVIEW_BASE_WIDTH_PX = 520;
const PREVIEW_SAFE_MARGIN_PX = 12;
const PREVIEW_HEADER_HEIGHT_PX = 44;
const PREVIEW_HINT_HEIGHT_PX = 36;
const PREVIEW_PADDING_HEIGHT_PX = 24;
const PREVIEW_BASE_PAGE_HEIGHT_PX = Math.round(
  PREVIEW_BASE_PAGE_WIDTH_PX * (PAGE_HEIGHT_PX / PAGE_WIDTH_PX)
);
const PREVIEW_BASE_HEIGHT_PX =
  PREVIEW_BASE_PAGE_HEIGHT_PX +
  PREVIEW_HEADER_HEIGHT_PX +
  PREVIEW_HINT_HEIGHT_PX +
  PREVIEW_PADDING_HEIGHT_PX;

const computePreviewDimensions = (viewportHeight?: number) => {
  const availableHeight =
    typeof viewportHeight === "number"
      ? viewportHeight - PREVIEW_SAFE_MARGIN_PX * 2
      : null;
  const baseHeight = PREVIEW_BASE_HEIGHT_PX;
  const scale =
    availableHeight && availableHeight > 0
      ? Math.min(1, availableHeight / baseHeight)
      : 1;

  return {
    previewWidth: Math.round(PREVIEW_BASE_WIDTH_PX * scale),
    pageWidth: Math.round(PREVIEW_BASE_PAGE_WIDTH_PX * scale),
    previewHeight: Math.round(baseHeight * scale),
    scale,
  };
};

interface BlockTypeMenuItem {
  value: string;
  label: string;
  shortcut?: string;
}

interface BlockTypeMenuSection {
  key: string;
  label: string;
  accent: string;
  background: string;
  items: BlockTypeMenuItem[];
}

const BLOCK_TYPE_SECTIONS: BlockTypeMenuSection[] = [
  {
    key: "basic",
    label: "Basic",
    accent: palette.accent,
    background: "#fffaf3",
    items: [
      { value: "p", label: "Paragraph", shortcut: "⌘⌥0" },
      { value: "h1", label: "Heading 1", shortcut: "⌘⌥1" },
      { value: "h2", label: "Heading 2", shortcut: "⌘⌥2" },
      { value: "h3", label: "Heading 3", shortcut: "⌘⌥3" },
      { value: "h4", label: "Heading 4", shortcut: "⌘⌥4" },
      { value: "h5", label: "Heading 5", shortcut: "⌘⌥5" },
      { value: "h6", label: "Heading 6", shortcut: "⌘⌥6" },
      { value: "blockquote", label: "Quote", shortcut: "⌘⇧." },
      { value: "pre", label: "Code Block" },
      { value: "lead-paragraph", label: "Lead Paragraph" },
      { value: "pullquote", label: "Pull Quote" },
      { value: "caption", label: "Caption" },
    ],
  },
  {
    key: "academic",
    label: "Academic",
    accent: "#8b5cf6",
    background: palette.subtle,
    items: [
      { value: "abstract", label: "Abstract" },
      { value: "keywords", label: "Keywords" },
      { value: "bibliography", label: "Bibliography" },
      { value: "references", label: "References" },
      { value: "appendix", label: "Appendix" },
      { value: "footnote", label: "Footnote" },
      { value: "citation", label: "Citation" },
      { value: "figure-caption", label: "Figure Caption" },
      { value: "table-title", label: "Table Title" },
      { value: "equation", label: "Equation" },
    ],
  },
  {
    key: "professional",
    label: "Professional",
    accent: "#92400e",
    background: palette.hover,
    items: [
      { value: "author-info", label: "Author Info" },
      { value: "date-info", label: "Date" },
      { value: "address", label: "Address" },
      { value: "salutation", label: "Salutation" },
      { value: "closing", label: "Closing" },
      { value: "signature", label: "Signature Line" },
      { value: "sidebar", label: "Sidebar" },
      { value: "callout", label: "Callout / Alert" },
      { value: "memo-heading", label: "Memo Heading" },
      { value: "subject-line", label: "Subject Line" },
      { value: "executive-summary", label: "Executive Summary" },
    ],
  },
  {
    key: "book",
    label: "Book Publishing",
    accent: palette.border,
    background: "#eddcc5",
    items: [
      { value: "paragraph", label: "Paragraph (Reset)" },
      { value: "book-title", label: "Book Title" },
      { value: "title", label: "Section Title" },
      { value: "subtitle", label: "Subtitle" },
      { value: "chapter-heading", label: "Chapter Heading" },
      { value: "part-title", label: "Part Title" },
      { value: "epigraph", label: "Epigraph" },
      { value: "dedication", label: "Dedication" },
      { value: "acknowledgments", label: "Acknowledgments" },
      { value: "copyright", label: "Copyright Notice" },
      { value: "verse", label: "Verse / Poetry" },
      { value: "front-matter", label: "Front Matter" },
      { value: "scene-break", label: "Scene Break" },
      { value: "afterword", label: "Afterword" },
    ],
  },
  {
    key: "journalism",
    label: "Journalism & Media",
    accent: "#111827",
    background: palette.base,
    items: [
      { value: "press-lead", label: "Press Lead" },
      { value: "nut-graf", label: "Nut Graf" },
      { value: "byline", label: "Byline" },
      { value: "dateline", label: "Dateline" },
      { value: "fact-box", label: "Fact Box" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing & Copy",
    accent: palette.accent,
    background: palette.hover,
    items: [
      { value: "hero-headline", label: "Hero Headline" },
      { value: "marketing-subhead", label: "Promo Subhead" },
      { value: "feature-callout", label: "Feature Callout" },
      { value: "testimonial", label: "Testimonial" },
      { value: "cta-block", label: "CTA Block" },
    ],
  },
  {
    key: "technical",
    label: "Technical Docs",
    accent: palette.success,
    background: palette.subtle,
    items: [
      { value: "api-heading", label: "API Heading" },
      { value: "code-reference", label: "Code Reference" },
      { value: "warning-note", label: "Warning Note" },
      { value: "success-note", label: "Success Note" },
    ],
  },
  {
    key: "screenplay",
    label: "Screenplay",
    accent: palette.navy,
    background: "#f5e6d3",
    items: [
      { value: "scene-heading", label: "Scene Heading" },
      { value: "action", label: "Action" },
      { value: "character", label: "Character" },
      { value: "dialogue", label: "Dialogue" },
      { value: "parenthetical", label: "Parenthetical" },
      { value: "transition", label: "Transition" },
      { value: "shot", label: "Shot Direction" },
      { value: "lyric", label: "Lyric" },
      { value: "beat", label: "Beat" },
    ],
  },
];

const normalizeFontName = (fontName: string): string =>
  fontName.toLowerCase().replace(/['"]/g, "").split(",")[0].trim();

const FONT_FAMILY_OPTIONS = [
  {
    value: "default",
    label: "Default",
    commandValue: "inherit",
    cssFamily: "",
    matchFaces: ["inherit", "default"],
  },
  {
    value: "georgia",
    label: "Georgia",
    commandValue: "Georgia",
    cssFamily: "'Georgia', serif",
    matchFaces: ["Georgia", "Georgia, serif"],
  },
  {
    value: "times-new-roman",
    label: "Times New Roman",
    commandValue: "Times New Roman",
    cssFamily: "'Times New Roman', Times, serif",
    matchFaces: ["Times New Roman", "Times New Roman, serif"],
  },
  {
    value: "palatino",
    label: "Palatino",
    commandValue: "Palatino Linotype",
    cssFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    matchFaces: [
      "Palatino Linotype",
      "Palatino Linotype, serif",
      "Palatino, serif",
    ],
  },
  {
    value: "garamond",
    label: "Garamond",
    commandValue: "Garamond",
    cssFamily: "Garamond, 'Apple Garamond', 'ITC Garamond', serif",
    matchFaces: ["Garamond", "Garamond, serif"],
  },
  {
    value: "arial",
    label: "Arial",
    commandValue: "Arial",
    cssFamily: "Arial, 'Liberation Sans', 'Helvetica Neue', sans-serif",
    matchFaces: ["Arial", "Arial, sans-serif"],
  },
  {
    value: "helvetica",
    label: "Helvetica",
    commandValue: "Helvetica",
    cssFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    matchFaces: ["Helvetica", "Helvetica, sans-serif"],
  },
  {
    value: "verdana",
    label: "Verdana",
    commandValue: "Verdana",
    cssFamily: "Verdana, Geneva, sans-serif",
    matchFaces: ["Verdana", "Verdana, sans-serif"],
  },
  {
    value: "courier-new",
    label: "Courier New",
    commandValue: "Courier New",
    cssFamily: "'Courier New', Courier, monospace",
    matchFaces: ["Courier New", "Courier New, monospace"],
  },
  {
    value: "courier-prime",
    label: "Courier Prime",
    commandValue: "Courier Prime",
    cssFamily: "'Courier Prime', 'Courier New', Courier, monospace",
    matchFaces: ["Courier Prime", "Courier Prime, monospace"],
  },
].map((option) => ({
  ...option,
  matchFaces: Array.from(
    new Set(
      [option.commandValue, ...option.matchFaces]
        .filter(Boolean)
        .map((face) => normalizeFontName(face))
    )
  ),
}));

const buildDefaultDocumentStyles = (): DocumentStylesState => ({
  paragraph: {
    fontSize: 16,
    fontFamily: undefined, // Uses default
    firstLineIndent: 32,
    lineHeight: 1.5,
    marginBottom: 0.5,
    marginTop: 0,
    textAlign: "left",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  "lead-paragraph": {
    fontSize: 18,
    fontWeight: "normal",
    fontStyle: "normal",
    textAlign: "left",
    marginTop: 0,
    marginBottom: 0.8,
    firstLineIndent: 0,
    lineHeight: 1.7,
  },
  pullquote: {
    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 1.2,
    marginBottom: 1.2,
    firstLineIndent: 0,
    marginLeft: 24,
    marginRight: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  caption: {
    fontSize: 13,
    fontWeight: "normal",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 0.3,
    marginBottom: 0.6,
    firstLineIndent: 0,
  },
  "book-title": {
    fontSize: TITLE_STYLE_POINT_SIZE,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 1,
    firstLineIndent: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "center",
    marginTop: 1.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "normal",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 0.5,
    marginBottom: 1,
    firstLineIndent: 0,
  },
  "chapter-heading": {
    fontSize: 26,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "left",
    marginTop: 2,
    marginBottom: 1,
    firstLineIndent: 0,
  },
  "part-title": {
    fontSize: 28,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 1.5,
    firstLineIndent: 0,
  },
  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "left",
    marginTop: 1.5,
    marginBottom: 0.8,
    firstLineIndent: 0,
  },
  heading2: {
    fontSize: 22,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "left",
    marginTop: 1.2,
    marginBottom: 0.6,
    firstLineIndent: 0,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "left",
    marginTop: 1,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  blockquote: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginLeft: 40,
    marginTop: 1,
    marginBottom: 1,
    firstLineIndent: 0,
    borderLeftWidth: 4,
    borderLeftColor: "#e0c392",
  },
  "figure-caption": {
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 0.4,
    marginBottom: 0.6,
    firstLineIndent: 0,
  },
  "table-title": {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.2,
    firstLineIndent: 0,
  },
  equation: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
    marginLeft: 20,
    marginRight: 20,
  },
  byline: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.2,
    marginBottom: 0.2,
    firstLineIndent: 0,
    lineHeight: 1.4,
  },
  dateline: {
    fontSize: 13,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0.2,
    marginBottom: 0.2,
    firstLineIndent: 0,
  },
  "press-lead": {
    fontSize: 17,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.3,
    firstLineIndent: 0,
    lineHeight: 1.6,
    borderLeftWidth: 4,
    borderLeftColor: palette.accent,
  },
  "nut-graf": {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.4,
    marginBottom: 0.6,
    firstLineIndent: 0,
    lineHeight: 1.6,
  },
  "fact-box": {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
    lineHeight: 1.5,
    marginLeft: 16,
    marginRight: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  "hero-headline": {
    fontSize: 26,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 1,
    marginBottom: 0.4,
    firstLineIndent: 0,
  },
  "marketing-subhead": {
    fontSize: 18,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 0.3,
    marginBottom: 0.7,
    firstLineIndent: 0,
  },
  "feature-callout": {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.4,
    marginBottom: 0.4,
    firstLineIndent: 0,
    marginLeft: 20,
    borderLeftWidth: 4,
    borderLeftColor: palette.accent,
  },
  testimonial: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.6,
    marginBottom: 0.6,
    firstLineIndent: 0,
    marginLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: palette.lightBorder,
  },
  "cta-block": {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 0.8,
    marginBottom: 0.8,
    firstLineIndent: 0,
    lineHeight: 1.4,
  },
  "api-heading": {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0.8,
    marginBottom: 0.2,
    firstLineIndent: 0,
  },
  "code-reference": {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.5,
    firstLineIndent: 0,
    marginLeft: 12,
    marginRight: 12,
  },
  "warning-note": {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.4,
    marginBottom: 0.4,
    firstLineIndent: 0,
    borderLeftWidth: 4,
    borderLeftColor: palette.info,
  },
  "success-note": {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.4,
    marginBottom: 0.4,
    firstLineIndent: 0,
    borderLeftWidth: 4,
    borderLeftColor: palette.success,
  },
  epigraph: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "right",
    marginTop: 1,
    marginBottom: 1,
    firstLineIndent: 0,
  },
  dedication: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 2,
    firstLineIndent: 0,
  },
  verse: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginLeft: 40,
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  "scene-heading": {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 1,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  action: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  character: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 0.5,
    marginBottom: 0,
    firstLineIndent: 0,
  },
  dialogue: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 0.5,
    firstLineIndent: 0,
    marginLeft: 60,
    marginRight: 60,
  },
  parenthetical: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 0,
    firstLineIndent: 0,
    marginLeft: 80,
    marginRight: 80,
  },
  transition: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  abstract: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "justify",
    marginTop: 1,
    marginBottom: 1,
    firstLineIndent: 0,
    marginLeft: 20,
    marginRight: 20,
  },
  keywords: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 1,
    firstLineIndent: 0,
  },
  bibliography: {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.3,
    firstLineIndent: -20,
    marginLeft: 20,
  },
  references: {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.3,
    firstLineIndent: -20,
    marginLeft: 20,
  },
  appendix: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 32,
  },
  footnote: {
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.2,
    marginBottom: 0.2,
    firstLineIndent: 0,
  },
  citation: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.3,
    firstLineIndent: 0,
  },
  "author-info": {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.3,
    firstLineIndent: 0,
  },
  "date-info": {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  address: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.3,
    firstLineIndent: 0,
  },
  salutation: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 1,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  closing: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 1,
    marginBottom: 0.3,
    firstLineIndent: 0,
  },
  signature: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  sidebar: {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
    marginLeft: 20,
    marginRight: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  callout: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
    marginLeft: 20,
    marginRight: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  "memo-heading": {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 1,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  "subject-line": {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.7,
    firstLineIndent: 0,
  },
  "executive-summary": {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 32,
    lineHeight: 1.6,
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  acknowledgments: {
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 32,
  },
  copyright: {
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 2,
    firstLineIndent: 0,
  },
  "front-matter": {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 1.2,
    marginBottom: 0.8,
    firstLineIndent: 0,
  },
  "scene-break": {
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 1.5,
    marginBottom: 1.5,
    firstLineIndent: 0,
  },
  afterword: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 1,
    marginBottom: 0.8,
    firstLineIndent: 32,
  },
  shot: {
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0.5,
    marginBottom: 0.5,
    firstLineIndent: 0,
  },
  lyric: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: 0.3,
    marginBottom: 0.3,
    firstLineIndent: 0,
  },
  beat: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "normal",
    textAlign: "left",
    marginTop: 0.3,
    marginBottom: 0.3,
    firstLineIndent: 0,
    marginLeft: 50,
    marginRight: 50,
  },
});
const CENTERED_STYLE_SELECTORS = [
  "p.title-content",
  "p.book-title",
  "p.subtitle",
  "p.chapter-heading",
  "p.part-title",
  "p.image-paragraph",
  "p.doc-title",
  "p.doc-subtitle",
  ".doc-title",
  ".doc-subtitle",
  "h1",
  "h2",
  "h3",
];
const CENTERABLE_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "figure",
];
const CENTERABLE_SELECTOR = CENTERABLE_TAGS.join(", ");

interface TextNodeMap {
  node: Text;
  start: number;
  end: number;
}

type SpacingTone = "compact" | "balanced" | "extended";

interface SpacingIndicator {
  index: number;
  wordCount: number;
  tone: SpacingTone;
  label: string;
  hasPassive?: boolean;
  passiveCount?: number;
}

interface VisualIndicator {
  visualType?: string;
  sensoryType?: string;
  reason: string;
  priority?: "high" | "medium" | "low";
  context?: string;
}

interface VisualAnalysisEntry {
  index: number;
  suggestions: VisualIndicator[];
}

interface AnalysisData {
  spacing: SpacingIndicator[];
  visuals: VisualAnalysisEntry[];
}

interface TextMatch {
  start: number;
  end: number;
}

const buildSnippet = (raw: string) => {
  const normalized = (raw || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const words = normalized.split(" ").filter(Boolean);
  const previewWords = words.slice(0, 35);
  const preview = previewWords.join(" ");
  return words.length > previewWords.length ? `${preview}…` : preview;
};

const extractTextWithMap = (root: Node) => {
  let text = "";
  const map: TextNodeMap[] = [];

  const traverse = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.textContent || "";
      if (content.length > 0) {
        map.push({
          node: node as Text,
          start: text.length,
          end: text.length + content.length,
        });
        text += content;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).tagName;
      const isBlock = [
        "P",
        "DIV",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "LI",
        "BR",
        "UL",
        "OL",
        "BLOCKQUOTE",
        "PRE",
        "TR",
      ].includes(tagName);

      if (tagName === "BR") {
        text += "\n";
        return;
      }

      if (isBlock && text.length > 0 && !text.endsWith("\n")) {
        text += "\n";
      }

      node.childNodes.forEach(traverse);

      if (isBlock && text.length > 0 && !text.endsWith("\n")) {
        text += "\n";
      }
    }
  };

  traverse(root);
  return { text, map };
};

export const CustomEditor: React.FC<CustomEditorProps> = ({
  content,
  onUpdate,
  onSave,
  isEditable = true,
  className,
  style,
  showSpacingIndicators = true,
  showVisualSuggestions = true,
  concepts = [],
  onConceptClick,
  isFreeMode = false,
  viewMode = "analysis",
  leftMargin = 48,
  rightMargin = 48,
  firstLineIndent = 32,
  showRuler = false,
  onLeftMarginChange,
  onRightMarginChange,
  onFirstLineIndentChange,
  characters = [],
  onCharacterLink,
  onOpenCharacterManager,
  isProfessionalTier = false,
  onLayoutChange,
  onOpenHelp,
  onHeaderFooterChange,
  documentTools,
  onOpenChapterLibrary,
  onPageCountChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null); // Currently unused - needs refactoring to work with PaginatedEditor
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollShellRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const rulerFrameRef = useRef<HTMLDivElement>(null);
  // Header/footer preview inputs removed - ref no longer needed
  const [analysis, setAnalysis] = useState<AnalysisData>({
    spacing: [],
    visuals: [],
  });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectionRangeRef = useRef<Range | null>(null);
  const hasMigratedLegacyFontsRef = useRef(false);

  // Undo/Redo history
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const textMapRef = useRef<{ fullText: string; map: TextNodeMap[] } | null>(
    null
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const blockTypeButtonBaseBg = isDarkMode ? "rgb(42, 36, 33)" : "#fff8ec";
  const blockTypeButtonHoverBg = isDarkMode ? "rgb(58, 51, 49)" : "#f7e6d0";
  const blockTypeButtonTextColor = isDarkMode ? "#fff8ec" : "#2a2421";
  const blockTypeButtonBorderColor = "#e0c392";
  const toolbarInactiveButtonClass = isDarkMode
    ? "border border-[#4b433f] bg-[#5a534e] hover:bg-[#6a635c] text-[rgb(232,213,183)]"
    : "border border-[#e0c392] bg-[#fff8ec] hover:bg-[#f7e6d0] text-[#2a2421]";
  const stylesPanelTitleColor = "#f5a623";
  const stylesPanelSectionHeadingColor = "#f7b84b";
  const stylesPanelItemLabelColor = "#d4a35a";

  // New feature states
  const [blockType, setBlockType] = useState("p");
  const [fontFamily, setFontFamily] = useState("default");
  const [fontSize, setFontSize] = useState("16px");
  const [showStyleLabels, setShowStyleLabels] = useState(false);
  const [showBlockTypeDropdown, setShowBlockTypeDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const blockTypeDropdownRef = useRef<HTMLDivElement>(null);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);

  // Column layout state
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  // Image float toolbar state
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [imageToolbarPosition, setImageToolbarPosition] = useState({
    top: 0,
    left: 0,
  });

  // Bookmarks and Cross-References
  interface Bookmark {
    id: string;
    name: string;
    selectedText: string;
    color: string;
    timestamp: number;
  }
  interface CrossReference {
    id: string;
    name: string;
    sourceText: string;
    targetBookmarkId: string;
    note: string;
    timestamp: number;
  }
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Advanced Tools state
  type ActiveTool =
    | "ai-assistant"
    | "dialogue"
    | "readability"
    | "cliche"
    | "beats"
    | "pov"
    | "emotion"
    | "motif"
    | "poetry-meter"
    | "nonfiction-outline"
    | "citation-manager"
    | "name-generator"
    | "world-building"
    | "research-notes"
    | "mood-board"
    | "version-history"
    | "comments"
    | null;
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [showCrossRefModal, setShowCrossRefModal] = useState(false);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState("");
  const [newBookmarkColor, setNewBookmarkColor] = useState("#fbbf24");
  const [newCrossRefName, setNewCrossRefName] = useState("");
  const [newCrossRefTarget, setNewCrossRefTarget] = useState("");
  const [newCrossRefNote, setNewCrossRefNote] = useState("");
  const [selectedTextForBookmark, setSelectedTextForBookmark] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [sprintMode, setSprintMode] = useState(false);
  const [sprintDuration, setSprintDuration] = useState(15); // minutes
  const [sprintTimeRemaining, setSprintTimeRemaining] = useState(0);
  const [sprintStartWords, setSprintStartWords] = useState(0);
  const [textAlign, setTextAlign] = useState("left");
  const [findMatches, setFindMatches] = useState<TextMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [statistics, setStatistics] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
    readingTime: 0,
    readingLevel: 0,
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [showCharacterPopover, setShowCharacterPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const characterPopoverRef = useRef<HTMLDivElement>(null);
  const characterButtonRef = useRef<HTMLButtonElement>(null);
  const [rulerAlignedLeft, setRulerAlignedLeft] = useState<number | null>(null);
  const pageRailRef = useRef<HTMLDivElement>(null);
  const [footerAlignmentOffset, setFooterAlignmentOffset] = useState(0);

  // Pagination state
  const [pageCount, setPageCount] = useState(1);
  const [pageSnippets, setPageSnippets] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(0);
  const showThumbnailRail = viewMode === "writer" && !isFreeMode;
  const activePageRef = useRef(0);

  // Handle page count changes - update local state and notify parent
  const handlePageCountChange = useCallback(
    (count: number) => {
      setPageCount(count);
      onPageCountChange?.(count);
    },
    [onPageCountChange]
  );

  // True pagination mode (always enabled - uses PaginatedEditor)
  const paginatedEditorRef = useRef<PaginatedEditorRef>(null);
  const selectionSyncLockRef = useRef(false);

  // Internal margin state for True Pagination mode (when parent doesn't manage state)
  const [internalLeftMargin, setInternalLeftMargin] = useState(leftMargin);
  const [internalRightMargin, setInternalRightMargin] = useState(rightMargin);
  const [internalFirstLineIndent, setInternalFirstLineIndent] =
    useState(firstLineIndent);

  // Use internal state when no external callback provided
  const effectiveLeftMargin = onLeftMarginChange
    ? leftMargin
    : internalLeftMargin;
  const effectiveRightMargin = onRightMarginChange
    ? rightMargin
    : internalRightMargin;
  const effectiveFirstLineIndent = onFirstLineIndentChange
    ? firstLineIndent
    : internalFirstLineIndent;

  // Callbacks that update internal state or call parent callback
  const handleLeftMarginChange = useCallback(
    (value: number) => {
      if (onLeftMarginChange) {
        onLeftMarginChange(value);
      } else {
        setInternalLeftMargin(value);
      }
    },
    [onLeftMarginChange]
  );

  const handleRightMarginChange = useCallback(
    (value: number) => {
      if (onRightMarginChange) {
        onRightMarginChange(value);
      } else {
        setInternalRightMargin(value);
      }
    },
    [onRightMarginChange]
  );

  const handleFirstLineIndentChange = useCallback(
    (value: number) => {
      if (onFirstLineIndentChange) {
        onFirstLineIndentChange(value);
      } else {
        setInternalFirstLineIndent(value);
      }
    },
    [onFirstLineIndentChange]
  );

  // Page preview hover state
  const [previewPageIndex, setPreviewPageIndex] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
  const [previewDimensions, setPreviewDimensions] = useState(() =>
    computePreviewDimensions(
      typeof window !== "undefined" ? window.innerHeight : undefined
    )
  );
  const previewScale =
    previewDimensions.pageWidth > 0
      ? previewDimensions.pageWidth / PREVIEW_BASE_PAGE_WIDTH_PX
      : 1;
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ruler container ref (used for alignment calculations)
  const rulerContainerRef = useRef<HTMLDivElement>(null);

  // Close block type dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showBlockTypeDropdown &&
        blockTypeDropdownRef.current &&
        !blockTypeDropdownRef.current.contains(e.target as Node)
      ) {
        setShowBlockTypeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBlockTypeDropdown]);

  // Close font size dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showFontSizeDropdown &&
        fontSizeDropdownRef.current &&
        !fontSizeDropdownRef.current.contains(e.target as Node)
      ) {
        setShowFontSizeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFontSizeDropdown]);

  // Close column dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showColumnDropdown &&
        columnDropdownRef.current &&
        !columnDropdownRef.current.contains(e.target as Node)
      ) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnDropdown]);

  // Image resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const forceImmediateSaveRef = useRef(false);

  // Image click handler for float toolbar
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicked on an image
      if (target.tagName === "IMG") {
        const img = target as HTMLImageElement;
        const rect = img.getBoundingClientRect();

        // Position toolbar above the image
        setImageToolbarPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        });
        setSelectedImage(img);

        // Add selection outline to the image
        img.style.outline = "2px solid #8b6914";
        img.style.outlineOffset = "2px";

        e.preventDefault();
        e.stopPropagation();
      } else if (
        selectedImage &&
        !target.closest(".image-float-toolbar") &&
        !target.closest(".image-resize-handle")
      ) {
        // Clicked outside image and toolbar - deselect
        selectedImage.style.outline = "";
        selectedImage.style.outlineOffset = "";
        setSelectedImage(null);
      }
    };

    document.addEventListener("click", handleImageClick, true);
    return () => document.removeEventListener("click", handleImageClick, true);
  }, [selectedImage]);

  // Handle image resizing
  useEffect(() => {
    if (!isResizing || !selectedImage) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedImage) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      const aspectRatio = resizeStart.width / resizeStart.height;

      // Calculate new dimensions based on which handle is being dragged
      if (resizeHandle.includes("e")) {
        newWidth = Math.max(50, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes("w")) {
        newWidth = Math.max(50, resizeStart.width - deltaX);
      }
      if (resizeHandle.includes("s")) {
        newHeight = Math.max(50, resizeStart.height + deltaY);
      }
      if (resizeHandle.includes("n")) {
        newHeight = Math.max(50, resizeStart.height - deltaY);
      }

      // For corner handles, maintain aspect ratio
      if (resizeHandle.length === 2) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = `${newHeight}px`;
      selectedImage.style.maxWidth = "none";

      // Update toolbar position
      const rect = selectedImage.getBoundingClientRect();
      setImageToolbarPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle("");

      // Sync content from paginated editor and trigger input to save
      if (paginatedEditorRef.current && editorRef.current) {
        const content = paginatedEditorRef.current.getContent();
        if (content) {
          editorRef.current.innerHTML = content;
          // Set flag to force immediate save (checked in handleInput)
          forceImmediateSaveRef.current = true;
          // Dispatch input event to trigger handleInput and save to history
          editorRef.current.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, selectedImage, resizeStart, resizeHandle]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    if (!showRuler) {
      setRulerAlignedLeft(null);
      return;
    }

    const computeAlignment = () => {
      if (!rulerContainerRef.current || !wrapperRef.current) {
        setRulerAlignedLeft(null);
        return;
      }

      const rulerRect = rulerContainerRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      let paddingLeft = 0;

      if (typeof window !== "undefined") {
        const styles = window.getComputedStyle(wrapperRef.current);
        paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
      }

      const relativeLeft = rulerRect.left - wrapperRect.left - paddingLeft;

      if (!Number.isFinite(relativeLeft)) {
        setRulerAlignedLeft(null);
        return;
      }

      setRulerAlignedLeft(relativeLeft);
    };

    computeAlignment();

    window.addEventListener("resize", computeAlignment);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => computeAlignment())
        : null;

    if (resizeObserver && rulerContainerRef.current) {
      resizeObserver.observe(rulerContainerRef.current);
    }
    if (resizeObserver && wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener("resize", computeAlignment);
      resizeObserver?.disconnect();
    };
  }, [showRuler]);

  // Ruler alignment is now handled by CSS flexbox centering - no dynamic shift needed
  const alignRulerToPage = useCallback(() => {
    // Intentionally left blank – ruler follows the page container via CSS
  }, []);

  const alignCenteredBlocksToRuler = useCallback(() => {
    const editorEl = editorRef.current;
    if (!editorEl || typeof window === "undefined") {
      return;
    }

    const pageRect = editorEl.getBoundingClientRect();
    if (!pageRect || !pageRect.width) {
      return;
    }

    const pxPerPoint = PAGE_WIDTH_PT
      ? pageRect.width / PAGE_WIDTH_PT
      : POINT_TO_PX;
    const pageCenterRelative = PAGE_CENTER_PT * pxPerPoint;

    const legacySelector = CENTERED_STYLE_SELECTORS.join(", ");
    const elements =
      editorEl.querySelectorAll<HTMLElement>(CENTERABLE_SELECTOR);

    elements.forEach((element) => {
      const matchesLegacy = legacySelector
        ? element.matches(legacySelector)
        : false;
      const computedAlign = window.getComputedStyle(element).textAlign;
      const isCenterAligned = computedAlign === "center";
      const shouldAlign = matchesLegacy || isCenterAligned;

      if (!shouldAlign) {
        if (
          element.hasAttribute("data-ruler-center") ||
          element.style.getPropertyValue("--center-shift")
        ) {
          element.style.removeProperty("--center-shift");
          element.removeAttribute("data-ruler-center");
        }
        return;
      }

      const hadCenterAttr =
        element.getAttribute("data-ruler-center") === "true";
      if (!hadCenterAttr) {
        element.setAttribute("data-ruler-center", "true");
      }

      // Temporarily clear the shift to get natural position
      element.style.removeProperty("--center-shift");
      void element.offsetHeight;

      const rect = element.getBoundingClientRect();
      if (!rect.width) {
        if (element.style.getPropertyValue("--center-shift") !== "0px") {
          element.style.setProperty("--center-shift", "0px");
        }
        return;
      }

      const elementCenterRelative = rect.left - pageRect.left + rect.width / 2;
      const shift = pageCenterRelative - elementCenterRelative;

      const currentShift = element.style.getPropertyValue("--center-shift");
      const shiftValue = `${shift}px`;
      if (currentShift !== shiftValue) {
        element.style.setProperty("--center-shift", shiftValue);
      }
    });
  }, []);

  const centerText = useCallback((targetElement?: HTMLElement | null) => {
    if (!editorRef.current) {
      return;
    }

    let element: HTMLElement | null | undefined = targetElement;

    if (!element && typeof window !== "undefined") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      let anchor: Node | null = selection.anchorNode;
      while (
        anchor &&
        anchor !== editorRef.current &&
        anchor.nodeType !== Node.ELEMENT_NODE
      ) {
        anchor = anchor.parentNode;
      }

      if (anchor && anchor instanceof Element) {
        element = anchor.closest(CENTERABLE_SELECTOR) as HTMLElement | null;
      }
    }

    if (!element) {
      return;
    }

    const pageRect = editorRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    if (!pageRect.width || !elementRect.width) {
      return;
    }

    element.style.removeProperty("--center-shift");
    void element.offsetWidth;

    const textCenter = elementRect.left - pageRect.left + elementRect.width / 2;
    const pageCenter = pageRect.width / 2;
    const shift = pageCenter - textCenter;

    element.setAttribute("data-ruler-center", "true");
    element.style.setProperty("--center-shift", `${shift}px`);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    alignRulerToPage();

    window.addEventListener("resize", alignRulerToPage);

    // Debounce the ResizeObserver to prevent rapid recalculations during paste/input
    let debounceTimer: NodeJS.Timeout;
    const debouncedAlign = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => alignRulerToPage(), 150);
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(debouncedAlign)
        : null;

    const observerTargets = [
      scrollShellRef.current,
      wrapperRef.current,
      pagesContainerRef.current,
      editorRef.current,
    ].filter((el): el is HTMLDivElement => Boolean(el));

    observerTargets.forEach((target) => resizeObserver?.observe(target));

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("resize", alignRulerToPage);
      resizeObserver?.disconnect();
    };
  }, [alignRulerToPage]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frame: number | null = null;
    const scheduleAlign = () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => {
        // Double RAF ensures layout is complete, particularly after stats panel updates
        window.requestAnimationFrame(() => {
          alignCenteredBlocksToRuler();
          frame = null;
        });
      });
    };

    scheduleAlign();

    window.addEventListener("resize", scheduleAlign);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleAlign())
        : null;

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => scheduleAlign())
        : null;

    const editorEl = editorRef.current;
    const rulerEl = rulerContainerRef.current;

    if (resizeObserver) {
      if (editorEl) {
        resizeObserver.observe(editorEl);
      }
      if (rulerEl) {
        resizeObserver.observe(rulerEl);
      }
    }

    if (mutationObserver && editorEl) {
      mutationObserver.observe(editorEl, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", scheduleAlign);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [alignCenteredBlocksToRuler, leftMargin, rightMargin, showRuler]);

  useEffect(() => {
    alignRulerToPage();
  }, [
    alignRulerToPage,
    pageCount,
    showThumbnailRail,
    showFindReplace,
    viewMode,
  ]);

  const updatePageSnippets = useCallback((pages: number) => {
    const safePages = Math.max(1, pages);
    const editor = editorRef.current;

    if (!editor) {
      setPageSnippets(Array.from({ length: safePages }, () => ""));
      return;
    }

    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const scrollOffset = wrapperRef.current?.scrollTop ?? 0;
    const blocks = Array.from(
      editor.querySelectorAll<HTMLElement>(
        "p, div, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, pre"
      )
    ).filter((block) => block.innerText && block.innerText.trim().length);

    const buckets = Array.from({ length: safePages }, () => "");

    if (blocks.length === 0) {
      buckets[0] = editor.innerText || "";
    } else {
      blocks.forEach((block) => {
        const text = block.innerText || "";
        if (!text.trim()) return;

        const rect = block.getBoundingClientRect();
        const relativeMid =
          rect.top - (wrapperRect?.top ?? 0) + scrollOffset + rect.height / 2;

        const bucketIndex = Math.min(
          Math.max(Math.floor(relativeMid / PAGE_HEIGHT_PX), 0),
          safePages - 1
        );

        buckets[bucketIndex] += `${text}\n`;
      });
    }

    setPageSnippets(buckets.map((chunk) => buildSnippet(chunk)));
  }, []);

  const recomputePagination = useCallback(() => {
    if (!editorRef.current) return;

    const contentHeight = editorRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
    setPageCount(pages);

    updatePageSnippets(pages);

    // Sync content to paginated editor ONLY if content differs
    // This prevents destroying the selection when content is already in sync
    if (paginatedEditorRef.current) {
      const currentPaginatedContent = paginatedEditorRef.current.getContent();
      const editorContent = editorRef.current.innerHTML;
      // Only sync if content is actually different
      if (currentPaginatedContent !== editorContent) {
        paginatedEditorRef.current.setContent(editorContent);
      }
    }
  }, [updatePageSnippets]);

  const insertPageBreakAtCursor = useCallback(() => {
    if (typeof window === "undefined") return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);

    // Check if selection is in the paginated editor
    const pageElements =
      paginatedEditorRef.current?.getPageContentElements() || [];
    const isInPaginatedEditor = pageElements.some((el) =>
      el.contains(range.commonAncestorContainer)
    );

    if (!isInPaginatedEditor) return false;

    const breakEl = document.createElement("div");
    breakEl.className = "page-break";
    range.collapse(true);
    range.insertNode(breakEl);

    // Move cursor after the break
    const afterRange = document.createRange();
    afterRange.setStartAfter(breakEl);
    afterRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(afterRange);

    return true;
  }, []);

  // Prevent typing in footer zones - auto insert page break
  const handleBeforeInput = useCallback(
    (e: InputEvent) => {
      if (!editorRef.current || e.inputType === "insertParagraph") return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.height === 0) return;

      const editorRect = editorRef.current.getBoundingClientRect();
      const caretY = rect.bottom - editorRect.top;

      // Check which page we're on
      const pageIndex = Math.floor(caretY / PAGE_HEIGHT_PX);
      const pageBottom = (pageIndex + 1) * PAGE_HEIGHT_PX - FOOTER_RESERVED_PX;

      // If we're within 5px of footer, insert page break
      if (caretY >= pageBottom - 5) {
        e.preventDefault();
        if (insertPageBreakAtCursor()) {
          // Re-insert the character after the break
          setTimeout(() => {
            if (e.data) {
              document.execCommand("insertText", false, e.data);
            }
          }, 0);
        }
      }
    },
    [insertPageBreakAtCursor]
  );

  // Format Painter state
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<{
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
  } | null>(null);

  // Styles Panel state
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [expandedStylesSections, setExpandedStylesSections] = useState<
    Set<string>
  >(new Set());
  const [documentStyles, setDocumentStyles] = useState<DocumentStylesState>(
    () => buildDefaultDocumentStyles()
  );

  // Active style template tracking
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Saved style templates - persisted to localStorage
  const [savedStyleTemplates, setSavedStyleTemplates] = useState<
    StyleTemplate[]
  >(() => {
    try {
      const saved = localStorage.getItem("quillpilot-style-templates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "quillpilot-style-templates",
        JSON.stringify(savedStyleTemplates)
      );
    } catch (e) {
      console.error("Failed to save style templates:", e);
    }
  }, [savedStyleTemplates]);

  // Handle style property change from color wheel
  const handleStylePropertyChange = useCallback(
    (
      styleKey: keyof DocumentStylesState,
      property: string,
      value: string | number
    ) => {
      setDocumentStyles((prev) => ({
        ...prev,
        [styleKey]: {
          ...prev[styleKey],
          [property]: value,
        },
      }));
    },
    []
  );

  // Save current styles as template
  const handleSaveStyleTemplate = useCallback(
    (name: string) => {
      const newTemplate: StyleTemplate = {
        id: `template-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        styles: { ...documentStyles },
      };
      setSavedStyleTemplates((prev) => [...prev, newTemplate]);
      setActiveTemplate(newTemplate.id);
    },
    [documentStyles]
  );

  // Apply a saved template
  const handleApplyStyleTemplate = useCallback((template: StyleTemplate) => {
    if (template.styles) {
      setDocumentStyles((prev) => ({
        ...prev,
        ...template.styles,
      }));
      setActiveTemplate(template.id);
    }
  }, []);

  // Delete a template
  const handleDeleteStyleTemplate = useCallback((templateId: string) => {
    setSavedStyleTemplates((prev) => prev.filter((t) => t.id !== templateId));
    setActiveTemplate((prev) => (prev === templateId ? null : prev));
  }, []);

  // Header/Footer state - preview panels removed, keeping export functionality
  const [showHeaderFooter] = useState(false);
  const [headerText, setHeaderText] = useState(
    "Lon Dailey — Manuscript Draft\nProject: Winterlight\nUpdated: January 2026"
  );
  const [footerText, setFooterText] = useState(
    "Confidential — Do Not Distribute"
  );
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [pageNumberPosition, setPageNumberPosition] = useState<
    "header" | "footer"
  >("footer");
  const [headerAlign, setHeaderAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("center");
  const [footerAlign, setFooterAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("center");
  // Facing pages: alternate left/right positioning for page numbers on odd/even pages
  const [facingPages, setFacingPages] = useState(false);

  // Notify parent of header/footer changes for export
  useEffect(() => {
    if (onHeaderFooterChange) {
      onHeaderFooterChange({
        headerText,
        footerText,
        showPageNumbers,
        pageNumberPosition,
        headerAlign,
        footerAlign,
        facingPages,
      });
    }
  }, [
    headerText,
    footerText,
    showPageNumbers,
    pageNumberPosition,
    headerAlign,
    footerAlign,
    facingPages,
    onHeaderFooterChange,
  ]);

  const toolbarDividerStyle = {
    width: "1px",
    height: "28px",
    backgroundColor: "#e0c392",
    opacity: 0.7,
    flexShrink: 0,
  } as const;

  // Character linking handler
  const linkSelectedTextToCharacter = useCallback(() => {
    if (!selectedCharacterId || !onCharacterLink) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      alert("Please select text to link to a character");
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      alert("Please select text to link to a character");
      return;
    }

    onCharacterLink(selectedText, selectedCharacterId);

    // Visual feedback
    alert(`Linked "${selectedText}" to character`);
    setShowCharacterPopover(false);
  }, [selectedCharacterId, onCharacterLink]);

  // Close character popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        characterPopoverRef.current &&
        !characterPopoverRef.current.contains(event.target as Node)
      ) {
        setShowCharacterPopover(false);
      }
    };

    if (showCharacterPopover) {
      // Use setTimeout to avoid the click that opened the popover from immediately closing it
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCharacterPopover]);

  // Sync firstLineIndent prop with documentStyles AND apply directly to DOM
  useEffect(() => {
    // Update the documentStyles state
    setDocumentStyles((prev) => ({
      ...prev,
      paragraph: {
        ...prev.paragraph,
        firstLineIndent: firstLineIndent,
      },
    }));

    // Apply directly to DOM for immediate visual feedback
    if (!editorRef.current) return;

    // Update CSS variable
    editorRef.current.style.setProperty(
      "--first-line-indent",
      `${firstLineIndent}px`
    );

    // Directly update all standard paragraphs
    const paragraphs = editorRef.current.querySelectorAll(
      "p:not(.screenplay-block):not(.title-content):not(.book-title):not(.subtitle):not(.chapter-heading):not(.image-paragraph):not(.doc-title):not(.doc-subtitle)"
    );
    paragraphs.forEach((p) => {
      (p as HTMLElement).style.setProperty(
        "text-indent",
        `${firstLineIndent}px`,
        "important"
      );
    });
  }, [firstLineIndent]);

  // Gap between pages in pixels
  const PAGE_GAP = 24;

  // Calculate page count based on content height (accounting for page gaps)
  useEffect(() => {
    recomputePagination();

    // Recalculate on input and resize
    const resizeObserver = new ResizeObserver(() => recomputePagination());
    if (editorRef.current) {
      resizeObserver.observe(editorRef.current);
    }

    // Also recalculate on mutation (content changes)
    const mutationObserver = new MutationObserver(() => recomputePagination());
    if (editorRef.current) {
      mutationObserver.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [recomputePagination]);

  // Analyze content for spacing and dual-coding
  const analyzeContent = useCallback((text: string) => {
    if (!editorRef.current) return;

    // Get paragraphs from the actual DOM to match rendering
    const domParagraphs = Array.from(
      editorRef.current.querySelectorAll("p, div")
    );
    // Map to {text, domIndex} to preserve original DOM indices after filtering
    const paragraphsWithIndices = domParagraphs
      .map((p, domIndex) => ({
        text: (p as HTMLElement).innerText || "",
        domIndex,
      }))
      .filter((p) => p.text.trim());

    const spacingData: AnalysisData["spacing"] = [];
    const visualsData: AnalysisData["visuals"] = [];

    // For very large documents (>2000 paragraphs / ~800 pages), sample analysis
    // For medium-large documents (500-2000 paragraphs), analyze all but limit dual-coding
    const isVeryLarge = paragraphsWithIndices.length > 2000;
    const isLarge = paragraphsWithIndices.length > 500;

    if (isVeryLarge) {
      // Sample every 4th paragraph for extremely large documents
      paragraphsWithIndices.forEach(({ text: para, domIndex }, arrayIndex) => {
        if (arrayIndex % 4 === 0) {
          const wordCount = countWords(para);
          // Skip paragraphs with fewer than 5 words
          if (wordCount >= 5) {
            const spacingInfo = analyzeParagraphSpacing(wordCount);
            const passiveInfo = detectPassiveVoice(para);
            spacingData.push({
              index: domIndex, // Use original DOM index
              wordCount,
              tone: spacingInfo.tone,
              label: spacingInfo.shortLabel,
              hasPassive: passiveInfo.hasPassive,
              passiveCount: passiveInfo.count,
            });
          }

          // Also analyze sensory details for sampled paragraphs with 50+ words
          if (wordCount >= 50) {
            const suggestions = SensoryDetailAnalyzer.analyzeParagraph(
              para,
              domIndex // Use original DOM index
            );
            if (suggestions.length > 0) {
              visualsData.push({ index: domIndex, suggestions });
            }
          }
        }
      });
    } else {
      // Normal or large documents: analyze all spacing, limit dual-coding for large docs
      paragraphsWithIndices.forEach(({ text: para, domIndex }) => {
        const wordCount = countWords(para);

        // Skip paragraphs with fewer than 5 words
        if (wordCount >= 5) {
          const spacingInfo = analyzeParagraphSpacing(wordCount);
          const passiveInfo = detectPassiveVoice(para);
          spacingData.push({
            index: domIndex, // Use original DOM index
            wordCount,
            tone: spacingInfo.tone,
            label: spacingInfo.shortLabel,
            hasPassive: passiveInfo.hasPassive,
            passiveCount: passiveInfo.count,
          });
        }

        // For large docs, analyze sensory details for paragraphs with 50+ words
        // For normal docs, analyze all paragraphs with >10 chars
        const shouldAnalyzeDualCoding = isLarge
          ? wordCount >= 50
          : para.length >= 10;

        if (shouldAnalyzeDualCoding) {
          const suggestions = SensoryDetailAnalyzer.analyzeParagraph(
            para,
            domIndex // Use original DOM index
          );
          if (suggestions.length > 0) {
            visualsData.push({ index: domIndex, suggestions });
          }
        }
      });
    }

    setAnalysis({ spacing: spacingData, visuals: visualsData });

    // Calculate statistics (lightweight for all sizes)
    // Use regex to match ChapterCheckerV2 logic and handle smart quotes
    const words = (text.match(/[A-Za-z0-9'’]+/g) || []).length;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute

    // Skip complex calculations for very large documents (>2000 paragraphs)
    let readingLevel = 0;
    if (!isVeryLarge) {
      const sentences = text
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0).length;
      const syllables = text.split(/\s+/).reduce((count, word) => {
        return count + Math.max(1, word.match(/[aeiouy]{1,2}/gi)?.length || 1);
      }, 0);
      readingLevel =
        sentences > 0 && words > 0
          ? 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
          : 0;
    }

    setStatistics({
      words,
      characters,
      paragraphs: paragraphsWithIndices.length,
      readingTime,
      readingLevel: Math.max(0, Math.round(readingLevel * 10) / 10),
    });
  }, []);

  // DOM-based indicator rendering for paginated editor
  useEffect(() => {
    // Use a timeout to let the DOM update after repagination
    const timeoutId = setTimeout(() => {
      // console.log("[Indicators] useEffect triggered", {
      //   showSpacingIndicators,
      //   showStyleLabels,
      //   showVisualSuggestions,
      //   focusMode,
      //   isFreeMode,
      //   pageCount,
      // });
      // console.log("[Indicators] Analysis data:", {
      //   spacingCount: analysis.spacing.length,
      //   visualsCount: analysis.visuals.length,
      //   spacingFirst5: analysis.spacing.slice(0, 5),
      //   visualsFirst5: analysis.visuals.slice(0, 5),
      // });

      // Clean up existing indicators
      const existingIndicators = document.querySelectorAll(
        ".style-indicator-dot"
      );
      existingIndicators.forEach((el) => el.remove());

      if (!showSpacingIndicators || !showStyleLabels) {
        // console.log(
        //   "[Indicators] Early return - showSpacingIndicators:",
        //   showSpacingIndicators,
        //   "showStyleLabels:",
        //   showStyleLabels
        // );
        return;
      }
      if (!isFreeMode && focusMode) {
        // console.log(
        //   "[Indicators] Early return - focus mode enabled in paid mode"
        // );
        return;
      }

      const pageElements =
        paginatedEditorRef.current?.getPageContentElements() || [];
      // console.log("[Indicators] Page elements count:", pageElements.length);
      if (pageElements.length === 0) return;

      // Build a lookup by normalized text content (first 100 chars)
      const getTextKey = (text: string) =>
        text.trim().substring(0, 100).toLowerCase();

      // For spacing analysis, we check each paragraph in the DOM
      // We'll do a simple per-paragraph analysis rather than relying on indices
      let dotsAdded = 0;

      pageElements.forEach((pageEl, pageIdx) => {
        const pageDiv = pageEl.parentElement;
        if (!pageDiv) {
          // console.log("[Indicators] No pageDiv for page", pageIdx);
          return;
        }

        const paragraphs = Array.from(pageEl.querySelectorAll("p, div"));
        // if (pageIdx === 0) {
        //   console.log(
        //     "[Indicators] Page 0 first para text:",
        //     paragraphs[0]?.textContent?.substring(0, 50)
        //   );
        // }

        paragraphs.forEach((para) => {
          const paraEl = para as HTMLElement;
          const text = paraEl.textContent || "";
          const wordCount = text
            .split(/\s+/)
            .filter((w) => w.trim().length > 0).length;
          const paraTop = paraEl.offsetTop;

          // Skip very short paragraphs
          if (wordCount < 5) return;

          let hasOrangeDot = false;
          let hasPurpleDot = false;

          // Check for long paragraph (>150 words) - show orange dot
          if (wordCount > 150) {
            const dot = document.createElement("div");
            dot.className = "style-indicator-dot";
            dot.title = `Long paragraph · ${wordCount} words - consider breaking up`;
            dot.style.cssText = `
              position: absolute;
              top: ${paraTop + 4}px;
              left: 4px;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #f97316;
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
              pointer-events: auto;
              z-index: 20;
            `;
            pageDiv.appendChild(dot);
            dotsAdded++;
            hasOrangeDot = true;
          }

          // Check for passive voice - simple pattern matching
          const passivePatterns = [
            /\b(was|were|is|are|been|being|be)\s+\w+ed\b/gi,
            /\b(was|were|is|are|been|being|be)\s+\w+en\b/gi,
          ];
          let passiveCount = 0;
          passivePatterns.forEach((pattern) => {
            const matches = text.match(pattern);
            if (matches) passiveCount += matches.length;
          });

          if (passiveCount > 0) {
            const dot = document.createElement("div");
            dot.className = "style-indicator-dot";
            dot.title = `Passive voice detected (${passiveCount}×) - consider active voice`;
            dot.style.cssText = `
              position: absolute;
              top: ${paraTop + 4}px;
              left: ${hasOrangeDot ? "16px" : "4px"};
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #8b5cf6;
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
              pointer-events: auto;
              z-index: 20;
            `;
            pageDiv.appendChild(dot);
            dotsAdded++;
            hasPurpleDot = true;
          }

          // Check for visual/sensory suggestions if enabled
          if (showVisualSuggestions) {
            // Simple heuristic: check if paragraph lacks sensory/descriptive words
            const sensoryWords = [
              /\b(saw|see|seen|looked|glanced|stared|watched|observed|noticed)\b/gi,
              /\b(heard|listened|sound|noise|voice|whisper|shout|echo)\b/gi,
              /\b(felt|touch|warm|cold|soft|rough|smooth|texture)\b/gi,
              /\b(smell|scent|odor|aroma|fragrance|stench)\b/gi,
              /\b(taste|flavor|sweet|bitter|sour|salty)\b/gi,
              /\b(color|red|blue|green|yellow|bright|dark|pale|vivid)\b/gi,
            ];

            let hasSensoryWords = false;
            for (const pattern of sensoryWords) {
              if (pattern.test(text)) {
                hasSensoryWords = true;
                break;
              }
            }

            // Only suggest if paragraph is narrative (has action verbs) but lacks sensory detail
            const hasActionVerbs =
              /\b(walked|ran|moved|went|came|turned|opened|closed|grabbed|threw|hit|kicked)\b/gi.test(
                text
              );

            if (!hasSensoryWords && hasActionVerbs && wordCount > 30) {
              const dot = document.createElement("div");
              dot.className = "style-indicator-dot";
              dot.title =
                "Consider adding sensory details (sight, sound, smell, touch, taste)";
              dot.style.cssText = `
                position: absolute;
                top: ${paraTop + 4}px;
                right: 4px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #eab308;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                pointer-events: auto;
                z-index: 20;
              `;
              pageDiv.appendChild(dot);
              dotsAdded++;
            }
          }
        });
      });

      // console.log("[Indicators] Total dots added:", dotsAdded);
    }, 500); // Wait 500ms for DOM to settle after repagination

    // Cleanup on unmount or when deps change
    return () => {
      clearTimeout(timeoutId);
      const indicators = document.querySelectorAll(".style-indicator-dot");
      indicators.forEach((el) => el.remove());
    };
  }, [
    analysis,
    showSpacingIndicators,
    showVisualSuggestions,
    showStyleLabels,
    focusMode,
    isFreeMode,
    pageCount,
  ]);

  // Pilcrow markers feature - cleanup only
  // The pilcrow/middot feature has been disabled because it conflicts with
  // contentEditable behavior and causes cursor jumping on Enter key.
  // This effect just cleans up any leftover DOM elements from previous implementations.
  useEffect(() => {
    // Clean up any leftover pilcrow DOM elements from previous implementations
    document.querySelectorAll(".pilcrow-marker").forEach((el) => el.remove());
    document.querySelectorAll(".space-dot").forEach((span) => {
      const text = span.getAttribute("data-original") || span.textContent || "";
      if (span.parentNode) {
        const textNode = document.createTextNode(text === "·" ? " " : text);
        span.parentNode.replaceChild(textNode, span);
      }
    });
    document
      .querySelectorAll(".show-spaces")
      .forEach((el) => el.classList.remove("show-spaces"));

    // Remove any pilcrow style element
    const styleEl = document.getElementById("pilcrow-style");
    if (styleEl) {
      styleEl.remove();
    }
  }, []);

  // Save to history
  const saveToHistory = useCallback((html: string) => {
    if (isUndoRedoRef.current) {
      // Don't reset immediately - let it stay true until all async operations complete
      return;
    }

    // Remove any history after current index
    historyRef.current = historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    );

    // Add new state
    historyRef.current.push(html);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history to 50 states
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Double-click handler for removing page breaks
  // Page break double-click removal is now handled by PaginatedEditor's onPageBreakRemove callback

  // Handle content changes
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    // First, sync content from paginated editor to editorRef if paginated editor has content
    // This ensures we capture any changes made directly in the paginated editor
    if (paginatedEditorRef.current) {
      const paginatedContent = paginatedEditorRef.current.getContent();
      if (paginatedContent) {
        editorRef.current.innerHTML = paginatedContent;
      }
    }

    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;

    // Debounce save to history to prevent performance issues
    // Skip if we're in an undo/redo operation
    if (!isUndoRedoRef.current) {
      // Check if we need immediate save (e.g., after image resize)
      if (forceImmediateSaveRef.current) {
        forceImmediateSaveRef.current = false;
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveToHistory(html);
      } else {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveToHistory(html);
        }, 500);
      }
    }

    // Notify parent immediately so stats/UI stay in sync
    onUpdate?.({ html, text });

    // Debounce heavier analysis work
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeContent(text);
    }, 300);
    recomputePagination();
  }, [onUpdate, saveToHistory, analyzeContent, recomputePagination]);

  // Insert column layout at cursor
  const insertColumnLayout = useCallback(
    (numColumns: number) => {
      // Create column container HTML with side-by-side editable areas
      let columnsHtml = `<div class="column-container" contenteditable="false" style="display: flex; gap: 20px; margin: 1rem 0; padding: 10px; border: 1px dashed #e0c392; border-radius: 4px; background: #fffef8;">`;

      for (let i = 0; i < numColumns; i++) {
        columnsHtml += `<div class="column-content" contenteditable="true" style="flex: 1; min-width: 0; padding: 10px; border: 1px solid #e8dcc8; border-radius: 4px; background: white; min-height: 100px;"><p>Column ${
          i + 1
        } content...</p></div>`;
      }

      columnsHtml += `</div><p><br></p>`;

      // Focus paginated editor and insert
      paginatedEditorRef.current?.focus();
      paginatedEditorRef.current?.execCommand("insertHTML", columnsHtml);

      // Sync changes back to editorRef
      setTimeout(() => {
        if (paginatedEditorRef.current && editorRef.current) {
          editorRef.current.innerHTML = paginatedEditorRef.current.getContent();
          handleInput();
        }
      }, 100);

      setShowColumnDropdown(false);
    },
    [handleInput]
  );

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  // Initialize content (only on mount)
  useEffect(() => {
    console.log(
      "[CustomEditor] Init effect running, content length:",
      content?.length
    );

    if (content) {
      const isHtml = /<[^>]+>/.test(content);

      // Use requestAnimationFrame to allow PaginatedEditor to mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          let htmlContent: string;
          if (isHtml) {
            htmlContent = content;
          } else {
            htmlContent = content
              .split("\n\n")
              .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
              .join("");
          }

          // Update PaginatedEditor with the content
          if (paginatedEditorRef.current) {
            paginatedEditorRef.current.setContent(htmlContent);
          } else {
            // Retry after a short delay if ref not ready
            setTimeout(() => {
              if (paginatedEditorRef.current) {
                paginatedEditorRef.current.setContent(htmlContent);
              }
            }, 100);
          }

          // Initialize history with initial content
          historyRef.current = [htmlContent];
          historyIndexRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);

          // Defer analysis to avoid blocking UI
          setTimeout(() => {
            const editorContent =
              paginatedEditorRef.current?.getContent() || "";
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = editorContent;
            const text = tempDiv.innerText;
            analyzeContent(text);
          }, 100);
        });
      });
    } else {
      // Initialize empty editor with a paragraph
      const emptyContent = `<p><br></p>`;

      // Update PaginatedEditor with empty content after mount
      requestAnimationFrame(() => {
        if (paginatedEditorRef.current) {
          paginatedEditorRef.current.setContent(emptyContent);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - content is captured from closure

  useEffect(() => {
    if (!onLayoutChange) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const notifyLayout = () => {
      if (!editorRef.current) {
        return;
      }
      const rect = editorRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        onLayoutChange({ width: rect.width, left: rect.left });
      }
    };

    notifyLayout();

    if (typeof ResizeObserver !== "undefined" && editorRef.current) {
      const observer = new ResizeObserver(() => notifyLayout());
      observer.observe(editorRef.current);
      return () => observer.disconnect();
    }

    const handleResize = () => notifyLayout();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onLayoutChange]);

  // Apply concept underlining
  useEffect(() => {
    if (!editorRef.current) return;

    const applyConceptUnderlines = () => {
      if (!editorRef.current) return;

      // Remove existing wrappers so repeated passes don't nest spans
      const existingUnderlines =
        editorRef.current.querySelectorAll(".concept-underline");
      existingUnderlines.forEach((span) => {
        const fragment = document.createDocumentFragment();
        while (span.firstChild) {
          fragment.appendChild(span.firstChild);
        }
        span.replaceWith(fragment);
      });

      if (concepts.length === 0) {
        return;
      }

      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        if (!text.trim()) return;

        const matches: {
          start: number;
          end: number;
          concept: string;
          canonicalConcept: string;
        }[] = [];

        // Sort concepts by length (longest first) to avoid partial matches
        const sortedConcepts = [...concepts].sort(
          (a, b) => b.length - a.length
        );

        sortedConcepts.forEach((concept) => {
          const escapedConcept = concept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b(${escapedConcept})\\b`, "gi");

          let match;
          while ((match = regex.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            // Check for overlap with existing matches
            const isOverlapping = matches.some(
              (m) => start < m.end && end > m.start
            );

            if (!isOverlapping) {
              matches.push({
                start,
                end,
                concept: match[0], // The actual text in the document
                canonicalConcept: concept, // The concept ID/name
              });
            }
          }
        });

        if (matches.length === 0) return;

        // Sort matches by position
        matches.sort((a, b) => a.start - b.start);

        let newHtml = "";
        let lastIndex = 0;

        const escapeHtml = (str: string) => {
          return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        matches.forEach((m) => {
          // Append text before match (escaped)
          newHtml += escapeHtml(text.substring(lastIndex, m.start));

          // Append replacement
          newHtml += `<span class="concept-underline" data-concept="${escapeHtml(
            m.canonicalConcept
          )}">${escapeHtml(m.concept)}</span>`;

          lastIndex = m.end;
        });

        // Append remaining text (escaped)
        newHtml += escapeHtml(text.substring(lastIndex));

        if (textNode.parentElement) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = newHtml;
          const fragment = document.createDocumentFragment();
          while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
          }
          textNode.parentElement.replaceChild(fragment, textNode);
        }
      });

      // Add click handlers to underlined concepts
      const underlinedElements =
        editorRef.current.querySelectorAll(".concept-underline");
      underlinedElements.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const conceptName = (e.target as HTMLElement).getAttribute(
            "data-concept"
          );
          if (conceptName && onConceptClick) {
            onConceptClick(conceptName);
          }
        });
      });
    };

    // Delay to ensure content is loaded
    const timer = setTimeout(applyConceptUnderlines, 100);
    return () => clearTimeout(timer);
  }, [concepts, content, onConceptClick]);

  // Undo function
  const performUndo = useCallback(() => {
    console.log(
      "[performUndo] Called! historyIndex:",
      historyIndexRef.current,
      "historyLength:",
      historyRef.current.length,
      "paginatedEditorRef.current:",
      paginatedEditorRef.current
    );

    if (!paginatedEditorRef.current || historyIndexRef.current <= 0) {
      console.log(
        "[performUndo] Early return - paginatedEditorRef:",
        !!paginatedEditorRef.current,
        "historyIndex:",
        historyIndexRef.current
      );
      return;
    }

    console.log(
      "[performUndo] Proceeding with undo, decrementing index from",
      historyIndexRef.current
    );

    // Save current scroll position
    const scrollTop = wrapperRef.current?.scrollTop || 0;

    historyIndexRef.current--;
    const html = historyRef.current[historyIndexRef.current];

    isUndoRedoRef.current = true;

    // Restore content to PaginatedEditor
    paginatedEditorRef.current.setContent(html);

    const text = paginatedEditorRef.current
      .getContent()
      .replace(/<[^>]*>/g, "");
    onUpdate?.({ html, text });
    analyzeContent(text);
    recomputePagination();

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = scrollTop;
      }
    });

    // Reset the flag after a delay to ensure all async operations complete
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [onUpdate, analyzeContent, recomputePagination]);

  // Redo function
  const performRedo = useCallback(() => {
    if (
      !paginatedEditorRef.current ||
      historyIndexRef.current >= historyRef.current.length - 1
    )
      return;

    // Save current scroll position
    const scrollTop = wrapperRef.current?.scrollTop || 0;

    historyIndexRef.current++;
    const html = historyRef.current[historyIndexRef.current];

    isUndoRedoRef.current = true;

    // Restore content to PaginatedEditor
    paginatedEditorRef.current.setContent(html);

    const text = paginatedEditorRef.current
      .getContent()
      .replace(/<[^>]*>/g, "");
    onUpdate?.({ html, text });
    analyzeContent(text);
    recomputePagination();

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = scrollTop;
      }
    });

    // Reset the flag after a delay to ensure all async operations complete
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [onUpdate, analyzeContent, recomputePagination]);

  const ensureEditorSelection = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    // Check if selection is in the paginated editor
    const pageElements =
      paginatedEditorRef.current?.getPageContentElements() || [];
    const scrollContainer = paginatedEditorRef.current?.getScrollContainer();
    const isInPaginatedEditor =
      scrollContainer?.contains(selection.anchorNode) ||
      pageElements.some((el) => el.contains(selection.anchorNode));

    // Check if selection is in the hidden editorRef
    const isInEditorRef = editorRef.current?.contains(selection.anchorNode);

    if (selection.rangeCount > 0 && (isInPaginatedEditor || isInEditorRef)) {
      return true;
    }

    // Try to restore from saved selection
    if (lastSelectionRangeRef.current) {
      try {
        const restoredRange = lastSelectionRangeRef.current.cloneRange();
        selection.removeAllRanges();
        selection.addRange(restoredRange);

        // Focus the appropriate container based on where the saved selection was
        const savedRangeContainer = restoredRange.commonAncestorContainer;
        const savedInPaginated = pageElements.some((el) =>
          el.contains(savedRangeContainer)
        );

        if (savedInPaginated && pageElements.length > 0) {
          // Find which page contains the selection and focus it
          for (const pageEl of pageElements) {
            if (pageEl.contains(savedRangeContainer)) {
              (pageEl as HTMLElement).focus({ preventScroll: true });
              break;
            }
          }
        } else if (editorRef.current) {
          editorRef.current.focus({ preventScroll: true });
        }

        lastSelectionRangeRef.current = restoredRange.cloneRange();
        return true;
      } catch (e) {
        console.warn("[ensureEditorSelection] Failed to restore selection:", e);
      }
    }

    // Fallback: create a new selection at the end of the first page or editor
    if (pageElements.length > 0) {
      const firstPage = pageElements[0] as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(firstPage);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      firstPage.focus({ preventScroll: true });
      lastSelectionRangeRef.current = range.cloneRange();
      return true;
    } else if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      editorRef.current.focus({ preventScroll: true });
      lastSelectionRangeRef.current = range.cloneRange();
      return true;
    }

    return false;
  }, []);

  const snapshotCurrentSelection = useCallback(() => {
    if (typeof window === "undefined" || !editorRef.current) {
      return null;
    }

    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      editorRef.current.contains(selection.anchorNode)
    ) {
      const snapshot = selection.getRangeAt(0).cloneRange();
      lastSelectionRangeRef.current = snapshot;
      return snapshot;
    }

    return null;
  }, []);

  // Update format state
  const updateFormatState = useCallback(() => {
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));

    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let node: HTMLElement | null =
        selection.anchorNode.nodeType === Node.TEXT_NODE
          ? selection.anchorNode.parentElement
          : (selection.anchorNode as HTMLElement);

      // List of custom style classes to detect
      const customStyleClasses = [
        "book-title",
        "doc-title",
        "chapter-heading",
        "subtitle",
        "doc-subtitle",
        "lead-paragraph",
        "pullquote",
        "quote",
        "intense-quote",
        "caption",
        "byline",
        "dateline",
        "press-lead",
        "nut-graf",
        "fact-box",
        "hero-headline",
        "marketing-subhead",
        "feature-callout",
        "testimonial",
        "cta-block",
        "api-heading",
        "code-reference",
        "warning-note",
        "success-note",
        "abstract",
        "keywords",
        "bibliography",
        "references",
        "appendix",
        "footnote",
        "citation",
        "figure-caption",
        "table-title",
        "equation",
        "author-info",
        "date-info",
        "address",
        "salutation",
        "closing",
        "signature",
        "sidebar",
        "callout",
        "memo-heading",
        "subject-line",
        "executive-summary",
        "part-title",
        "epigraph",
        "dedication",
        "acknowledgments",
        "copyright",
        "verse",
        "front-matter",
        "scene-break",
        "afterword",
        "scene-heading",
        "action",
        "character",
        "dialogue",
        "parenthetical",
        "transition",
        "shot",
        "lyric",
        "beat",
      ];

      // Check for screenplay blocks first (they use data-block attribute)
      while (node && !node.classList?.contains("paginated-page-content")) {
        // Check for screenplay block
        if (node.classList?.contains("screenplay-block")) {
          const blockType = node.getAttribute("data-block");
          if (blockType) {
            setBlockType(blockType);
            return;
          }
        }

        // Check for custom style classes
        for (const styleClass of customStyleClasses) {
          if (node.classList?.contains(styleClass)) {
            setBlockType(styleClass);
            return;
          }
        }

        // Check for basic HTML tags
        const tag = node.tagName?.toLowerCase();
        if (
          ["h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre"].includes(
            tag
          )
        ) {
          setBlockType(tag);
          return;
        }

        // For paragraph, only set if no custom class found
        if (tag === "p" && !node.className) {
          setBlockType("p");
          return;
        }

        node = node.parentElement;
      }

      // Default to paragraph if nothing found
      setBlockType("p");
    }
  }, []);

  // Format text
  const formatText = useCallback(
    (command: string, value?: string) => {
      console.log(
        `[formatText] Called with command: ${command}, value: ${value}`
      );

      // Check if there's a selection in the paginated editor
      let selection = window.getSelection();

      // If no selection or selection is outside editor, try to restore from lastSelectionRangeRef
      const scrollContainer = paginatedEditorRef.current?.getScrollContainer();
      const pageElements =
        paginatedEditorRef.current?.getPageContentElements() || [];

      let isInPaginatedEditor =
        selection &&
        selection.rangeCount > 0 &&
        (scrollContainer?.contains(selection.anchorNode) ||
          pageElements.some((el) => el.contains(selection!.anchorNode)));

      // If selection is not in paginated editor, try restoring from saved range
      if (!isInPaginatedEditor && lastSelectionRangeRef.current) {
        console.log(
          `[formatText] Restoring selection from lastSelectionRangeRef`
        );
        try {
          selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(lastSelectionRangeRef.current.cloneRange());
          }
          // Re-check if selection is now in paginated editor
          isInPaginatedEditor =
            selection &&
            selection.rangeCount > 0 &&
            (scrollContainer?.contains(selection.anchorNode) ||
              pageElements.some((el) => el.contains(selection!.anchorNode)));
        } catch (e) {
          console.warn(`[formatText] Failed to restore selection:`, e);
        }
      }

      if (!selection || selection.rangeCount === 0) {
        console.warn(
          `[CustomEditor] Skipped format command "${command}" – no selection.`
        );
        return;
      }

      // Paragraph-level commands (justify) work with just a caret, not a text selection
      const isParagraphCommand =
        command.startsWith("justify") ||
        command === "insertUnorderedList" ||
        command === "insertOrderedList";

      console.log(
        `[formatText] Selection found, collapsed: ${selection.isCollapsed}, isParagraphCommand: ${isParagraphCommand}`,
        selection.toString().substring(0, 50)
      );

      console.log(
        `[formatText] isInPaginatedEditor: ${isInPaginatedEditor}, scrollContainer exists: ${!!scrollContainer}, pageElements: ${
          pageElements.length
        }`
      );

      if (!isInPaginatedEditor) {
        // Fall back to old behavior with editorRef
        if (!ensureEditorSelection()) {
          console.warn(
            `[CustomEditor] Skipped format command "${command}" – no active editor selection.`
          );
          return;
        }
      }

      // Tell PaginatedEditor to skip the next repagination (triggered by onInput from execCommand)
      // This preserves the selection
      paginatedEditorRef.current?.setSkipNextRepagination(true);

      try {
        console.log(
          `[formatText] Executing document.execCommand("${command}")`
        );
        const result = document.execCommand(command, false, value);
        console.log(`[formatText] execCommand result: ${result}`);
      } catch (error) {
        console.error(
          `[CustomEditor] execCommand failed for "${command}"`,
          error
        );
        // Reset the skip flag on error
        paginatedEditorRef.current?.setSkipNextRepagination(false);
        return;
      }

      updateFormatState();

      // Sync changes from paginated editor to editorRef
      // Don't call full handleInput() - just sync content and notify parent
      // This avoids recomputePagination which would destroy the selection
      if (
        isInPaginatedEditor &&
        paginatedEditorRef.current &&
        editorRef.current
      ) {
        // Save current selection before syncing
        const currentSelection = window.getSelection();
        let savedRange: Range | null = null;
        if (currentSelection && currentSelection.rangeCount > 0) {
          savedRange = currentSelection.getRangeAt(0).cloneRange();
        }

        const content = paginatedEditorRef.current.getContent();
        console.log(`[formatText] Syncing content, length: ${content.length}`);
        editorRef.current.innerHTML = content;
        const text = editorRef.current.innerText;

        // Notify parent
        onUpdate?.({ html: content, text });

        // Debounced save to history
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveToHistory(content);
        }, 500);

        // Immediately try to focus (before requestAnimationFrame)
        console.log(`[formatText] About to restore focus`);

        // Restore selection and focus using requestAnimationFrame to ensure DOM is settled
        requestAnimationFrame(() => {
          console.log(
            `[formatText] In requestAnimationFrame, savedRange exists: ${!!savedRange}`
          );
          if (savedRange) {
            try {
              const sel = window.getSelection();
              if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRange);
                console.log(`[formatText] Restored selection range`);
              }
              // Also ensure focus is on the editor element containing the selection
              const anchorElement = savedRange.startContainer.parentElement;
              if (anchorElement) {
                const editableParent = anchorElement.closest(
                  '[contenteditable="true"]'
                );
                if (editableParent instanceof HTMLElement) {
                  editableParent.focus();
                  console.log(`[formatText] Focused editableParent`);
                } else {
                  paginatedEditorRef.current?.focus();
                  console.log(
                    `[formatText] Focused paginatedEditorRef (no editableParent)`
                  );
                }
              } else {
                paginatedEditorRef.current?.focus();
                console.log(
                  `[formatText] Focused paginatedEditorRef (no anchorElement)`
                );
              }
            } catch (e) {
              // If selection restoration fails, just focus the editor
              console.log(
                `[formatText] Error restoring selection, focusing editor`,
                e
              );
              paginatedEditorRef.current?.focus();
            }
          } else {
            // No saved range, just focus
            console.log(
              `[formatText] No savedRange, focusing paginatedEditorRef`
            );
            paginatedEditorRef.current?.focus();
          }
        });
      } else {
        handleInput();
      }
    },
    [
      ensureEditorSelection,
      handleInput,
      updateFormatState,
      onUpdate,
      saveToHistory,
    ]
  );

  const replaceFontTagsWithStyledSpans = useCallback(
    (faces: string[], cssFamily: string): HTMLSpanElement[] => {
      // Look for font elements in paginated editor first, then fallback to editorRef
      let editorElement: HTMLElement | null = null;
      const scrollContainer = scrollShellRef.current;
      if (
        scrollContainer &&
        scrollContainer.querySelectorAll("font[face]").length > 0
      ) {
        editorElement = scrollContainer as HTMLElement;
      } else {
        editorElement = editorRef.current;
      }

      if (!editorElement || faces.length === 0) {
        return [];
      }

      const normalizedTargets = new Set(
        faces.map((face) => normalizeFontName(face))
      );
      const createdSpans: HTMLSpanElement[] = [];

      const fontNodes = editorElement.querySelectorAll("font[face]");
      fontNodes.forEach((fontNode) => {
        const faceAttr = fontNode.getAttribute("face");
        if (!faceAttr) return;

        const normalizedFace = normalizeFontName(faceAttr);
        if (!normalizedTargets.has(normalizedFace)) return;

        if (cssFamily && cssFamily.trim().length > 0) {
          const span = document.createElement("span");
          span.style.fontFamily = cssFamily;
          while (fontNode.firstChild) {
            span.appendChild(fontNode.firstChild);
          }
          fontNode.parentNode?.replaceChild(span, fontNode);
          createdSpans.push(span);
        } else {
          const fragment = document.createDocumentFragment();
          while (fontNode.firstChild) {
            fragment.appendChild(fontNode.firstChild);
          }
          fontNode.parentNode?.replaceChild(fragment, fontNode);
        }
      });

      // Sync content back to editorRef if we modified paginated editor
      if (
        scrollContainer &&
        editorElement === scrollContainer &&
        paginatedEditorRef.current &&
        editorRef.current
      ) {
        editorRef.current.innerHTML = paginatedEditorRef.current.getContent();
      }

      return createdSpans;
    },
    []
  );

  useEffect(() => {
    if (hasMigratedLegacyFontsRef.current) return;

    if (!editorRef.current) return;

    let modified = false;

    FONT_FAMILY_OPTIONS.forEach((option) => {
      const spans = replaceFontTagsWithStyledSpans(
        option.matchFaces,
        option.cssFamily
      );
      if (spans.length > 0) {
        modified = true;
      }
    });

    if (modified) {
      setTimeout(() => handleInput(), 0);
    }

    hasMigratedLegacyFontsRef.current = true;
  }, [handleInput, replaceFontTagsWithStyledSpans]);

  // Change block type (heading, paragraph, etc.)
  const changeBlockType = useCallback(
    (tag: string) => {
      if (!ensureEditorSelection()) {
        console.warn(
          `[CustomEditor] Unable to change block type to "${tag}" – no active editor selection.`
        );
        return;
      }
      // Screenplay elements use custom tags
      const screenplayElements = [
        "scene-heading",
        "action",
        "character",
        "dialogue",
        "parenthetical",
        "transition",
        "shot",
        "lyric",
        "beat",
      ];

      // Custom paragraph styles (not native HTML tags)
      const customParagraphStyles = [
        "paragraph", // Reset to normal paragraph
        "title",
        "subtitle",
        "book-title",
        "chapter-heading",
        "part-title",
        "epigraph",
        "dedication",
        "acknowledgments",
        "copyright",
        "verse",
        "lead-paragraph",
        "pullquote",
        "caption",
        "abstract",
        "keywords",
        "bibliography",
        "references",
        "appendix",
        "footnote",
        "citation",
        "figure-caption",
        "table-title",
        "equation",
        "author-info",
        "date-info",
        "address",
        "salutation",
        "closing",
        "signature",
        "sidebar",
        "callout",
        "memo-heading",
        "subject-line",
        "executive-summary",
        "front-matter",
        "scene-break",
        "afterword",
        "press-lead",
        "nut-graf",
        "byline",
        "dateline",
        "fact-box",
        "hero-headline",
        "marketing-subhead",
        "feature-callout",
        "testimonial",
        "cta-block",
        "api-heading",
        "code-reference",
        "warning-note",
        "success-note",
      ];

      const nativeBlockTags = new Set([
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "pre",
      ]);

      // Special block elements (TOC, Index, Figure)
      const specialBlockElements = ["toc", "index", "figure"];

      const applyCustomParagraphStyle = (
        styleTag: string,
        activeSelection: Selection
      ) => {
        console.log(
          `[applyCustomParagraphStyle] Called with styleTag: ${styleTag}`
        );

        // Get paginated editor page elements - these are the actual editable containers
        const pageElements =
          paginatedEditorRef.current?.getPageContentElements() || [];

        // We need either editorRef OR paginated pages to work with
        if (!editorRef.current && pageElements.length === 0) {
          console.log(
            `[applyCustomParagraphStyle] No editor container available, returning early`
          );
          return;
        }

        const styleMap: { [key: string]: string } = {
          paragraph: "", // Empty class = reset to normal paragraph
          // Align with mammoth style map classes for round-trip fidelity
          title: "doc-title",
          "book-title": "doc-title",
          subtitle: "doc-subtitle",
          "chapter-heading": "chapter-heading",
          "part-title": "part-title",
          epigraph: "epigraph",
          dedication: "dedication",
          acknowledgments: "acknowledgments",
          copyright: "copyright",
          verse: "verse",
          "lead-paragraph": "lead-paragraph",
          pullquote: "pullquote",
          caption: "caption",
          abstract: "abstract",
          keywords: "keywords",
          bibliography: "bibliography",
          references: "references",
          appendix: "appendix",
          footnote: "footnote",
          citation: "citation",
          "figure-caption": "figure-caption",
          "table-title": "table-title",
          equation: "equation",
          "author-info": "author-info",
          "date-info": "date-info",
          address: "address",
          salutation: "salutation",
          closing: "closing",
          signature: "signature",
          sidebar: "sidebar",
          callout: "callout",
          "memo-heading": "memo-heading",
          "subject-line": "subject-line",
          "executive-summary": "executive-summary",
          "front-matter": "front-matter",
          "scene-break": "scene-break",
          afterword: "afterword",
          "press-lead": "press-lead",
          "nut-graf": "nut-graf",
          byline: "byline",
          dateline: "dateline",
          "fact-box": "fact-box",
          "hero-headline": "hero-headline",
          "marketing-subhead": "marketing-subhead",
          "feature-callout": "feature-callout",
          testimonial: "testimonial",
          "cta-block": "cta-block",
          "api-heading": "api-heading",
          "code-reference": "code-reference",
          "warning-note": "warning-note",
          "success-note": "success-note",
          // Legacy mappings for backwards compatibility
          "title-content": "doc-title",
          "title-content book-title": "doc-title",
          "title-content subtitle": "doc-subtitle",
        };

        const isParagraphLike = (node: Node | null): node is HTMLElement => {
          return (
            !!node &&
            node.nodeType === Node.ELEMENT_NODE &&
            [
              "p",
              "div",
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "blockquote",
              "pre",
            ].includes(((node as HTMLElement).tagName || "").toLowerCase())
          );
        };

        // Get the selection range
        const range = activeSelection.getRangeAt(0);
        const selectedText = range.toString().trim();

        console.log(
          `[applyCustomParagraphStyle] styleTag: ${styleTag}, selectedText: "${selectedText}", pageElements count: ${pageElements.length}`
        );
        console.log(
          `[applyCustomParagraphStyle] anchorNode:`,
          activeSelection.anchorNode
        );
        console.log(
          `[applyCustomParagraphStyle] anchorNode tagName:`,
          (activeSelection.anchorNode as HTMLElement)?.tagName ||
            activeSelection.anchorNode?.parentElement?.tagName
        );

        // Helper to check if we've reached a boundary (editorRef or any page element)
        const isEditorBoundary = (node: Node | null): boolean => {
          if (!node) return false;
          if (node === editorRef.current) return true;
          return pageElements.some((el) => el === node);
        };

        // Find the containing block element
        let currentBlock: Node | null = activeSelection.anchorNode;
        let loopCount = 0;
        while (
          currentBlock &&
          !isEditorBoundary(currentBlock) &&
          !isParagraphLike(currentBlock)
        ) {
          loopCount++;
          console.log(
            `[applyCustomParagraphStyle] loop ${loopCount}, currentBlock:`,
            currentBlock,
            `tagName:`,
            (currentBlock as HTMLElement)?.tagName
          );
          currentBlock = currentBlock.parentNode;
        }

        console.log(
          `[applyCustomParagraphStyle] Final currentBlock:`,
          currentBlock,
          `isParagraphLike:`,
          isParagraphLike(currentBlock)
        );

        if (isParagraphLike(currentBlock)) {
          const blockElement = currentBlock as HTMLElement;
          const blockText = blockElement.textContent || "";

          // Check if the selection is a PARTIAL selection of a larger paragraph
          // If the paragraph is significantly larger than the selection,
          // we need to extract the selection into its own paragraph
          const isPartialSelection =
            selectedText.length > 0 &&
            selectedText.length < blockText.trim().length * 0.9; // Less than 90% of block

          // Also check if block contains <br> tags (multiple visual lines)
          const hasBrTags = blockElement.innerHTML.includes("<br");

          if (
            isPartialSelection &&
            (hasBrTags || blockText.length > selectedText.length * 2)
          ) {
            // PARTIAL SELECTION: Extract selected text into its own styled paragraph
            // This prevents styling the entire document when user only wants to style a heading

            try {
              // Get what's before and after the selection within this block
              const beforeRange = document.createRange();
              beforeRange.setStart(blockElement, 0);
              beforeRange.setEnd(range.startContainer, range.startOffset);

              const afterRange = document.createRange();
              afterRange.setStart(range.endContainer, range.endOffset);
              afterRange.setEnd(blockElement, blockElement.childNodes.length);

              // Clone the content
              const beforeContent = beforeRange.cloneContents();
              const afterContent = afterRange.cloneContents();

              // Get text content to check if there's meaningful content before/after
              const beforeText = beforeContent.textContent?.trim() || "";
              const afterText = afterContent.textContent?.trim() || "";

              // Create the styled element for the selection
              const styledPara = document.createElement("p");
              styledPara.className = styleMap[styleTag] || "";
              styledPara.textContent = selectedText;

              // Apply alignment if needed
              const styleKey = styleTag as keyof typeof documentStyles;
              const isCenterAligned =
                documentStyles[styleKey] &&
                "textAlign" in documentStyles[styleKey] &&
                (documentStyles[styleKey] as { textAlign?: string })
                  .textAlign === "center";

              if (
                documentStyles[styleKey] &&
                "textAlign" in documentStyles[styleKey]
              ) {
                const align = (
                  documentStyles[styleKey] as { textAlign?: string }
                ).textAlign;
                if (align) {
                  styledPara.style.textAlign = align;
                }
              }

              // Build new structure: before paragraph(s), styled selection, after paragraph(s)
              const fragment = document.createDocumentFragment();

              // Add before content if exists
              if (beforeText) {
                const beforePara = document.createElement("p");
                // Clean up - remove trailing <br> tags
                let beforeHtml = "";
                const tempDiv = document.createElement("div");
                tempDiv.appendChild(beforeContent);
                beforeHtml = tempDiv.innerHTML
                  .replace(/<br\s*\/?>\s*$/, "")
                  .trim();
                if (beforeHtml) {
                  beforePara.innerHTML = beforeHtml;
                  fragment.appendChild(beforePara);
                }
              }

              // Add the styled selection
              fragment.appendChild(styledPara);

              // Add after content if exists
              if (afterText) {
                const afterPara = document.createElement("p");
                // Clean up - remove leading <br> tags
                const tempDiv = document.createElement("div");
                tempDiv.appendChild(afterContent);
                let afterHtml = tempDiv.innerHTML
                  .replace(/^<br\s*\/?>\s*/, "")
                  .trim();
                if (afterHtml) {
                  afterPara.innerHTML = afterHtml;
                  fragment.appendChild(afterPara);
                }
              }

              // Replace the block element with our new structure
              blockElement.parentNode?.replaceChild(fragment, blockElement);

              // Apply centering if needed
              if (isCenterAligned) {
                centerText(styledPara);
              }

              // Set cursor into the styled paragraph
              const newRange = document.createRange();
              newRange.selectNodeContents(styledPara);
              newRange.collapse(false);
              activeSelection.removeAllRanges();
              activeSelection.addRange(newRange);

              setTimeout(() => {
                handleInput();
                if (isCenterAligned) {
                  alignCenteredBlocksToRuler();
                }
              }, 10);

              return; // Done with partial selection handling
            } catch (err) {
              // Fall through to block styling below
            }
          }

          // FULL BLOCK SELECTION: Style the entire block element
          // NOTE: We need to convert heading elements (h1, h2, etc.) to <p> elements
          // when applying custom paragraph styles, because our CSS targets p.doc-title etc.
          // This ensures uploaded DOCX content (which uses h1.doc-title) can be restyled.

          const newClassName = styleMap[styleTag] || "";

          // Check if we need to convert a heading element to a paragraph
          const isHeadingElement = /^H[1-6]$/i.test(blockElement.tagName);

          if (isHeadingElement) {
            // Convert heading to paragraph for custom styles
            // Create a new paragraph with the same content
            const newParagraph = document.createElement("p");
            newParagraph.innerHTML = blockElement.innerHTML;
            newParagraph.className = newClassName;

            // Do NOT copy over positioning attributes - start fresh
            // Clear any transform/centering from the old element
            newParagraph.style.removeProperty("transform");
            newParagraph.style.removeProperty("--center-shift");
            newParagraph.removeAttribute("data-ruler-center");

            // Replace the heading with the paragraph
            blockElement.parentNode?.replaceChild(newParagraph, blockElement);

            // Update reference to the new element
            const updatedBlock = newParagraph;

            // Apply text alignment
            const styleKey = styleTag as keyof typeof documentStyles;
            const isCenterAligned =
              documentStyles[styleKey] &&
              "textAlign" in documentStyles[styleKey] &&
              (documentStyles[styleKey] as { textAlign?: string }).textAlign ===
                "center";

            if (
              documentStyles[styleKey] &&
              "textAlign" in documentStyles[styleKey]
            ) {
              const align = (documentStyles[styleKey] as { textAlign?: string })
                .textAlign;
              if (align) {
                updatedBlock.style.textAlign = align;
              }
            }

            // Don't call centerText immediately - wait for layout to settle
            // The setTimeout below will handle centering after DOM updates

            // Set cursor into the new paragraph
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.selectNodeContents(updatedBlock);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }

            // Wait for layout to settle, then apply centering
            setTimeout(() => {
              handleInput();
              if (isCenterAligned) {
                // Now it's safe to center
                centerText(updatedBlock);
                alignCenteredBlocksToRuler();
              }
            }, 50); // Increased delay for layout to fully settle

            return;
          }

          // For non-heading elements, apply style directly
          blockElement.className = newClassName;
          [
            "text-indent",
            "margin-left",
            "margin-right",
            "padding-left",
            "padding-right",
            "text-align",
            "transform",
            "--center-shift",
          ].forEach((prop) => blockElement.style.removeProperty(prop));

          const styleKey = styleTag as keyof typeof documentStyles;
          const isCenterAligned =
            documentStyles[styleKey] &&
            "textAlign" in documentStyles[styleKey] &&
            (documentStyles[styleKey] as { textAlign?: string }).textAlign ===
              "center";

          if (
            documentStyles[styleKey] &&
            "textAlign" in documentStyles[styleKey]
          ) {
            const align = (documentStyles[styleKey] as { textAlign?: string })
              .textAlign;
            if (align) {
              blockElement.style.textAlign = align;
            }
          }

          blockElement.removeAttribute("data-block");
          blockElement.removeAttribute("data-ruler-center");

          if (isCenterAligned) {
            centerText(blockElement);
          }

          setTimeout(() => {
            handleInput();
            if (isCenterAligned) {
              alignCenteredBlocksToRuler();
            }
          }, 10);
        } else {
          // No valid block element found at selection - this can happen if:
          // 1. Selection spans multiple paragraphs
          // 2. Content structure is broken
          // 3. Cursor is directly in editor div

          // SAFETY: Do NOT use insertHTML which would replace the selection
          // Instead, try to find the nearest paragraph and style it

          // Try to find a paragraph by looking at the selection's range more carefully
          const range = activeSelection.getRangeAt(0);
          let targetParagraph: HTMLElement | null = null;

          // Walk up from startContainer
          let node: Node | null = range.startContainer;
          while (node && !isEditorBoundary(node)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const tag = el.tagName.toLowerCase();
              if (tag === "p" || tag === "div" || /^h[1-6]$/.test(tag)) {
                targetParagraph = el;
                break;
              }
            }
            node = node.parentNode;
          }

          const styleMap: { [key: string]: string } = {
            paragraph: "", // Empty class = reset to normal paragraph
            // Align with mammoth style map classes for round-trip fidelity
            title: "doc-title",
            "book-title": "doc-title",
            subtitle: "doc-subtitle",
            "chapter-heading": "chapter-heading",
            "part-title": "part-title",
            epigraph: "epigraph",
            dedication: "dedication",
            acknowledgments: "acknowledgments",
            copyright: "copyright",
            verse: "verse",
            "lead-paragraph": "lead-paragraph",
            pullquote: "pullquote",
            caption: "caption",
            abstract: "abstract",
            keywords: "keywords",
            bibliography: "bibliography",
            references: "references",
            appendix: "appendix",
            footnote: "footnote",
            citation: "citation",
            "figure-caption": "figure-caption",
            "table-title": "table-title",
            equation: "equation",
            "author-info": "author-info",
            "date-info": "date-info",
            address: "address",
            salutation: "salutation",
            closing: "closing",
            signature: "signature",
            sidebar: "sidebar",
            callout: "callout",
            "memo-heading": "memo-heading",
            "subject-line": "subject-line",
            "executive-summary": "executive-summary",
            "front-matter": "front-matter",
            "scene-break": "scene-break",
            afterword: "afterword",
            "press-lead": "press-lead",
            "nut-graf": "nut-graf",
            byline: "byline",
            dateline: "dateline",
            "fact-box": "fact-box",
            "hero-headline": "hero-headline",
            "marketing-subhead": "marketing-subhead",
            "feature-callout": "feature-callout",
            testimonial: "testimonial",
            "cta-block": "cta-block",
            "api-heading": "api-heading",
            "code-reference": "code-reference",
            "warning-note": "warning-note",
            "success-note": "success-note",
            // Legacy mappings for backwards compatibility
            "title-content": "doc-title",
            "title-content book-title": "doc-title",
            "title-content subtitle": "doc-subtitle",
          };

          if (targetParagraph) {
            // Found a paragraph - apply style directly without replacing element
            // NOTE: Do NOT use replaceWith() - it breaks React's DOM reconciliation
            const blockElement = targetParagraph;

            // Apply the style
            blockElement.className = styleMap[styleTag] || "";
            blockElement.removeAttribute("data-block");
            blockElement.removeAttribute("data-ruler-center");

            const styleKey = styleTag as keyof typeof documentStyles;
            const isCenterAligned =
              documentStyles[styleKey] &&
              "textAlign" in documentStyles[styleKey] &&
              (documentStyles[styleKey] as { textAlign?: string }).textAlign ===
                "center";

            if (
              documentStyles[styleKey] &&
              "textAlign" in documentStyles[styleKey]
            ) {
              const align = (documentStyles[styleKey] as { textAlign?: string })
                .textAlign;
              if (align) {
                blockElement.style.textAlign = align;
              }
            }

            if (isCenterAligned) {
              centerText(blockElement);
            }
          } else {
            // Truly no paragraph found - only insert if editor is empty
            console.warn(
              "[CustomEditor] No paragraph found for style application"
            );

            const placeholders: { [key: string]: string } = {
              title: "Section Title",
              "book-title": "Book Title",
              subtitle: "Subtitle",
              "chapter-heading": "Chapter 1",
              "part-title": "Part I",
            };

            const className = styleMap[styleTag] || "";
            const placeholder = placeholders[styleTag] || "Text";

            // Only insert if editor is empty to avoid destroying content
            if (editorRef.current && !editorRef.current.textContent?.trim()) {
              const styleKey = styleTag as keyof typeof documentStyles;
              let alignStyle = "";
              if (
                documentStyles[styleKey] &&
                "textAlign" in documentStyles[styleKey]
              ) {
                const align = (
                  documentStyles[styleKey] as { textAlign?: string }
                ).textAlign;
                if (align) {
                  alignStyle = ` style="text-align: ${align}"`;
                }
              }
              const blockHtml = `<p class="${className}"${alignStyle}>${placeholder}</p>`;
              document.execCommand("insertHTML", false, blockHtml);
            }
          }
        }
        setTimeout(() => handleInput(), 0);
      };

      if (specialBlockElements.includes(tag)) {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // Get selected text content (for TOC entries or figure captions)
        const selectedText = selection.toString().trim();

        // Get the current paragraph/block element
        let currentBlock = selection.anchorNode;
        while (
          currentBlock &&
          currentBlock.nodeName !== "P" &&
          currentBlock !== editorRef.current
        ) {
          currentBlock = currentBlock.parentNode;
        }

        if (tag === "toc") {
          // For TOC: if text is selected, treat it as a heading that should be in TOC
          // If no text selected, insert a TOC placeholder
          if (selectedText) {
            // Apply h1 style to selected text (making it a TOC entry)
            if (currentBlock && currentBlock.nodeName === "P") {
              const p = currentBlock as HTMLElement;
              p.className = "toc-entry heading-1";
              p.setAttribute("data-toc-level", "1");
            } else {
              const escapedText = selectedText
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
              const blockHtml = `<p class="toc-entry heading-1" data-toc-level="1">${escapedText}</p>`;
              document.execCommand("insertHTML", false, blockHtml);
            }
          } else {
            // No text selected - insert TOC placeholder block
            const tocHtml = `<div class="toc-placeholder" contenteditable="false" style="background: #fef5e7; border: 2px dashed #e0c392; border-radius: 8px; padding: 1em; margin: 1em 0; text-align: center; color: #6b7280;">
              <strong style="color: #2c3e50;">📋 Table of Contents</strong><br/>
              <span style="font-size: 0.9em;">TOC will be generated from headings on export</span>
            </div><p><br></p>`;
            document.execCommand("insertHTML", false, tocHtml);
          }
        } else if (tag === "index") {
          const indexHtml = `<div class="index-placeholder" contenteditable="false" style="background: #f5ead9; border: 2px dashed #e0c392; border-radius: 8px; padding: 1em; margin: 1em 0; text-align: center; color: #6b7280;">
            <strong style="color: #2c3e50;">📑 Index</strong><br/>
            <span style="font-size: 0.9em;">Index will be generated on export</span>
          </div><p><br></p>`;
          document.execCommand("insertHTML", false, indexHtml);
        } else if (tag === "figure") {
          const caption = selectedText || "Figure caption";
          const figureHtml = `<figure style="margin: 1.5em 0; text-align: center;">
            <div style="background: #f0f0f0; padding: 2em; border: 1px dashed #ccc; color: #666;">[Image placeholder]</div>
            <figcaption style="font-style: italic; color: #666; margin-top: 0.5em;">${caption}</figcaption>
          </figure><p><br></p>`;
          document.execCommand("insertHTML", false, figureHtml);
        }
        setTimeout(() => handleInput(), 0);
        setBlockType(tag);
        return;
      }

      if (screenplayElements.includes(tag)) {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // Get the current paragraph/block element
        let currentBlock = selection.anchorNode;
        while (
          currentBlock &&
          currentBlock.nodeName !== "P" &&
          currentBlock !== editorRef.current
        ) {
          currentBlock = currentBlock.parentNode;
        }

        if (currentBlock && currentBlock.nodeName === "P") {
          // Convert existing paragraph to screenplay block
          const p = currentBlock as HTMLElement;
          const text = p.textContent || "";
          p.className = `screenplay-block ${tag}`;
          p.setAttribute("data-block", tag);
        } else {
          // Create new screenplay block if no paragraph found
          const selectedText = selection.toString() || "TYPE HERE";
          const escapedText = selectedText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

          const blockHtml = `<p class="screenplay-block ${tag}" data-block="${tag}">${escapedText}</p>`;
          document.execCommand("insertHTML", false, blockHtml);
        }
        setTimeout(() => handleInput(), 0);
      } else if (customParagraphStyles.includes(tag)) {
        console.log(`[changeBlockType] Custom paragraph style: ${tag}`);
        // Ensure we have a valid selection (restore if needed)
        const selectionRestored = ensureEditorSelection();
        console.log(
          `[changeBlockType] ensureEditorSelection returned: ${selectionRestored}`
        );
        if (!selectionRestored) {
          console.warn(
            `[CustomEditor] Unable to apply custom style "${tag}" – no active editor selection.`
          );
          return;
        }
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        applyCustomParagraphStyle(tag, selection);
      } else if (nativeBlockTags.has(tag)) {
        formatText("formatBlock", tag);

        // Apply text-align from documentStyles for headings (h1-h6)
        const headingMap: { [key: string]: keyof typeof documentStyles } = {
          h1: "heading1",
          h2: "heading2",
          h3: "heading3",
          h4: "heading3", // h4, h5, h6 inherit from heading3 styles
          h5: "heading3",
          h6: "heading3",
        };

        if (headingMap[tag]) {
          setTimeout(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              let node: Node | null = selection.anchorNode;
              while (
                node &&
                node.nodeName.toLowerCase() !== tag &&
                node !== editorRef.current
              ) {
                node = node.parentNode;
              }
              if (node && node.nodeName.toLowerCase() === tag) {
                const element = node as HTMLElement;
                const styleKey = headingMap[tag];
                const styleData = documentStyles[styleKey];
                if (styleData && "textAlign" in styleData) {
                  const align = (styleData as { textAlign: string }).textAlign;
                  element.style.textAlign = align;

                  // For non-centered headings, ensure centering attributes are removed
                  if (align !== "center") {
                    element.removeAttribute("data-ruler-center");
                    element.style.removeProperty("--center-shift");
                    element.style.removeProperty("transform");
                  }
                }
              }
            }
            // Trigger re-alignment to ensure all elements are properly positioned
            alignCenteredBlocksToRuler();
          }, 0);
        }

        if (tag === "p") {
          setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
              return;
            }

            let node: Node | null = selection.anchorNode;
            while (
              node &&
              node !== editorRef.current &&
              node.nodeName !== "P"
            ) {
              node = node.parentNode;
            }

            if (!node || node.nodeName !== "P") {
              return;
            }

            const paragraph = node as HTMLElement;

            if (paragraph.className || paragraph.getAttribute("data-block")) {
              paragraph.className = "";
              paragraph.removeAttribute("data-block");
            }

            if (paragraph.hasAttribute("data-ruler-center")) {
              paragraph.removeAttribute("data-ruler-center");
              paragraph.style.removeProperty("--center-shift");
              paragraph.style.removeProperty("transform");
            }

            [
              "text-align",
              "text-indent",
              "margin-left",
              "margin-right",
              "padding-left",
              "padding-right",
            ].forEach((prop) => paragraph.style.removeProperty(prop));
          }, 0);
        }
      } else {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;
        console.warn(
          `[CustomEditor] Unrecognized block type "${tag}". Falling back to custom paragraph handler.`
        );
        applyCustomParagraphStyle(tag, selection);
      }
      setBlockType(tag);
    },
    [
      ensureEditorSelection,
      formatText,
      handleInput,
      alignCenteredBlocksToRuler,
      centerText,
      documentStyles,
    ]
  );

  // Insert link
  const insertLink = useCallback(() => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    formatText("createLink", url);
    setShowLinkModal(false);
    setLinkUrl("");
  }, [linkUrl, formatText]);

  // Remove link
  const removeLink = useCallback(() => {
    formatText("unlink");
  }, [formatText]);

  // Add Bookmark
  const addBookmark = useCallback(() => {
    if (!newBookmarkName.trim() || !selectedTextForBookmark) return;

    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      name: newBookmarkName.trim(),
      selectedText: selectedTextForBookmark,
      color: newBookmarkColor,
      timestamp: Date.now(),
    };

    setBookmarks((prev) => [...prev, newBookmark]);
    setShowBookmarkModal(false);
    setNewBookmarkName("");
    setSelectedTextForBookmark("");
  }, [newBookmarkName, selectedTextForBookmark, newBookmarkColor]);

  // Delete Bookmark
  const deleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    // Also remove any cross-references pointing to this bookmark
    setCrossReferences((prev) =>
      prev.filter((cr) => cr.targetBookmarkId !== id)
    );
  }, []);

  // Add Cross-Reference
  const addCrossReference = useCallback(() => {
    if (
      !newCrossRefName.trim() ||
      !selectedTextForBookmark ||
      !newCrossRefTarget
    )
      return;

    const newCrossRef: CrossReference = {
      id: `cr-${Date.now()}`,
      name: newCrossRefName.trim(),
      sourceText: selectedTextForBookmark,
      targetBookmarkId: newCrossRefTarget,
      note: newCrossRefNote.trim(),
      timestamp: Date.now(),
    };

    setCrossReferences((prev) => [...prev, newCrossRef]);
    setShowCrossRefModal(false);
    setNewCrossRefName("");
    setNewCrossRefTarget("");
    setNewCrossRefNote("");
    setSelectedTextForBookmark("");
  }, [
    newCrossRefName,
    selectedTextForBookmark,
    newCrossRefTarget,
    newCrossRefNote,
  ]);

  // Delete Cross-Reference
  const deleteCrossReference = useCallback((id: string) => {
    setCrossReferences((prev) => prev.filter((cr) => cr.id !== id));
  }, []);

  // Jump to bookmark text in editor
  const jumpToBookmark = useCallback((bookmark: Bookmark) => {
    const searchText = bookmark.selectedText;
    if (!searchText) return;

    // Search in the paginated editor pages
    const pageElements =
      paginatedEditorRef.current?.getPageContentElements() || [];

    for (let pageIdx = 0; pageIdx < pageElements.length; pageIdx++) {
      const pageEl = pageElements[pageIdx];
      const pageText = pageEl.textContent || "";
      const index = pageText.indexOf(searchText);

      if (index !== -1) {
        // Found! Jump to this page
        paginatedEditorRef.current?.goToPage(pageIdx);

        // Find and select the text within this page
        const selection = window.getSelection();
        if (!selection) return;

        const walker = document.createTreeWalker(
          pageEl,
          NodeFilter.SHOW_TEXT,
          null
        );

        let currentPos = 0;
        let node: Text | null = null;

        while ((node = walker.nextNode() as Text)) {
          const nodeLength = node.textContent?.length || 0;
          if (currentPos + nodeLength > index) {
            const range = document.createRange();
            const startOffset = index - currentPos;
            range.setStart(node, startOffset);

            // Find end of selection
            let endNode = node;
            let endOffset = startOffset + searchText.length;
            let remaining = searchText.length;

            if (startOffset + remaining <= nodeLength) {
              endOffset = startOffset + remaining;
            } else {
              remaining -= nodeLength - startOffset;
              while ((endNode = walker.nextNode() as Text) && remaining > 0) {
                const endNodeLength = endNode.textContent?.length || 0;
                if (remaining <= endNodeLength) {
                  endOffset = remaining;
                  break;
                }
                remaining -= endNodeLength;
              }
            }

            if (endNode) {
              range.setEnd(endNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(range);

              // Scroll the element into view
              node.parentElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
            break;
          }
          currentPos += nodeLength;
        }
        break;
      }
    }

    setShowBookmarksPanel(false);
  }, []);

  // Open bookmark modal with current selection
  const openBookmarkModal = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedTextForBookmark("");
    } else {
      const text = selection.toString().trim();
      setSelectedTextForBookmark(text.substring(0, 200)); // Limit to 200 chars
    }
    setShowBookmarkModal(true);
  }, []);

  // Open cross-reference modal with current selection
  const openCrossRefModal = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedTextForBookmark("");
    } else {
      const text = selection.toString().trim();
      setSelectedTextForBookmark(text.substring(0, 200));
    }
    setShowCrossRefModal(true);
  }, []);

  // Format Painter - Copy formatting from selection
  const copyFormat = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.startContainer as HTMLElement;

    // Get the element with styles (walk up to find an element node)
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentElement as HTMLElement;
    }

    if (!element) return;

    const computedStyle = window.getComputedStyle(element);

    setCopiedFormat({
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle,
      textDecoration: computedStyle.textDecoration,
      color: computedStyle.color,
      backgroundColor:
        computedStyle.backgroundColor === "rgba(0, 0, 0, 0)"
          ? undefined
          : computedStyle.backgroundColor,
      textAlign: computedStyle.textAlign,
    });

    setFormatPainterActive(true);
  }, []);

  // Format Painter - Apply copied formatting to selection
  const applyFormat = useCallback(() => {
    if (!copiedFormat) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setFormatPainterActive(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) {
      setFormatPainterActive(false);
      return;
    }

    // Create a span with the copied formatting
    const span = document.createElement("span");
    span.textContent = selectedText;

    if (copiedFormat.fontFamily)
      span.style.fontFamily = copiedFormat.fontFamily;
    if (copiedFormat.fontSize) span.style.fontSize = copiedFormat.fontSize;
    if (copiedFormat.fontWeight)
      span.style.fontWeight = copiedFormat.fontWeight;
    if (copiedFormat.fontStyle) span.style.fontStyle = copiedFormat.fontStyle;
    if (copiedFormat.textDecoration && copiedFormat.textDecoration !== "none") {
      span.style.textDecoration = copiedFormat.textDecoration;
    }
    if (copiedFormat.color) span.style.color = copiedFormat.color;
    if (copiedFormat.backgroundColor)
      span.style.backgroundColor = copiedFormat.backgroundColor;

    range.deleteContents();
    range.insertNode(span);

    // Move cursor to end of inserted span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    selection.addRange(newRange);

    setFormatPainterActive(false);

    // Sync changes to editorRef
    setTimeout(() => {
      if (paginatedEditorRef.current && editorRef.current) {
        editorRef.current.innerHTML = paginatedEditorRef.current.getContent();
        handleInput();
      }
    }, 50);
  }, [copiedFormat, handleInput]);

  // Handle click when Format Painter is active
  useEffect(() => {
    if (!formatPainterActive) return;

    const handleMouseUp = () => {
      // Small delay to let selection complete
      setTimeout(() => {
        applyFormat();
      }, 10);
    };

    // Listen to document for mouse up (works for both editors)
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [formatPainterActive, applyFormat]);

  // Insert table
  const insertTable = useCallback(() => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 1em 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 3</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 4</td>
        </tr>
      </table>
    `;
    document.execCommand("insertHTML", false, table);
    setTimeout(() => handleInput(), 0);
  }, [handleInput]);

  const findAllMatches = useCallback(() => {
    if (!editorRef.current || !findText) {
      setFindMatches([]);
      setCurrentMatchIndex(0);
      return [] as TextMatch[];
    }

    const { text, map } = extractTextWithMap(editorRef.current);
    textMapRef.current = { fullText: text, map };

    const content = text.toLowerCase();
    const search = findText.toLowerCase();
    const matches: TextMatch[] = [];

    let index = 0;
    while (index < content.length) {
      const foundAt = content.indexOf(search, index);
      if (foundAt === -1) break;
      matches.push({ start: foundAt, end: foundAt + findText.length });
      index = foundAt + findText.length; // Avoid overlapping matches
    }

    setFindMatches(matches);
    setCurrentMatchIndex(-1);
    return matches;
  }, [findText]);

  // Find text
  const findInText = useCallback(() => {
    if (!findText) return;

    // Focus the paginated editor to search within visible content
    paginatedEditorRef.current?.focus();

    // Use native window.find for better reliability in contentEditable
    // Arguments: aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog
    const found = (window as any).find(
      findText,
      false,
      false,
      true,
      false,
      false,
      false
    );

    if (found) {
      // Update match index for UI (approximate)
      setCurrentMatchIndex((prev) => prev + 1);
    } else {
      // Try resetting selection to start and search again
      paginatedEditorRef.current?.scrollToTop();
      paginatedEditorRef.current?.focus();

      const foundRetry = (window as any).find(
        findText,
        false,
        false,
        true,
        false,
        false,
        false
      );
      if (foundRetry) {
        setCurrentMatchIndex(0);
        return;
      }
      alert("Text not found");
    }
  }, [findText]);

  const replaceOne = useCallback(() => {
    if (!findText) return;

    // Get current selection - should be from the Find operation
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      // No selection - try finding first
      findInText();
      return;
    }

    // Check if selection matches the find text
    const selectedText = selection.toString();
    if (selectedText.toLowerCase() !== findText.toLowerCase()) {
      // Selection doesn't match, find next
      findInText();
      return;
    }

    // Replace the selection with the replace text
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(replaceText));
    selection.collapseToEnd();

    // Update state
    setFindMatches([]);
    setCurrentMatchIndex(-1);

    // Sync changes - get content from paginated editor and update editorRef
    if (paginatedEditorRef.current && editorRef.current) {
      const newContent = paginatedEditorRef.current.getContent();
      editorRef.current.innerHTML = newContent;
      handleInput();
    }

    // Find next occurrence
    setTimeout(() => findInText(), 100);
  }, [findText, replaceText, findInText, handleInput]);

  // Replace all occurrences
  const replaceInText = useCallback(() => {
    if (!findText) return;

    // Get content from paginated editor
    const content = paginatedEditorRef.current?.getContent() || "";
    if (!content) return;

    // Simple string replace (case insensitive)
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    const newContent = content.replace(regex, replaceText);

    // Update the paginated editor
    if (paginatedEditorRef.current) {
      paginatedEditorRef.current.setContent(newContent);
    }

    // Sync to editorRef
    if (editorRef.current) {
      editorRef.current.innerHTML = newContent;
    }

    setFindMatches([]);
    setCurrentMatchIndex(-1);
    handleInput();
  }, [findText, replaceText, handleInput]);

  useEffect(() => {
    if (!findText) {
      setFindMatches([]);
      setCurrentMatchIndex(0);
    } else {
      setFindMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [findText]);

  // Clear formatting
  const clearFormatting = useCallback(() => {
    formatText("removeFormat");
  }, [formatText]);

  // Text alignment
  const alignText = useCallback(
    (alignment: string) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      // Save the current selection range
      const savedRange = selection.getRangeAt(0).cloneRange();
      const savedAnchorNode = selection.anchorNode;
      const savedAnchorOffset = selection.anchorOffset;

      // Check if we're in an image-containing element
      let node = selection.anchorNode;
      let parentElement: HTMLElement | null = null;

      // Traverse up to find the containing paragraph or div
      while (
        node &&
        node !== paginatedEditorRef.current?.getScrollContainer()
      ) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          // Check if this element or any child contains an image
          if (element.querySelector("img") || element.tagName === "IMG") {
            parentElement = element.closest("p, div") as HTMLElement;
            break;
          }
        }
        node = node.parentNode;
      }

      // If we found an image container, apply text-align style directly
      if (parentElement) {
        parentElement.style.textAlign = alignment;

        // Also update image margin for proper centering
        const img = parentElement.querySelector("img");
        if (img instanceof HTMLElement) {
          if (alignment === "center") {
            img.style.margin = "1rem auto";
            img.style.display = "block";
          } else if (alignment === "left") {
            img.style.margin = "1rem 0";
            img.style.display = "block";
          } else if (alignment === "right") {
            img.style.marginLeft = "auto";
            img.style.marginRight = "0";
            img.style.display = "block";
          }
        }

        // Don't call handleInput - just update the content and notify parent
        if (paginatedEditorRef.current) {
          const html = paginatedEditorRef.current.getContent();
          const text = html.replace(/<[^>]*>/g, "");
          onUpdate?.({ html, text });

          // Restore selection after a brief delay
          setTimeout(() => {
            try {
              const newSelection = window.getSelection();
              if (
                newSelection &&
                savedAnchorNode &&
                document.contains(savedAnchorNode)
              ) {
                newSelection.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStart(savedAnchorNode, savedAnchorOffset);
                newRange.collapse(true);
                newSelection.addRange(newRange);
              }
            } catch (e) {
              console.warn("[alignText] Could not restore selection:", e);
            }
          }, 10);
        }

        setTextAlign(alignment);
      } else {
        // Standard text alignment using execCommand
        formatText(
          `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`
        );
        setTextAlign(alignment);
      }
    },
    [formatText, handleInput]
  );

  // Insert image
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgHtml = `<p style="text-align: center;"><img src="${event.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 1rem auto;" /></p>`;

        // Focus paginated editor and insert using execCommand
        paginatedEditorRef.current?.focus();
        paginatedEditorRef.current?.execCommand("insertHTML", imgHtml);

        // Sync changes back to editorRef
        setTimeout(() => {
          if (paginatedEditorRef.current && editorRef.current) {
            editorRef.current.innerHTML =
              paginatedEditorRef.current.getContent();
            handleInput();
          }
        }, 100);
      };
      reader.readAsDataURL(file);

      // Reset input
      e.target.value = "";
    },
    [handleInput]
  );

  const sanitizeClipboardHtml = useCallback((rawHtml: string) => {
    if (!rawHtml) return "";

    let workingHtml = rawHtml.trim();

    const htmlIndex = workingHtml.toLowerCase().indexOf("<html");
    if (htmlIndex > -1) {
      workingHtml = workingHtml.slice(htmlIndex);
    }

    const startMarker = "<!--StartFragment-->";
    const endMarker = "<!--EndFragment-->";
    let fragmentHtml = workingHtml;

    const startIndex = workingHtml.indexOf(startMarker);
    const endIndex = workingHtml.indexOf(endMarker);
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      fragmentHtml = workingHtml.slice(
        startIndex + startMarker.length,
        endIndex
      );
    } else {
      const bodyMatch = workingHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        fragmentHtml = bodyMatch[1];
      }
    }

    if (typeof window === "undefined" || typeof document === "undefined") {
      return fragmentHtml;
    }

    const container = document.createElement("div");
    container.innerHTML = fragmentHtml;

    container
      .querySelectorAll("style, meta, link, xml, script, head, title")
      .forEach((node) => node.remove());

    container.querySelectorAll("*").forEach((el) => {
      const attributes = Array.from(el.attributes);
      attributes.forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value;

        if (name.startsWith("xmlns") || name === "lang") {
          el.removeAttribute(attr.name);
          return;
        }

        if (name === "class" && /mso/i.test(value)) {
          el.removeAttribute(attr.name);
          return;
        }

        if (name === "style") {
          const cleanedStyle = value
            .split(";")
            .map((rule) => rule.trim())
            .filter(
              (rule) =>
                rule &&
                !rule.toLowerCase().startsWith("mso-") &&
                !rule.toLowerCase().includes("font-variant-east-asian") &&
                !rule.toLowerCase().includes("font-family")
            )
            .join("; ");

          if (cleanedStyle) {
            el.setAttribute("style", cleanedStyle);
          } else {
            el.removeAttribute("style");
          }
          return;
        }

        if (name === "width" || name === "height") {
          el.removeAttribute(attr.name);
        }
      });

      if (
        el.tagName.toLowerCase() === "span" &&
        !el.attributes.length &&
        (el.textContent || "").trim() === ""
      ) {
        el.remove();
      }
    });

    return container.innerHTML.replace(/&nbsp;/g, " ").replace(/<\/?o:p>/g, "");
  }, []);

  // Handle paste with images
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const html = e.clipboardData.getData("text/html");
      if (html) {
        e.preventDefault();
        const cleanHtml = sanitizeClipboardHtml(html);
        if (cleanHtml.trim().length > 0) {
          document.execCommand("insertHTML", false, cleanHtml);
          // Sync changes to editorRef if paste happened in paginated editor
          setTimeout(() => {
            if (paginatedEditorRef.current && editorRef.current) {
              editorRef.current.innerHTML =
                paginatedEditorRef.current.getContent();
            }
            handleInput();
          }, 0);
          return;
        }
      }

      // Get plain text and insert it
      const text = e.clipboardData.getData("text/plain");
      if (text) {
        e.preventDefault();
        // Insert text properly by using the browser's natural paste or insertHTML
        // This preserves line breaks and formatting
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Convert line breaks to proper HTML
        const lines = text.split("\n");
        const fragment = document.createDocumentFragment();

        lines.forEach((line, index) => {
          const textNode = document.createTextNode(line);
          fragment.appendChild(textNode);

          // Add <br> between lines (but not after the last line)
          if (index < lines.length - 1) {
            fragment.appendChild(document.createElement("br"));
          }
        });

        range.insertNode(fragment);

        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Sync changes to editorRef if paste happened in paginated editor
        setTimeout(() => {
          if (paginatedEditorRef.current && editorRef.current) {
            editorRef.current.innerHTML =
              paginatedEditorRef.current.getContent();
          }
          handleInput();
        }, 0);
        return;
      }

      // No HTML/text content; allow image pastes (e.g., screenshots)
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const imgHtml = `<p><img src="${event.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 1rem 0;" /></p>`;
            document.execCommand("insertHTML", false, imgHtml);
            // Sync changes to editorRef if paste happened in paginated editor
            setTimeout(() => {
              if (paginatedEditorRef.current && editorRef.current) {
                editorRef.current.innerHTML =
                  paginatedEditorRef.current.getContent();
              }
              handleInput();
            }, 0);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    },
    [handleInput, sanitizeClipboardHtml]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      console.log(
        "[CustomEditor handleKeyDown] Called with key:",
        e.key,
        "metaKey:",
        e.metaKey,
        "ctrlKey:",
        e.ctrlKey
      );

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Handle Tab key for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertHTML", false, "\u00A0\u00A0\u00A0\u00A0"); // 4 non-breaking spaces
        return;
      }

      // Handle Enter key - reset title/heading styles to paragraph after Enter
      if (e.key === "Enter" && !e.shiftKey && !modKey) {
        // Pilcrow markers are now handled via CSS pseudo-elements, so no DOM manipulation needed

        const selection = window.getSelection();
        const scrollContainer = scrollShellRef.current;
        if (selection && selection.anchorNode) {
          let node = selection.anchorNode.parentElement;
          // Check if we're in paginated editor or the hidden editorRef
          const isInPaginatedEditor = scrollContainer?.contains(
            selection.anchorNode
          );
          const rootElement = isInPaginatedEditor
            ? scrollContainer
            : editorRef.current;

          while (node && node !== rootElement) {
            const tag = node.tagName?.toLowerCase();
            const className = node.className || "";
            // Check for heading or special title elements
            if (
              ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag || "") ||
              className.includes("book-title") ||
              className.includes("chapter-heading") ||
              className.includes("subtitle") ||
              className.includes("title-content") ||
              className.includes("part-title") ||
              className.includes("doc-title") ||
              className.includes("doc-subtitle")
            ) {
              // Let the Enter happen, then reset to paragraph
              setTimeout(() => {
                const newSelection = window.getSelection();
                if (newSelection && newSelection.anchorNode) {
                  let newNode = newSelection.anchorNode;
                  if (newNode.nodeType === Node.TEXT_NODE) {
                    newNode = newNode.parentNode as Node;
                  }
                  // Check if we're now in a new element that inherited the heading style
                  const newElement = newNode as HTMLElement;
                  if (newElement && newElement.tagName) {
                    const newTag = newElement.tagName.toLowerCase();
                    const newClass = newElement.className || "";
                    if (
                      ["h1", "h2", "h3", "h4", "h5", "h6"].includes(newTag) ||
                      newClass.includes("book-title") ||
                      newClass.includes("chapter-heading") ||
                      newClass.includes("subtitle") ||
                      newClass.includes("title-content") ||
                      newClass.includes("part-title") ||
                      newClass.includes("doc-title") ||
                      newClass.includes("doc-subtitle")
                    ) {
                      // Convert this element to a paragraph
                      document.execCommand("formatBlock", false, "p");
                      // Remove any special classes
                      const updatedSelection = window.getSelection();
                      if (updatedSelection && updatedSelection.anchorNode) {
                        let pNode = updatedSelection.anchorNode;
                        if (pNode.nodeType === Node.TEXT_NODE) {
                          pNode = pNode.parentNode as Node;
                        }
                        const pElement = pNode as HTMLElement;
                        if (pElement) {
                          pElement.className = "";
                        }
                      }
                      // Sync back to editorRef if we're in paginated editor
                      if (
                        isInPaginatedEditor &&
                        paginatedEditorRef.current &&
                        editorRef.current
                      ) {
                        editorRef.current.innerHTML =
                          paginatedEditorRef.current.getContent();
                      }
                      handleInput();
                    }
                  }
                }
              }, 0);
              return; // Let browser handle the Enter naturally
            }
            node = node.parentElement;
          }
        }
      }

      // Only process keyboard shortcuts that use modifier keys (Cmd/Ctrl or Alt)
      // Let all other keys pass through without preventDefault for natural auto-repeat
      if (!modKey && !e.altKey && !e.shiftKey) {
        return; // Don't prevent default - let browser handle naturally
      }

      // Use e.code for reliable key detection (especially with Alt on Mac)
      const code = e.code;
      const key = e.key.toLowerCase();

      // Handle modifier+key shortcuts
      // First check code-based shortcuts (for Alt combinations that change key output)
      if (modKey && e.altKey) {
        switch (code) {
          case "Digit1":
            e.preventDefault();
            changeBlockType("h1");
            return;
          case "Digit2":
            e.preventDefault();
            changeBlockType("h2");
            return;
          case "Digit3":
            e.preventDefault();
            changeBlockType("h3");
            return;
          case "Digit4":
            e.preventDefault();
            changeBlockType("h4");
            return;
          case "Digit5":
            e.preventDefault();
            changeBlockType("h5");
            return;
          case "Digit6":
            e.preventDefault();
            changeBlockType("h6");
            return;
          case "Digit0":
            e.preventDefault();
            changeBlockType("p");
            return;
        }
      }

      // Quote shortcut - Cmd/Ctrl + Shift + .
      if (modKey && e.shiftKey && (code === "Period" || key === ".")) {
        e.preventDefault();
        changeBlockType("blockquote");
        return;
      }

      // Standard shortcuts (key-based)
      switch (key) {
        case "s":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            if (onSave) {
              onSave();
            }
          }
          break;
        case "b":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            formatText("bold");
          }
          break;
        case "i":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            formatText("italic");
          }
          break;
        case "u":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            formatText("underline");
          }
          break;
        case "k":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            setShowLinkModal(true);
          }
          break;
        case "f":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            setShowFindReplace(true);
          }
          break;
        case "z":
          if (modKey && !e.altKey) {
            if (e.shiftKey) {
              e.preventDefault();
              performRedo();
            } else {
              e.preventDefault();
              performUndo();
            }
          }
          break;
        case "y":
          if (!isMac && modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            performRedo();
          }
          break;
      }
    },
    [formatText, performUndo, performRedo, changeBlockType, onSave, handleInput]
  );

  // Track selection changes for toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      if (typeof window === "undefined") {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Check if selection is in paginated editor
      const scrollContainer = paginatedEditorRef.current?.getScrollContainer();
      const pageElements =
        paginatedEditorRef.current?.getPageContentElements() || [];
      const isInPaginatedEditor =
        scrollContainer?.contains(selection.anchorNode) ||
        pageElements.some((el) => el.contains(selection.anchorNode));

      // Check if selection is in hidden editorRef
      const isInEditorRef = editorRef.current?.contains(selection.anchorNode);

      console.log(
        `[selectionchange] isInPaginatedEditor: ${isInPaginatedEditor}, isInEditorRef: ${isInEditorRef}, collapsed: ${selection.isCollapsed}`
      );

      if (isInPaginatedEditor || isInEditorRef) {
        lastSelectionRangeRef.current = selection.getRangeAt(0).cloneRange();
        console.log(`[selectionchange] Saved selection range`);
        updateFormatState();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateFormatState]);

  // Track scroll position for back to top button
  // NOTE: scrollShellRef is the actual scrollable container (wrapperRef has overflow:hidden)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollShellRef.current) return;
      const scrollTop = scrollShellRef.current.scrollTop;
      setShowBackToTop(scrollTop > 300);

      const currentPage = Math.min(
        Math.max(
          0,
          Math.floor((scrollTop + PAGE_HEIGHT_PX / 2) / PAGE_HEIGHT_PX)
        ),
        Math.max(0, pageCount - 1)
      );
      if (currentPage !== activePageRef.current) {
        setActivePage(currentPage);
      }
    };

    const scrollShell = scrollShellRef.current;
    if (!scrollShell) {
      return;
    }

    scrollShell.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => scrollShell.removeEventListener("scroll", handleScroll);
  }, [pageCount]);

  // Typewriter mode - center current line
  useEffect(() => {
    if (!typewriterMode || !editorRef.current || !wrapperRef.current) return;

    const centerCursor = () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = wrapperRef.current!.getBoundingClientRect();
      const wrapperMiddle = wrapperRect.height / 2;

      // Scroll to keep cursor in middle of screen
      const offset = rect.top - wrapperRect.top - wrapperMiddle;
      if (Math.abs(offset) > 50) {
        wrapperRef.current!.scrollBy({ top: offset, behavior: "smooth" });
      }
    };

    // Handle typing
    const handleInput = () => centerCursor();

    // Handle cursor movement (arrow keys, clicks, etc.)
    const handleSelectionChange = () => {
      // Only center if the selection is within our editor
      const selection = window.getSelection();
      if (selection && editorRef.current?.contains(selection.anchorNode)) {
        centerCursor();
      }
    };

    // Handle clicks
    const handleClick = () => centerCursor();

    editorRef.current.addEventListener("input", handleInput);
    editorRef.current.addEventListener("click", handleClick);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      editorRef.current?.removeEventListener("input", handleInput);
      editorRef.current?.removeEventListener("click", handleClick);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [typewriterMode]);

  // Listen for selection changes and sync the active page when typing flows past a page break
  useEffect(() => {
    if (!showThumbnailRail) return;

    const handleSelectionSync = () => {
      if (selectionSyncLockRef.current) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      if (!editorRef.current || !wrapperRef.current) {
        return;
      }

      if (!editorRef.current.contains(selection.anchorNode)) {
        return;
      }

      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rect = range.getClientRects()[0] || range.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const scrollTop = wrapperRef.current.scrollTop;
      const relativeTop = rect.top - wrapperRect.top + scrollTop;
      const inferredPage = Math.min(
        Math.max(Math.floor(relativeTop / PAGE_HEIGHT_PX), 0),
        Math.max(0, pageCount - 1)
      );

      if (inferredPage !== activePageRef.current) {
        setActivePage(inferredPage);
      }
    };

    document.addEventListener("selectionchange", handleSelectionSync);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionSync);
  }, [showThumbnailRail, pageCount]);

  // Sprint timer
  useEffect(() => {
    if (!sprintMode || sprintTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setSprintTimeRemaining((prev) => {
        if (prev <= 1) {
          setSprintMode(false);
          // Show completion message
          const wordsWritten = statistics.words - sprintStartWords;
          alert(
            `Sprint Complete! 🎉\nYou wrote ${wordsWritten} words in ${sprintDuration} minutes!\nThat's ${Math.round(
              wordsWritten / sprintDuration
            )} words per minute!`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    sprintMode,
    sprintTimeRemaining,
    statistics.words,
    sprintStartWords,
    sprintDuration,
  ]);

  // Start sprint
  const startSprint = useCallback(() => {
    setSprintMode(true);
    setSprintTimeRemaining(sprintDuration * 60);
    setSprintStartWords(statistics.words);
  }, [sprintDuration, statistics.words]);

  // Stop sprint
  const stopSprint = useCallback(() => {
    setSprintMode(false);
    setSprintTimeRemaining(0);
  }, []);

  const jumpToPage = useCallback(
    (page: number, options?: { suppressSelectionSync?: boolean }) => {
      const maxPage = Math.max(0, pageCount - 1);
      const targetPage = Math.max(0, Math.min(page, maxPage));

      if (options?.suppressSelectionSync) {
        selectionSyncLockRef.current = true;
        window.setTimeout(() => {
          selectionSyncLockRef.current = false;
        }, 300);
      }

      // Use PaginatedEditor's goToPage method
      if (paginatedEditorRef.current) {
        paginatedEditorRef.current.goToPage(targetPage);
      }

      setActivePage(targetPage);
    },
    [pageCount]
  );

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    // Use PaginatedEditor's scrollToTop
    if (paginatedEditorRef.current) {
      paginatedEditorRef.current.scrollToTop();
    }
  }, []);

  // Render spacing indicators - small colored dots inside the left margin
  const renderIndicators = () => {
    if (!showSpacingIndicators || !showStyleLabels) return null;
    // In free mode, always show indicators. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) return null;

    // Get page content elements from PaginatedEditor
    const pageElements =
      paginatedEditorRef.current?.getPageContentElements() || [];
    const pagesContainer = paginatedEditorRef.current?.getPagesContainer();

    if (pageElements.length === 0 || !pagesContainer) return null;

    // Collect all paragraphs across all pages with their positions
    const allParagraphs: { element: HTMLElement; top: number }[] = [];

    pageElements.forEach((pageEl) => {
      const paragraphs = Array.from(pageEl.querySelectorAll("p, div"));
      // Get the page div (parent of the content div)
      const pageDiv = pageEl.parentElement;
      if (!pageDiv) return;

      // Position of this page relative to the pagesContainer
      const pageTop = pageDiv.offsetTop;

      paragraphs.forEach((para) => {
        const paraEl = para as HTMLElement;
        // Position: pageTop + pageEl content offset + paragraph offset within content
        const paraTop = pageTop + pageEl.offsetTop + paraEl.offsetTop;
        allParagraphs.push({ element: paraEl, top: paraTop });
      });
    });

    // Only show dots for paragraphs that need attention:
    // - Orange: Long paragraphs (>150 words)
    // - Purple: Passive voice detected
    const indicators: React.ReactNode[] = [];

    analysis.spacing.forEach((item, idx) => {
      const paraData = allParagraphs[item.index];
      if (!paraData) return;

      // Show orange dot for long paragraphs
      if (item.tone === "extended") {
        indicators.push(
          <div
            key={`long-${idx}`}
            className="absolute pointer-events-none z-20"
            style={{
              top: `${paraData.top + 4}px`,
              left: "12px",
            }}
            title={`Long paragraph · ${item.wordCount} words - consider breaking up`}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#f97316", // orange
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      }

      // Show purple dot for passive voice (offset slightly if also long)
      if (item.hasPassive && item.passiveCount && item.passiveCount > 0) {
        indicators.push(
          <div
            key={`passive-${idx}`}
            className="absolute pointer-events-none z-20"
            style={{
              top: `${paraData.top + 4}px`,
              left: item.tone === "extended" ? "24px" : "12px", // offset if also long
            }}
            title={`Passive voice detected (${item.passiveCount}× ) - consider active voice`}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#8b5cf6", // purple
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      }
    });

    return indicators;
  };

  // Toggle section expansion in styles dropdown
  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  // Render visual suggestions - small yellow dots inside the right margin
  const renderSuggestions = () => {
    if (!showVisualSuggestions || !showStyleLabels) return null;
    // In free mode, always show suggestions. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) return null;

    // Get page content elements from PaginatedEditor
    const pageElements =
      paginatedEditorRef.current?.getPageContentElements() || [];
    const pagesContainer = paginatedEditorRef.current?.getPagesContainer();

    if (pageElements.length === 0 || !pagesContainer) return null;

    // Collect all paragraphs across all pages with their positions
    const allParagraphs: { element: HTMLElement; top: number }[] = [];

    pageElements.forEach((pageEl) => {
      const paragraphs = Array.from(pageEl.querySelectorAll("p, div"));
      // Get the page div (parent of the content div)
      const pageDiv = pageEl.parentElement;
      if (!pageDiv) return;

      // Position of this page relative to the pagesContainer
      const pageTop = pageDiv.offsetTop;

      paragraphs.forEach((para) => {
        const paraEl = para as HTMLElement;
        // Position: pageTop + pageEl content offset + paragraph offset within content
        const paraTop = pageTop + pageEl.offsetTop + paraEl.offsetTop;
        allParagraphs.push({ element: paraEl, top: paraTop });
      });
    });

    return analysis.visuals.map((item, idx) => {
      const paraData = allParagraphs[item.index];
      if (!paraData) return null;

      // Combine all suggestions into a tooltip
      const tooltipText = item.suggestions
        .map((s) => `${s.visualType}: ${s.reason}`)
        .join("\n");

      return (
        <div
          key={`visual-${idx}`}
          className="absolute pointer-events-none z-20"
          style={{
            top: `${paraData.top + 4}px`,
            right: "12px",
          }}
          title={tooltipText}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#eab308", // yellow
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      );
    });
  };

  // Render the analysis legend (positioned in toolbar row)
  const renderAnalysisLegend = () => {
    if (!showStyleLabels) return null;
    if (!showSpacingIndicators && !showVisualSuggestions) return null;
    if (!isFreeMode && focusMode) return null;

    return (
      <div
        className="analysis-legend"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "6px 12px",
          fontSize: "11px",
          fontWeight: 500,
          color: "#78716c",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
          border: "1.5px solid #e0c392",
          boxShadow: "0 4px 12px rgba(239, 132, 50, 0.12)",
        }}
      >
        {showSpacingIndicators && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "help",
              }}
              title="Long Paragraphs: Break up dense text blocks. Aim for 3-5 sentences per paragraph for better readability. Consider splitting at natural thought transitions or adding dialogue breaks."
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#f97316",
                }}
              />
              <span>Long ¶</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "help",
              }}
              title="Passive Voice: Strengthen your prose by converting to active voice. Change 'was done by' to direct subject-verb-object. Active voice creates urgency and clarity. Example: 'The door was opened by Sarah' → 'Sarah opened the door.'"
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#8b5cf6",
                }}
              />
              <span>Passive?</span>
            </div>
          </>
        )}
        {showVisualSuggestions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: "help",
            }}
            title="Sensory Details: Engage readers by adding specific sensory information—what characters see, hear, smell, taste, or feel. Replace abstract descriptions with concrete images. Example: 'She was upset' → 'Her hands trembled as tears blurred the page.'"
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#eab308",
              }}
            />
            <span>Senses?</span>
          </div>
        )}
      </div>
    );
  };

  const showToolbarRow = viewMode === "writer" && !isFreeMode;
  const analysisLegendElement = renderAnalysisLegend();
  const bookTitleFontSizePx = Number(
    (documentStyles["book-title"].fontSize * POINT_TO_PX).toFixed(2)
  );
  const toolbarCenterPlaceholder = !focusMode ? (
    <div
      className="flex items-center gap-2"
      style={{
        padding: "4px 8px",
        borderRadius: "999px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px dashed #e0c392",
        boxShadow: "0 2px 6px rgba(239, 132, 50, 0.12)",
      }}
    >
      <button
        onClick={() => setActiveTool("version-history")}
        className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
          activeTool === "version-history" ? "active" : ""
        }`}
        title="Open Version History"
      >
        📜 Version History
      </button>
      <div
        style={{ width: "1px", height: "16px", backgroundColor: "#e0c392" }}
      />
      <button
        onClick={() => onOpenChapterLibrary?.()}
        disabled={!onOpenChapterLibrary}
        className="px-2 py-1 rounded transition-colors text-xs toolbar-view-button"
        style={{
          opacity: onOpenChapterLibrary ? 1 : 0.5,
          cursor: onOpenChapterLibrary ? "pointer" : "not-allowed",
        }}
        title={
          onOpenChapterLibrary
            ? "Open Chapter Library"
            : "Chapter Library available when provided"
        }
      >
        📁 Chapter Library
      </button>
    </div>
  ) : null;
  const spacingIndicators = renderIndicators();
  const visualSuggestions = renderSuggestions();

  // Render bookmark indicators
  const renderBookmarkIndicators = () => {
    if (
      !editorRef.current ||
      !pagesContainerRef.current ||
      !showStyleLabels ||
      bookmarks.length === 0
    ) {
      return null;
    }

    const editorContent = editorRef.current.innerText;
    const editorOffset = editorRef.current.offsetTop;
    const indicators: JSX.Element[] = [];

    bookmarks.forEach((bookmark) => {
      // Find the position of the bookmarked text in the editor
      const textIndex = editorContent.indexOf(bookmark.selectedText);
      if (textIndex === -1) return;

      // Create a temporary range to find the element containing this text
      const walker = document.createTreeWalker(
        editorRef.current!,
        NodeFilter.SHOW_TEXT,
        null
      );

      let charCount = 0;
      let targetNode: Node | null = null;
      let nodeStartOffset = 0;

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent?.length || 0;

        if (charCount + nodeLength >= textIndex) {
          targetNode = node;
          nodeStartOffset = textIndex - charCount;
          break;
        }
        charCount += nodeLength;
      }

      if (!targetNode || !targetNode.parentElement) return;

      // Get the element containing the bookmark
      const element = targetNode.parentElement.closest(
        "p, div, h1, h2, h3"
      ) as HTMLElement;
      if (!element) return;

      // Calculate position
      const rect = element.getBoundingClientRect();
      const containerRect = pagesContainerRef.current!.getBoundingClientRect();

      const top = rect.top - containerRect.top + editorOffset;
      const left = -24; // Position in left margin

      indicators.push(
        <div
          key={bookmark.id}
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            cursor: "pointer",
            zIndex: 8,
            pointerEvents: "auto",
          }}
          onClick={() => jumpToBookmark(bookmark)}
          title={bookmark.name}
        >
          <span style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
            🔖
          </span>
        </div>
      );
    });

    return indicators;
  };

  const bookmarkIndicators = renderBookmarkIndicators();

  return (
    <div
      className="custom-editor-container"
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Dynamic style injection for documentStyles colors */}
      <style>
        {`
          ${
            documentStyles["book-title"]?.color
              ? `.custom-editor-container .paginated-page-content .book-title, .custom-editor-container .paginated-page-content .doc-title { color: ${documentStyles["book-title"].color} !important; }`
              : ""
          }
          ${
            documentStyles["book-title"]?.backgroundColor
              ? `.custom-editor-container .paginated-page-content .book-title, .custom-editor-container .paginated-page-content .doc-title { background-color: ${documentStyles["book-title"].backgroundColor} !important; }`
              : ""
          }
          ${
            documentStyles["chapter-heading"]?.color
              ? `.custom-editor-container .paginated-page-content .chapter-heading, .custom-editor-container .paginated-page-content h1.chapter-heading { color: ${documentStyles["chapter-heading"].color} !important; }`
              : ""
          }
          ${
            documentStyles["chapter-heading"]?.backgroundColor
              ? `.custom-editor-container .paginated-page-content .chapter-heading, .custom-editor-container .paginated-page-content h1.chapter-heading { background-color: ${documentStyles["chapter-heading"].backgroundColor} !important; }`
              : ""
          }
          ${
            documentStyles.subtitle?.color
              ? `.custom-editor-container .paginated-page-content .subtitle, .custom-editor-container .paginated-page-content .doc-subtitle { color: ${documentStyles.subtitle.color} !important; }`
              : ""
          }
          ${
            documentStyles.subtitle?.backgroundColor
              ? `.custom-editor-container .paginated-page-content .subtitle, .custom-editor-container .paginated-page-content .doc-subtitle { background-color: ${documentStyles.subtitle.backgroundColor} !important; }`
              : ""
          }
          ${
            documentStyles.paragraph?.color
              ? `.custom-editor-container .paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote) { color: ${documentStyles.paragraph.color} !important; }`
              : ""
          }
          ${
            documentStyles.paragraph?.backgroundColor
              ? `.custom-editor-container .paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote) { background-color: ${documentStyles.paragraph.backgroundColor} !important; }`
              : ""
          }
          ${
            documentStyles.heading1?.color
              ? `.custom-editor-container .paginated-page-content h1:not(.chapter-heading) { color: ${documentStyles.heading1.color} !important; }`
              : ""
          }
          ${
            documentStyles.heading1?.backgroundColor
              ? `.custom-editor-container .paginated-page-content h1:not(.chapter-heading) { background-color: ${documentStyles.heading1.backgroundColor} !important; }`
              : ""
          }
          ${
            documentStyles.heading2?.color
              ? `.custom-editor-container .paginated-page-content h2 { color: ${documentStyles.heading2.color} !important; }`
              : ""
          }
          ${
            documentStyles.heading2?.backgroundColor
              ? `.custom-editor-container .paginated-page-content h2 { background-color: ${documentStyles.heading2.backgroundColor} !important; }`
              : ""
          }
          ${
            documentStyles.blockquote?.color
              ? `.custom-editor-container .paginated-page-content blockquote, .custom-editor-container .paginated-page-content .quote, .custom-editor-container .paginated-page-content .intense-quote { color: ${documentStyles.blockquote.color} !important; }`
              : ""
          }
          ${
            documentStyles.blockquote?.backgroundColor
              ? `.custom-editor-container .paginated-page-content blockquote, .custom-editor-container .paginated-page-content .quote, .custom-editor-container .paginated-page-content .intense-quote { background-color: ${documentStyles.blockquote.backgroundColor} !important; }`
              : ""
          }
        `}
      </style>
      {/* Toolbar Row - spread to edges */}
      {showToolbarRow && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "6px 12px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            backgroundColor: "transparent",
            transform: "translateY(-10px)",
            overflow: "visible",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: "12px",
              overflow: "visible",
            }}
          >
            {/* Left Toolbar Column */}
            <div
              className="writer-toolbar-shell"
              style={{
                padding: "6px 10px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
                border: "1.5px solid #e0c392",
                boxShadow: "0 4px 12px rgba(239, 132, 50, 0.12)",
                flexShrink: 0,
                justifySelf: "start",
                position: "relative",
                zIndex: 100,
              }}
            >
              <div
                className="toolbar flex items-center gap-1"
                style={{
                  flexWrap: "nowrap",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                  overflow: "visible",
                }}
              >
                {/* Block type dropdown - Custom stable implementation */}
                <div
                  ref={blockTypeDropdownRef}
                  className="relative inline-block"
                  style={{ position: "relative" }}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent stealing editor focus
                      snapshotCurrentSelection();
                      setShowBlockTypeDropdown((prev) => !prev);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: `1.5px solid ${blockTypeButtonBorderColor}`,
                      backgroundColor: blockTypeButtonBaseBg,
                      color: blockTypeButtonTextColor,
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      minWidth: "140px",
                      justifyContent: "space-between",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        blockTypeButtonHoverBg;
                      e.currentTarget.style.borderColor = "#ef8432";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        blockTypeButtonBaseBg;
                      e.currentTarget.style.borderColor =
                        blockTypeButtonBorderColor;
                    }}
                    title="Block Type"
                  >
                    <span>
                      {(() => {
                        const labels: Record<string, string> = {
                          p: "Paragraph",
                          h1: "Heading 1",
                          h2: "Heading 2",
                          h3: "Heading 3",
                          h4: "Heading 4",
                          h5: "Heading 5",
                          h6: "Heading 6",
                          blockquote: "Quote",
                          pre: "Code Block",
                          "lead-paragraph": "Lead Paragraph",
                          pullquote: "Pull Quote",
                          caption: "Caption",
                          byline: "Byline",
                          dateline: "Dateline",
                          "press-lead": "Press Lead",
                          "nut-graf": "Nut Graf",
                          "fact-box": "Fact Box",
                          "hero-headline": "Hero Headline",
                          "marketing-subhead": "Promo Subhead",
                          "feature-callout": "Feature Callout",
                          testimonial: "Testimonial",
                          "cta-block": "CTA Block",
                          "api-heading": "API Heading",
                          "code-reference": "Code Reference",
                          "warning-note": "Warning Note",
                          "success-note": "Success Note",
                          abstract: "Abstract",
                          keywords: "Keywords",
                          bibliography: "Bibliography",
                          references: "References",
                          appendix: "Appendix",
                          footnote: "Footnote",
                          citation: "Citation",
                          "figure-caption": "Figure Caption",
                          "table-title": "Table Title",
                          equation: "Equation",
                          "author-info": "Author Info",
                          "date-info": "Date",
                          address: "Address",
                          salutation: "Salutation",
                          closing: "Closing",
                          signature: "Signature",
                          sidebar: "Sidebar",
                          callout: "Callout",
                          "memo-heading": "Memo Heading",
                          "subject-line": "Subject Line",
                          "executive-summary": "Executive Summary",
                          "book-title": "Title",
                          title: "Section Title",
                          subtitle: "Subtitle",
                          "chapter-heading": "Chapter",
                          "part-title": "Part Title",
                          epigraph: "Epigraph",
                          dedication: "Dedication",
                          acknowledgments: "Acknowledgments",
                          copyright: "Copyright",
                          verse: "Verse",
                          "front-matter": "Front Matter",
                          "scene-break": "Scene Break",
                          afterword: "Afterword",
                          "scene-heading": "Scene Heading",
                          action: "Action",
                          character: "Character",
                          dialogue: "Dialogue",
                          parenthetical: "Parenthetical",
                          transition: "Transition",
                          shot: "Shot",
                          lyric: "Lyric",
                          beat: "Beat",
                        };
                        return labels[blockType] || blockType;
                      })()}
                    </span>
                    <span style={{ fontSize: "8px", opacity: 0.6 }}>▼</span>
                  </button>
                  {showBlockTypeDropdown && (
                    <div
                      className="block-type-dropdown-menu"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "100%",
                        marginTop: "4px",
                        width: "240px",
                        maxWidth: "min(300px, 90vw)",
                        maxHeight: "min(70vh, 520px)",
                        overflowY: "auto",
                        overflowX: "hidden",
                        fontSize: "12px",
                        backgroundColor: "#fffaf3",
                        border: "1.5px solid #e0c392",
                        borderRadius: "10px",
                        boxShadow: "0 10px 28px rgba(44, 62, 80, 0.18)",
                        zIndex: 1000,
                        color: "#111827",
                        padding: 0,
                      }}
                    >
                      {BLOCK_TYPE_SECTIONS.map((section, sectionIndex) => (
                        <div
                          key={section.key}
                          style={{ margin: 0, padding: 0 }}
                        >
                          <button
                            type="button"
                            className="dropdown-section-label"
                            onClick={() => toggleSection(section.key)}
                            style={{
                              width: "100%",
                              padding: "6px 12px",
                              backgroundColor: "#f5ead9",
                              fontWeight: 700,
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              border: "none",
                              borderTop:
                                sectionIndex === 0
                                  ? "none"
                                  : "1px solid #e0c392",
                              color: "#111827",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "6px",
                              cursor: "pointer",
                              transition: "background-color 0.15s",
                              margin: 0,
                              outline: "none",
                              borderRadius:
                                sectionIndex === 0 ? "8px 8px 0 0" : "0",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#eddcc5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f5ead9";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#111827",
                                opacity: 1,
                              }}
                            >
                              <span
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "999px",
                                  backgroundColor: section.accent,
                                  display: "inline-block",
                                }}
                              />
                              <span style={{ color: "#111827", opacity: 1 }}>
                                {section.label}
                              </span>
                            </div>
                            <span style={{ fontSize: "10px" }}>
                              {expandedSections.has(section.key) ? "▼" : "▶"}
                            </span>
                          </button>
                          {expandedSections.has(section.key) &&
                            section.items.map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  console.log(
                                    `[Dropdown] Clicked on style: ${item.value}`
                                  );
                                  ensureEditorSelection();
                                  changeBlockType(item.value);
                                  setShowBlockTypeDropdown(false);
                                }}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "8px 12px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  backgroundColor:
                                    blockType === item.value
                                      ? "#fef5e7"
                                      : "transparent",
                                  fontWeight:
                                    blockType === item.value ? 600 : 500,
                                  color: "#111827",
                                  border: "none",
                                  cursor: "pointer",
                                  transition: "background-color 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  if (blockType !== item.value) {
                                    e.currentTarget.style.backgroundColor =
                                      "#f7e6d0";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (blockType !== item.value) {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }
                                }}
                              >
                                <span style={{ color: "#111827" }}>
                                  {item.label}
                                </span>
                                {item.shortcut && (
                                  <span
                                    className="dropdown-shortcut"
                                    style={{ color: "#6b7280", opacity: 0.8 }}
                                  >
                                    {item.shortcut}
                                  </span>
                                )}
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Styles Panel Button */}
                <button
                  onClick={() => setShowStylesPanel(true)}
                  className="px-1 py-1 rounded border border-[#e0c392] bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                  title="Styles"
                >
                  ⚙
                </button>

                {/* Font Family dropdown */}
                <div
                  className="relative inline-flex items-center"
                  style={{ maxWidth: "120px" }}
                  onMouseDown={() => {
                    // Capture selection BEFORE the select steals focus
                    // Check paginated editor first, then editorRef
                    const scrollContainer =
                      paginatedEditorRef.current?.getScrollContainer();
                    const pageElements =
                      paginatedEditorRef.current?.getPageContentElements() ||
                      [];
                    const selection = window.getSelection();
                    if (
                      selection &&
                      selection.rangeCount > 0 &&
                      !selection.isCollapsed
                    ) {
                      const isInPaginated =
                        scrollContainer?.contains(selection.anchorNode) ||
                        pageElements.some((el) =>
                          el.contains(selection.anchorNode)
                        );
                      if (isInPaginated) {
                        lastSelectionRangeRef.current = selection
                          .getRangeAt(0)
                          .cloneRange();
                      } else if (
                        editorRef.current?.contains(selection.anchorNode)
                      ) {
                        lastSelectionRangeRef.current = selection
                          .getRangeAt(0)
                          .cloneRange();
                      }
                    }
                  }}
                >
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const selectedOption = FONT_FAMILY_OPTIONS.find(
                        (option) => option.value === selectedValue
                      );

                      if (!selectedOption) return;

                      setFontFamily(selectedOption.value);

                      // Restore selection from snapshot
                      if (!lastSelectionRangeRef.current) {
                        return;
                      }

                      // Restore selection BEFORE applying format
                      const selection = window.getSelection();
                      if (!selection || selection.rangeCount === 0) return;

                      selection.removeAllRanges();
                      selection.addRange(
                        lastSelectionRangeRef.current.cloneRange()
                      );

                      const range = selection.getRangeAt(0);
                      if (range.collapsed) return;

                      // Create marker nodes to track selection boundaries
                      const startMarker = document.createElement("span");
                      startMarker.id = "selection-start-marker-font";
                      startMarker.style.display = "none";
                      const endMarker = document.createElement("span");
                      endMarker.id = "selection-end-marker-font";
                      endMarker.style.display = "none";

                      // Insert markers at selection boundaries
                      const rangeClone = range.cloneRange();
                      rangeClone.collapse(false);
                      rangeClone.insertNode(endMarker);
                      rangeClone.setStart(
                        range.startContainer,
                        range.startOffset
                      );
                      rangeClone.collapse(true);
                      rangeClone.insertNode(startMarker);

                      // Recreate selection between markers
                      const newRange = document.createRange();
                      newRange.setStartAfter(startMarker);
                      newRange.setEndBefore(endMarker);
                      selection.removeAllRanges();
                      selection.addRange(newRange);

                      // Ensure the paginated editor retains focus for execCommand
                      paginatedEditorRef.current?.focus();

                      // Skip repagination to preserve selection
                      paginatedEditorRef.current?.setSkipNextRepagination(true);

                      // Apply formatting - this creates <font face="..."> tags
                      document.execCommand(
                        "fontName",
                        false,
                        selectedOption.commandValue
                      );

                      // Immediately replace font tags with styled spans
                      const fontNodes = document.querySelectorAll("font[face]");
                      fontNodes.forEach((fontNode) => {
                        const faceAttr = fontNode.getAttribute("face");
                        if (!faceAttr) return;

                        const normalizedFace = normalizeFontName(faceAttr);
                        const normalizedTargets = new Set(
                          selectedOption.matchFaces.map((face: string) =>
                            normalizeFontName(face)
                          )
                        );

                        if (!normalizedTargets.has(normalizedFace)) return;

                        if (
                          selectedOption.cssFamily &&
                          selectedOption.cssFamily.trim().length > 0
                        ) {
                          const span = document.createElement("span");
                          span.style.fontFamily = selectedOption.cssFamily;
                          while (fontNode.firstChild) {
                            span.appendChild(fontNode.firstChild);
                          }
                          fontNode.parentNode?.replaceChild(span, fontNode);
                        }
                      });

                      // Restore selection using markers and then clean up
                      setTimeout(() => {
                        const start = document.getElementById(
                          "selection-start-marker-font"
                        );
                        const end = document.getElementById(
                          "selection-end-marker-font"
                        );

                        if (start && end && paginatedEditorRef.current) {
                          try {
                            const restoreRange = document.createRange();
                            restoreRange.setStartAfter(start);
                            restoreRange.setEndBefore(end);

                            const sel = window.getSelection();
                            if (sel) {
                              sel.removeAllRanges();
                              sel.addRange(restoreRange);
                              lastSelectionRangeRef.current =
                                restoreRange.cloneRange();
                            }
                          } catch (e) {
                            console.warn("Could not restore selection:", e);
                          }

                          // Clean up markers
                          start.remove();
                          end.remove();
                        }

                        const paginatedEditor = paginatedEditorRef.current;
                        const inlineEditor = editorRef.current;

                        if (paginatedEditor && inlineEditor) {
                          const content = paginatedEditor.getContent();
                          inlineEditor.innerHTML = content;
                          onUpdate?.({
                            html: content,
                            text: inlineEditor.innerText,
                          });
                          if (saveTimeoutRef.current) {
                            clearTimeout(saveTimeoutRef.current);
                          }
                          saveTimeoutRef.current = setTimeout(() => {
                            saveToHistory(content);
                          }, 500);

                          paginatedEditor.setSkipNextRepagination(false);
                          paginatedEditor.focus();
                        }
                      }, 50);
                    }}
                    className="w-full px-1.5 py-1 pr-6 rounded border border-[#e0c392] hover:border-[#ef8432] transition-colors text-xs text-[#2a2421]"
                    title="Font Family"
                    style={{
                      backgroundColor: "#fff8ec",
                      color: "#2a2421",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      lineHeight: "1.2",
                      paddingRight: "24px",
                      backgroundImage: "none",
                      cursor: "pointer",
                    }}
                  >
                    {FONT_FAMILY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#2a2421]"
                    style={{
                      zIndex: 1,
                      userSelect: "none",
                    }}
                  >
                    ▼
                  </span>
                </div>

                {/* Font Size Controls */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const selection = window.getSelection();
                    if (
                      !selection ||
                      selection.rangeCount === 0 ||
                      selection.isCollapsed
                    )
                      return;

                    // Capture the selected text before any DOM changes
                    const selectedText = selection.toString();
                    const range = selection.getRangeAt(0);

                    // Create marker nodes to track selection boundaries
                    const startMarker = document.createElement("span");
                    startMarker.id = "selection-start-marker-temp";
                    startMarker.style.display = "none";
                    const endMarker = document.createElement("span");
                    endMarker.id = "selection-end-marker-temp";
                    endMarker.style.display = "none";

                    // Insert markers at selection boundaries
                    const rangeClone = range.cloneRange();
                    rangeClone.collapse(false);
                    rangeClone.insertNode(endMarker);
                    rangeClone.setStart(
                      range.startContainer,
                      range.startOffset
                    );
                    rangeClone.collapse(true);
                    rangeClone.insertNode(startMarker);

                    // Recreate selection between markers
                    const newRange = document.createRange();
                    newRange.setStartAfter(startMarker);
                    newRange.setEndBefore(endMarker);
                    selection.removeAllRanges();
                    selection.addRange(newRange);

                    const currentSize = parseInt(fontSize) || 16;
                    const newSize = Math.max(8, currentSize - 1);
                    setFontSize(`${newSize}px`);

                    // Skip repagination to preserve selection
                    paginatedEditorRef.current?.setSkipNextRepagination(true);

                    // Apply inline style for precise control
                    document.execCommand("fontSize", false, "7");

                    // Find and replace font elements with spans
                    const fontElements =
                      document.querySelectorAll('font[size="7"]');

                    fontElements.forEach((el) => {
                      const span = document.createElement("span");
                      span.style.fontSize = `${newSize}px`;
                      while (el.firstChild) {
                        span.appendChild(el.firstChild);
                      }
                      el.parentNode?.replaceChild(span, el);
                    });

                    // Restore selection using markers and then clean up
                    setTimeout(() => {
                      const start = document.getElementById(
                        "selection-start-marker-temp"
                      );
                      const end = document.getElementById(
                        "selection-end-marker-temp"
                      );

                      if (start && end && paginatedEditorRef.current) {
                        try {
                          const restoreRange = document.createRange();
                          restoreRange.setStartAfter(start);
                          restoreRange.setEndBefore(end);

                          const sel = window.getSelection();
                          if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(restoreRange);
                            lastSelectionRangeRef.current =
                              restoreRange.cloneRange();
                          }
                        } catch (e) {
                          console.warn("Could not restore selection:", e);
                        }

                        // Clean up markers
                        start.remove();
                        end.remove();
                      }

                      // Sync content and update history
                      if (paginatedEditorRef.current && editorRef.current) {
                        const content = paginatedEditorRef.current.getContent();
                        editorRef.current.innerHTML = content;
                        onUpdate?.({
                          html: content,
                          text: editorRef.current.innerText,
                        });
                        if (saveTimeoutRef.current) {
                          clearTimeout(saveTimeoutRef.current);
                        }
                        saveTimeoutRef.current = setTimeout(() => {
                          saveToHistory(content);
                        }, 500);

                        paginatedEditorRef.current?.setSkipNextRepagination(
                          false
                        );
                        paginatedEditorRef.current?.focus();
                      }
                    }, 50);
                  }}
                  className={`px-1.5 py-1 rounded transition-colors text-xs font-bold ${toolbarInactiveButtonClass}`}
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <div
                  ref={fontSizeDropdownRef}
                  className="relative inline-block"
                  style={{ position: "relative" }}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      snapshotCurrentSelection();
                      setShowFontSizeDropdown((prev) => !prev);
                    }}
                    className="px-1.5 py-1 text-xs text-[#2c3e50] min-w-[40px] text-center rounded border border-[#e0c392] hover:border-[#ef8432] hover:bg-[#fef5e7] transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title="Font Size"
                  >
                    <span>{parseInt(fontSize) || 16}</span>
                    <span style={{ fontSize: "8px", opacity: 0.6 }}>▼</span>
                  </button>
                  {showFontSizeDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        top: "100%",
                        marginTop: "4px",
                        width: "80px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        backgroundColor: "#fffaf3",
                        border: "1.5px solid #e0c392",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                      }}
                    >
                      {[
                        8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32,
                        36, 48, 72,
                      ].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const selection = window.getSelection();
                            if (
                              !selection ||
                              selection.rangeCount === 0 ||
                              selection.isCollapsed
                            ) {
                              // No selection - just update the state for new text
                              setFontSize(`${size}px`);
                              setShowFontSizeDropdown(false);
                              return;
                            }

                            // Apply font size to selection
                            const range = selection.getRangeAt(0);
                            const startMarker = document.createElement("span");
                            startMarker.id = "selection-start-marker-temp";
                            startMarker.style.display = "none";
                            const endMarker = document.createElement("span");
                            endMarker.id = "selection-end-marker-temp";
                            endMarker.style.display = "none";

                            const rangeClone = range.cloneRange();
                            rangeClone.collapse(false);
                            rangeClone.insertNode(endMarker);
                            rangeClone.setStart(
                              range.startContainer,
                              range.startOffset
                            );
                            rangeClone.collapse(true);
                            rangeClone.insertNode(startMarker);

                            const newRange = document.createRange();
                            newRange.setStartAfter(startMarker);
                            newRange.setEndBefore(endMarker);
                            selection.removeAllRanges();
                            selection.addRange(newRange);

                            setFontSize(`${size}px`);
                            paginatedEditorRef.current?.setSkipNextRepagination(
                              true
                            );

                            document.execCommand("fontSize", false, "7");

                            const fontElements =
                              document.querySelectorAll('font[size="7"]');
                            fontElements.forEach((el) => {
                              const span = document.createElement("span");
                              span.style.fontSize = `${size}px`;
                              while (el.firstChild) {
                                span.appendChild(el.firstChild);
                              }
                              el.parentNode?.replaceChild(span, el);
                            });

                            // Clean up markers
                            setTimeout(() => {
                              const start = document.getElementById(
                                "selection-start-marker-temp"
                              );
                              const end = document.getElementById(
                                "selection-end-marker-temp"
                              );
                              if (start) start.remove();
                              if (end) end.remove();

                              if (
                                paginatedEditorRef.current &&
                                editorRef.current
                              ) {
                                const content =
                                  paginatedEditorRef.current.getContent();
                                editorRef.current.innerHTML = content;
                                onUpdate?.({
                                  html: content,
                                  text: editorRef.current.innerText,
                                });
                                paginatedEditorRef.current?.setSkipNextRepagination(
                                  false
                                );
                                paginatedEditorRef.current?.focus();
                              }
                            }, 50);

                            setShowFontSizeDropdown(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "6px 12px",
                            textAlign: "center",
                            fontSize: "12px",
                            color:
                              parseInt(fontSize) === size
                                ? "#ef8432"
                                : "#2c3e50",
                            fontWeight:
                              parseInt(fontSize) === size ? "bold" : "normal",
                            backgroundColor:
                              parseInt(fontSize) === size
                                ? "#fef5e7"
                                : "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef5e7";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              parseInt(fontSize) === size
                                ? "#fef5e7"
                                : "transparent";
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const selection = window.getSelection();
                    if (
                      !selection ||
                      selection.rangeCount === 0 ||
                      selection.isCollapsed
                    )
                      return;

                    // Capture the selected text before any DOM changes
                    const selectedText = selection.toString();
                    const range = selection.getRangeAt(0);

                    // Create marker nodes to track selection boundaries
                    const startMarker = document.createElement("span");
                    startMarker.id = "selection-start-marker-temp";
                    startMarker.style.display = "none";
                    const endMarker = document.createElement("span");
                    endMarker.id = "selection-end-marker-temp";
                    endMarker.style.display = "none";

                    // Insert markers at selection boundaries
                    const rangeClone = range.cloneRange();
                    rangeClone.collapse(false);
                    rangeClone.insertNode(endMarker);
                    rangeClone.setStart(
                      range.startContainer,
                      range.startOffset
                    );
                    rangeClone.collapse(true);
                    rangeClone.insertNode(startMarker);

                    // Recreate selection between markers
                    const newRange = document.createRange();
                    newRange.setStartAfter(startMarker);
                    newRange.setEndBefore(endMarker);
                    selection.removeAllRanges();
                    selection.addRange(newRange);

                    const currentSize = parseInt(fontSize) || 16;
                    const newSize = Math.min(72, currentSize + 1);
                    setFontSize(`${newSize}px`);

                    // Skip repagination to preserve selection
                    paginatedEditorRef.current?.setSkipNextRepagination(true);

                    // Apply inline style for precise control
                    document.execCommand("fontSize", false, "7");

                    // Find and replace font elements with spans
                    const fontElements =
                      document.querySelectorAll('font[size="7"]');

                    fontElements.forEach((el) => {
                      const span = document.createElement("span");
                      span.style.fontSize = `${newSize}px`;
                      while (el.firstChild) {
                        span.appendChild(el.firstChild);
                      }
                      el.parentNode?.replaceChild(span, el);
                    });

                    // Restore selection using markers and then clean up
                    setTimeout(() => {
                      const start = document.getElementById(
                        "selection-start-marker-temp"
                      );
                      const end = document.getElementById(
                        "selection-end-marker-temp"
                      );

                      if (start && end && paginatedEditorRef.current) {
                        try {
                          const restoreRange = document.createRange();
                          restoreRange.setStartAfter(start);
                          restoreRange.setEndBefore(end);

                          const sel = window.getSelection();
                          if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(restoreRange);
                            lastSelectionRangeRef.current =
                              restoreRange.cloneRange();
                          }
                        } catch (e) {
                          console.warn("Could not restore selection:", e);
                        }

                        // Clean up markers
                        start.remove();
                        end.remove();
                      }

                      // Sync content and update history
                      if (paginatedEditorRef.current && editorRef.current) {
                        const content = paginatedEditorRef.current.getContent();
                        editorRef.current.innerHTML = content;
                        onUpdate?.({
                          html: content,
                          text: editorRef.current.innerText,
                        });
                        if (saveTimeoutRef.current) {
                          clearTimeout(saveTimeoutRef.current);
                        }
                        saveTimeoutRef.current = setTimeout(() => {
                          saveToHistory(content);
                        }, 500);

                        paginatedEditorRef.current?.setSkipNextRepagination(
                          false
                        );
                        paginatedEditorRef.current?.focus();
                      }
                    }, 50);
                  }}
                  className={`px-1.5 py-1 rounded transition-colors text-xs font-bold ${toolbarInactiveButtonClass}`}
                  title="Increase Font Size"
                >
                  A+
                </button>

                <div style={toolbarDividerStyle} aria-hidden="true" />

                {/* Text formatting */}
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("bold");
                  }}
                  className={`px-2 py-1 rounded font-bold transition-colors text-xs ${
                    isBold
                      ? "bg-[#ef8432] text-white border border-[#ef8432]"
                      : toolbarInactiveButtonClass
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("italic");
                  }}
                  className={`px-2 py-1 rounded italic transition-colors text-xs ${
                    isItalic
                      ? "bg-[#ef8432] text-white border border-[#ef8432]"
                      : toolbarInactiveButtonClass
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("underline");
                  }}
                  className={`px-2 py-1 rounded underline transition-colors text-xs ${
                    isUnderline
                      ? "bg-[#ef8432] text-white border border-[#ef8432]"
                      : toolbarInactiveButtonClass
                  }`}
                  title="Underline"
                >
                  U
                </button>

                <div style={toolbarDividerStyle} aria-hidden="true" />

                {/* Text alignment */}
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    alignText("left");
                  }}
                  className={`px-1.5 py-1 rounded transition-colors text-xs ${
                    textAlign === "left"
                      ? "bg-[#ef8432] text-white border border-[#ef8432]"
                      : toolbarInactiveButtonClass
                  }`}
                  title="Align Left"
                >
                  ≡
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    alignText("center");
                  }}
                  className={`px-1.5 py-1 rounded transition-colors text-xs ${
                    textAlign === "center"
                      ? "bg-[#ef8432] text-white border border-[#ef8432]"
                      : toolbarInactiveButtonClass
                  }`}
                  title="Center"
                >
                  ≡
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    alignText("right");
                  }}
                  className={`px-1.5 py-1 rounded transition-colors text-xs ${
                    textAlign === "right"
                      ? "bg-[#ef8432] text-white border border-[#ef8432]"
                      : toolbarInactiveButtonClass
                  }`}
                  title="Align Right"
                >
                  ≡
                </button>
              </div>
            </div>

            {/* Center Toolbar Column */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                justifySelf: "center",
              }}
            >
              {analysisLegendElement || toolbarCenterPlaceholder}
            </div>

            {/* Right Toolbar Column */}
            <div
              className="writer-toolbar-shell"
              style={{
                padding: "6px 10px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
                border: "1.5px solid #e0c392",
                boxShadow: "0 4px 12px rgba(239, 132, 50, 0.12)",
                flexShrink: 0,
                justifySelf: "end",
              }}
            >
              <div
                className="toolbar flex items-center gap-1"
                style={{
                  flexWrap: "nowrap",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                {/* Lists */}
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("insertUnorderedList");
                  }}
                  className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                  title="Bullet List"
                >
                  •
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("insertOrderedList");
                  }}
                  className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                  title="Numbered List"
                >
                  1.
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand("outdent", false);
                    handleInput();
                  }}
                  className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                  title="Decrease Indent (Outdent)"
                >
                  ⇤
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand("indent", false);
                    handleInput();
                  }}
                  className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                  title="Increase Indent"
                >
                  ⇥
                </button>

                <div style={toolbarDividerStyle} aria-hidden="true" />

                {/* Bookmarks & Cross-References */}
                <button
                  onClick={openBookmarkModal}
                  className={`px-2 py-1 rounded transition-colors text-xs border border-[#e0c392] ${
                    bookmarks.length > 0
                      ? "bg-[#f7e6d0] text-[#ef8432]"
                      : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                  }`}
                  title="Add Bookmark"
                >
                  🔖
                </button>
                <button
                  onClick={openCrossRefModal}
                  className={`px-2 py-1 rounded transition-colors text-xs border border-[#e0c392] ${
                    crossReferences.length > 0
                      ? "bg-[#f7e6d0] text-[#ef8432]"
                      : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                  }`}
                  title="Add Cross-Reference"
                >
                  🔗
                </button>
                <button
                  onClick={() => setShowBookmarksPanel(!showBookmarksPanel)}
                  className={`px-2 py-1 rounded transition-colors text-xs border border-[#e0c392] ${
                    showBookmarksPanel
                      ? "bg-[#f7e6d0] text-[#ef8432]"
                      : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                  }`}
                  title={`View Bookmarks & References (${
                    bookmarks.length + crossReferences.length
                  })`}
                >
                  📋
                </button>
                <label
                  className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors cursor-pointer text-xs"
                  title="Image"
                >
                  📸
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Column Layout Dropdown */}
                <div
                  ref={columnDropdownRef}
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className={`px-2 py-1 rounded transition-colors text-xs ${
                      showColumnDropdown
                        ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                        : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                    }`}
                    title="Insert Columns - Side-by-side text areas"
                  >
                    ▥
                  </button>
                  {showColumnDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "4px",
                        backgroundColor: "#fffaf3",
                        border: "1.5px solid #e0c392",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        padding: "8px",
                        zIndex: 1000,
                        minWidth: "180px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          marginBottom: "8px",
                          fontWeight: 600,
                        }}
                      >
                        Insert Column Layout
                      </div>
                      <button
                        onClick={() => insertColumnLayout(2)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "6px 10px",
                          marginBottom: "4px",
                          backgroundColor: "#fef5e7",
                          border: "1px solid #e0c392",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f7e6d0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fef5e7")
                        }
                      >
                        <span style={{ display: "flex", gap: "2px" }}>
                          <span
                            style={{
                              width: "20px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "20px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                        </span>
                        2 Columns
                      </button>
                      <button
                        onClick={() => insertColumnLayout(3)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "6px 10px",
                          marginBottom: "4px",
                          backgroundColor: "#fef5e7",
                          border: "1px solid #e0c392",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f7e6d0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fef5e7")
                        }
                      >
                        <span style={{ display: "flex", gap: "2px" }}>
                          <span
                            style={{
                              width: "14px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "14px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "14px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                        </span>
                        3 Columns
                      </button>
                      <button
                        onClick={() => insertColumnLayout(4)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "6px 10px",
                          backgroundColor: "#fef5e7",
                          border: "1px solid #e0c392",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f7e6d0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fef5e7")
                        }
                      >
                        <span style={{ display: "flex", gap: "2px" }}>
                          <span
                            style={{
                              width: "10px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "10px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "10px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "10px",
                              height: "16px",
                              backgroundColor: "#e0c392",
                              borderRadius: "2px",
                            }}
                          ></span>
                        </span>
                        4 Columns
                      </button>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#888",
                          marginTop: "8px",
                          lineHeight: 1.3,
                        }}
                      >
                        Each column is independently editable. Click inside a
                        column to type.
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={copyFormat}
                  className={`px-2 py-1 rounded transition-colors text-xs ${
                    formatPainterActive
                      ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                      : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                  }`}
                  title="Format Painter - Copy formatting from selection"
                >
                  🖌️
                </button>

                {/* Color Wheel & Style Templates */}
                <ColorWheelDropdown
                  documentStyles={documentStyles}
                  onStyleChange={handleStylePropertyChange}
                  onApplyTemplate={handleApplyStyleTemplate}
                  onSaveTemplate={handleSaveStyleTemplate}
                  savedTemplates={savedStyleTemplates}
                  onDeleteTemplate={handleDeleteStyleTemplate}
                />

                {/* Page Break */}
                <button
                  onClick={() => {
                    if (insertPageBreakAtCursor()) {
                      handleInput();
                    }
                  }}
                  className="px-2 py-1 rounded transition-colors text-xs bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                  title="Insert Page Break - Start new page here"
                >
                  📄
                </button>

                <div style={toolbarDividerStyle} aria-hidden="true" />

                {/* Utilities */}
                <button
                  onClick={() => setShowFindReplace(!showFindReplace)}
                  className={`px-2 py-1 rounded transition-colors text-xs ${
                    showFindReplace
                      ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                      : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                  }`}
                  title="Find"
                >
                  🔍
                </button>

                <div style={toolbarDividerStyle} aria-hidden="true" />

                {/* History */}
                <button
                  onClick={performUndo}
                  disabled={!canUndo}
                  className="px-2 py-1 rounded hover:bg-gray-200 text-[#111827] transition-colors text-xs disabled:opacity-30"
                  title="Undo"
                >
                  ↶
                </button>
                <button
                  onClick={performRedo}
                  disabled={!canRedo}
                  className="px-2 py-1 rounded hover:bg-gray-200 text-[#111827] transition-colors text-xs disabled:opacity-30"
                  title="Redo"
                >
                  ↷
                </button>

                <div style={toolbarDividerStyle} aria-hidden="true" />

                {/* View options */}
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                    focusMode ? "active" : ""
                  }`}
                  title="Focus Mode"
                >
                  🎯
                </button>
                <button
                  onClick={() => setShowStyleLabels(!showStyleLabels)}
                  className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                    showStyleLabels ? "active" : ""
                  }`}
                  title={
                    showStyleLabels
                      ? "Hide Style Labels & Indicators"
                      : "Show Style Labels & Indicators"
                  }
                >
                  🏷️
                </button>
                <button
                  onClick={() => setTypewriterMode(!typewriterMode)}
                  className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                    typewriterMode ? "active" : ""
                  }`}
                  title="Typewriter Mode"
                >
                  ⌨️
                </button>

                {/* Character Management (Tier 3 only) */}
                {isProfessionalTier && onOpenCharacterManager && (
                  <>
                    <div style={toolbarDividerStyle} aria-hidden="true" />
                    <div ref={characterPopoverRef}>
                      <button
                        ref={characterButtonRef}
                        onClick={() => {
                          if (
                            !showCharacterPopover &&
                            characterButtonRef.current
                          ) {
                            const rect =
                              characterButtonRef.current.getBoundingClientRect();
                            setPopoverPosition({
                              top: rect.bottom + 4,
                              right: window.innerWidth - rect.right,
                            });
                          }
                          setShowCharacterPopover(!showCharacterPopover);
                        }}
                        className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                          showCharacterPopover ? "active" : ""
                        }`}
                        title="Character Tools"
                      >
                        👥
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {documentTools && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  padding: "4px 8px",
                  width: "100%",
                  maxWidth: "816px",
                  margin: "0 auto",
                }}
              >
                {documentTools}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Character Popover - rendered outside toolbar to avoid overflow:hidden */}
      {showCharacterPopover && isProfessionalTier && (
        <div
          ref={characterPopoverRef}
          style={{
            position: "fixed",
            top: popoverPosition.top,
            right: popoverPosition.right,
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: `1px solid ${palette.lightBorder}`,
            padding: "12px",
            minWidth: "280px",
            zIndex: 9999,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <button
              onClick={() => {
                onOpenCharacterManager?.();
                setShowCharacterPopover(false);
              }}
              className="w-full px-3 py-2 rounded transition-colors text-sm text-left hover:bg-gray-100"
              style={{
                border: `1px solid ${palette.lightBorder}`,
              }}
            >
              👥 Manage Characters...
            </button>
          </div>

          {characters && characters.length > 0 && (
            <>
              <div
                style={{
                  borderTop: `1px solid ${palette.lightBorder}`,
                  paddingTop: "12px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  🔗 Link Selection to Character
                </div>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border bg-white hover:bg-gray-50 transition-colors text-sm mb-2"
                >
                  <option value="">Select character...</option>
                  {characters
                    .sort((a, b) => {
                      const roleOrder: Record<string, number> = {
                        protagonist: 1,
                        antagonist: 2,
                        deuteragonist: 3,
                        "love-interest": 4,
                        mentor: 5,
                        sidekick: 6,
                        foil: 7,
                        supporting: 8,
                        minor: 9,
                      };
                      return (
                        (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999)
                      );
                    })
                    .map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.role})
                      </option>
                    ))}
                </select>
                <button
                  onClick={linkSelectedTextToCharacter}
                  disabled={!selectedCharacterId}
                  className="w-full px-3 py-1.5 rounded transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedCharacterId
                      ? palette.accent
                      : palette.subtle,
                    color: selectedCharacterId ? "white" : palette.navy,
                    border: `1px solid ${
                      selectedCharacterId ? palette.accent : palette.lightBorder
                    }`,
                  }}
                >
                  🔗 Link Selected Text
                </button>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  Select text in editor, then click Link
                </div>
              </div>
            </>
          )}

          {(!characters || characters.length === 0) && (
            <div
              style={{
                fontSize: "12px",
                color: "#888",
                fontStyle: "italic",
              }}
            >
              No characters yet. Click above to add some!
            </div>
          )}
        </div>
      )}

      {/* Sprint Timer Display */}
      {sprintMode && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "16px 24px",
            backgroundColor: "#10b981",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            zIndex: 1100,
            fontSize: "24px",
            fontWeight: 700,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div>
            {Math.floor(sprintTimeRemaining / 60)}:
            {String(sprintTimeRemaining % 60).padStart(2, "0")}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            {statistics.words - sprintStartWords} words written
          </div>
          <button
            onClick={stopSprint}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Stop Sprint
          </button>
        </div>
      )}

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={() => {
            setShowBookmarkModal(false);
            setNewBookmarkName("");
            setSelectedTextForBookmark("");
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            style={{ border: "2px solid #e0c392" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-gradient-to-r from-[#fef5e7] to-[#fff7ed] -m-6 mb-4 rounded-t-lg border-b border-[#e0c392]">
              <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "#92400e" }}
              >
                <span>🔖</span> Add Bookmark
              </h3>
            </div>
            {selectedTextForBookmark ? (
              <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">
                  Selected text:
                </div>
                <div className="text-sm italic" style={{ color: "#78716c" }}>
                  "{selectedTextForBookmark.substring(0, 100)}
                  {selectedTextForBookmark.length > 100 ? "..." : ""}"
                </div>
              </div>
            ) : (
              <div
                className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm italic"
                style={{ color: "#78716c" }}
              >
                No text selected. Select text in the editor first to bookmark a
                specific passage.
              </div>
            )}
            <input
              type="text"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              placeholder="Bookmark name (e.g., 'Important plot point')"
              className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newBookmarkName.trim() &&
                  selectedTextForBookmark
                )
                  addBookmark();
                if (e.key === "Escape") setShowBookmarkModal(false);
              }}
            />
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm" style={{ color: "#92400e" }}>
                Color:
              </label>
              <div className="flex gap-2">
                {[
                  "#fbbf24",
                  "#ef4444",
                  "#22c55e",
                  "#3b82f6",
                  "#a855f7",
                  "#ec4899",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewBookmarkColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newBookmarkColor === color
                        ? "scale-125 border-gray-800"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div
              className="text-xs mb-4 p-2 bg-amber-50 rounded"
              style={{ color: "#92400e" }}
            >
              💡 To remove a bookmark: Open the 📋 panel and hover over the
              bookmark to see the delete button.
            </div>
            <div className="flex justify-end">
              <button
                onClick={addBookmark}
                disabled={!newBookmarkName.trim() || !selectedTextForBookmark}
                className="px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#3a332b",
                  color: "#fef5e7",
                  border: "1px solid #e0c392",
                }}
              >
                Add Bookmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Reference Modal */}
      {showCrossRefModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            style={{ border: "2px solid #a855f7" }}
          >
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <span>🔗</span> Add Cross-Reference
            </h3>
            <p className="text-xs text-[#111827] mb-4">
              Link this passage to a bookmarked scene (foreshadowing, callbacks,
              related elements)
            </p>
            {selectedTextForBookmark ? (
              <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                <div className="text-xs text-purple-700 mb-1">Source text:</div>
                <div className="text-sm text-[#111827] italic">
                  "{selectedTextForBookmark.substring(0, 100)}
                  {selectedTextForBookmark.length > 100 ? "..." : ""}"
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-[#111827] italic">
                No text selected. Select text to mark as a reference point.
              </div>
            )}
            <input
              type="text"
              value={newCrossRefName}
              onChange={(e) => setNewCrossRefName(e.target.value)}
              placeholder="Reference name (e.g., 'Foreshadows ending')"
              className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            {bookmarks.length > 0 ? (
              <div className="mb-3">
                <label className="block text-sm text-[#111827] mb-1">
                  Links to bookmark:
                </label>
                <select
                  value={newCrossRefTarget}
                  onChange={(e) => setNewCrossRefTarget(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a bookmark...</option>
                  {bookmarks.map((bm) => (
                    <option key={bm.id} value={bm.id}>
                      🔖 {bm.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-sm text-yellow-700 mb-2">
                  ⚠️ No bookmarks yet. Create bookmarks first to link passages
                  together.
                </div>
                <button
                  onClick={() => {
                    setShowCrossRefModal(false);
                    setShowBookmarkModal(true);
                  }}
                  className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                >
                  🔖 Create a Bookmark First
                </button>
              </div>
            )}
            <textarea
              value={newCrossRefNote}
              onChange={(e) => setNewCrossRefNote(e.target.value)}
              placeholder="Notes (optional) - e.g., 'This scene connects to...'"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCrossRefModal(false);
                  setNewCrossRefName("");
                  setNewCrossRefTarget("");
                  setNewCrossRefNote("");
                  setSelectedTextForBookmark("");
                }}
                className="px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCrossReference}
                disabled={
                  !newCrossRefName.trim() ||
                  !selectedTextForBookmark ||
                  !newCrossRefTarget
                }
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !selectedTextForBookmark
                    ? "Select text in editor first"
                    : !newCrossRefName.trim()
                    ? "Enter a reference name"
                    : !newCrossRefTarget
                    ? "Select a bookmark to link to"
                    : "Create cross-reference"
                }
              >
                Add Reference
              </button>
            </div>
            {/* Help text showing what's needed */}
            {(!selectedTextForBookmark ||
              !newCrossRefName.trim() ||
              !newCrossRefTarget) && (
              <div className="mt-3 pt-3 border-t text-xs text-[#111827]">
                <strong>To add a reference:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-0.5">
                  {!selectedTextForBookmark && (
                    <li className="text-red-500">Select text in the editor</li>
                  )}
                  {!newCrossRefName.trim() && (
                    <li className="text-red-500">
                      Enter a reference name above
                    </li>
                  )}
                  {bookmarks.length === 0 && (
                    <li className="text-red-500">
                      Create a bookmark first (🔖 button)
                    </li>
                  )}
                  {bookmarks.length > 0 && !newCrossRefTarget && (
                    <li className="text-red-500">
                      Select a bookmark to link to
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks & Cross-References Panel */}
      {showBookmarksPanel && (
        <>
          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-[89]"
            onClick={() => setShowBookmarksPanel(false)}
          />
          <div
            className="fixed right-4 top-20 bg-white rounded-lg shadow-2xl z-[90] overflow-hidden"
            style={{
              width: "320px",
              maxHeight: "70vh",
              border: "2px solid #e0c392",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-gradient-to-r from-[#fef5e7] to-[#fff7ed] border-b border-[#e0c392]">
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ color: "#92400e" }}
              >
                <span>📋</span> <span>Bookmarks & References</span>
              </h3>
            </div>
            <div
              className="overflow-y-auto bg-white"
              style={{ maxHeight: "calc(70vh - 50px)" }}
            >
              {/* Bookmarks Section */}
              <div className="p-3 border-b border-[#e0c392]">
                <div className="flex items-center gap-2 mb-2">
                  <span>🔖</span>
                  <span
                    className="font-medium text-sm"
                    style={{ color: "#92400e" }}
                  >
                    Bookmarks ({bookmarks.length})
                  </span>
                </div>
                {bookmarks.length === 0 ? (
                  <div
                    className="text-xs italic py-2"
                    style={{ color: "#78716c" }}
                  >
                    No bookmarks yet. Select text and click 🔖 to add one.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="p-2 rounded border hover:bg-gray-50 cursor-pointer group"
                        style={{ borderLeft: `4px solid ${bookmark.color}` }}
                        onClick={() => jumpToBookmark(bookmark)}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-medium text-sm"
                            style={{ color: "#92400e" }}
                          >
                            {bookmark.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBookmark(bookmark.id);
                            }}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div
                          className="text-xs mt-1 truncate italic"
                          style={{ color: "#78716c" }}
                        >
                          "{bookmark.selectedText.substring(0, 60)}
                          {bookmark.selectedText.length > 60 ? "..." : ""}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cross-References Section */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span>🔗</span>
                  <span
                    className="font-medium text-sm"
                    style={{ color: "#92400e" }}
                  >
                    Cross-References ({crossReferences.length})
                  </span>
                </div>
                {crossReferences.length === 0 ? (
                  <div
                    className="text-xs italic py-2"
                    style={{ color: "#78716c" }}
                  >
                    No cross-references yet. Link related scenes or
                    foreshadowing elements.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {crossReferences.map((crossRef) => {
                      const targetBookmark = bookmarks.find(
                        (b) => b.id === crossRef.targetBookmarkId
                      );
                      return (
                        <div
                          key={crossRef.id}
                          className="p-2 rounded border border-purple-200 bg-purple-50 group"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="font-medium text-sm"
                              style={{ color: "#92400e" }}
                            >
                              {crossRef.name}
                            </span>
                            <button
                              onClick={() => deleteCrossReference(crossRef.id)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div
                            className="text-xs mt-1 italic"
                            style={{ color: "#78716c" }}
                          >
                            "{crossRef.sourceText.substring(0, 40)}
                            {crossRef.sourceText.length > 40 ? "..." : ""}"
                          </div>
                          {targetBookmark && (
                            <div
                              className="text-xs mt-2 flex items-center gap-1 text-amber-700 cursor-pointer hover:underline"
                              onClick={() => jumpToBookmark(targetBookmark)}
                            >
                              <span>→</span>
                              <span style={{ color: targetBookmark.color }}>
                                🔖
                              </span>
                              <span>{targetBookmark.name}</span>
                            </div>
                          )}
                          {crossRef.note && (
                            <div
                              className="text-xs mt-1 bg-white rounded px-2 py-1"
                              style={{ color: "#78716c" }}
                            >
                              {crossRef.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Styles Panel Modal */}
      {showStylesPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[100] p-4 pt-16 overflow-y-auto"
          onClick={() => setShowStylesPanel(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            style={{ border: "2px solid #e0c392" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b bg-gradient-to-r from-[#fef5e7] to-[#fff7ed] flex-shrink-0">
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: stylesPanelTitleColor }}
              >
                <span>⚙</span> Modify Styles
              </h2>
              <p className="text-xs text-[#6b7280] mt-1">
                Customize formatting for all style categories. Click a section
                to expand.
              </p>
            </div>

            {/* Templates Section */}
            {savedStyleTemplates.length > 0 && (
              <div className="p-3 border-b border-[#e0c392] bg-[#fffdf9]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#6b4423]">
                    📋 Saved Templates:
                  </label>
                  {activeTemplate && (
                    <span className="text-[10px] text-[#6b7280]">
                      Active:{" "}
                      {savedStyleTemplates.find((t) => t.id === activeTemplate)
                        ?.name || "Custom"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {savedStyleTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyStyleTemplate(template)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        activeTemplate === template.id
                          ? "bg-[#ef8432] text-white"
                          : "bg-[#f5ead9] hover:bg-[#eddcc5] text-[#6b4423]"
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1">
              {/* Accordion Sections for each category */}
              {BLOCK_TYPE_SECTIONS.map((section) => (
                <div key={section.key} className="border-b border-[#e0c392]">
                  {/* Section Header - Collapsible */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedStylesSections((prev) => {
                        const next = new Set(prev);
                        if (next.has(section.key)) {
                          next.delete(section.key);
                        } else {
                          next.add(section.key);
                        }
                        return next;
                      });
                    }}
                    className="w-full px-4 py-2 flex items-center justify-between bg-[#f5ead9] hover:bg-[#eddcc5] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: section.accent }}
                      />
                      <span
                        className="font-semibold text-sm"
                        style={{ color: stylesPanelSectionHeadingColor }}
                      >
                        {section.label}
                      </span>
                      <span className="text-xs text-[#6b7280]">
                        ({section.items.length} styles)
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7280]">
                      {expandedStylesSections.has(section.key) ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Section Content - Expanded */}
                  {expandedStylesSections.has(section.key) && (
                    <div className="p-3 bg-[#fffaf3] space-y-2">
                      {section.items.map((item) => {
                        // Map block type value to documentStyles key
                        const styleKey =
                          item.value === "p"
                            ? "paragraph"
                            : item.value === "h1"
                            ? "heading1"
                            : item.value === "h2"
                            ? "heading2"
                            : item.value === "h3"
                            ? "heading3"
                            : item.value === "h4"
                            ? "heading3"
                            : item.value === "h5"
                            ? "heading3"
                            : item.value === "h6"
                            ? "heading3"
                            : item.value === "blockquote"
                            ? "blockquote"
                            : item.value === "pre"
                            ? "paragraph"
                            : item.value;

                        const style =
                          documentStyles[
                            styleKey as keyof typeof documentStyles
                          ];

                        if (!style) return null;

                        return (
                          <div
                            key={item.value}
                            className="p-2 border rounded bg-white"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-xs font-medium"
                                style={{ color: stylesPanelItemLabelColor }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5 text-xs">
                              <div>
                                <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                  Size
                                </label>
                                <input
                                  type="number"
                                  value={(style as any).fontSize || 16}
                                  onChange={(e) =>
                                    setDocumentStyles((prev) => ({
                                      ...prev,
                                      [styleKey]: {
                                        ...(prev as any)[styleKey],
                                        fontSize: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                  min="8"
                                  max="72"
                                />
                              </div>
                              <div>
                                <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                  Weight
                                </label>
                                <select
                                  value={(style as any).fontWeight || "normal"}
                                  onChange={(e) =>
                                    setDocumentStyles((prev) => ({
                                      ...prev,
                                      [styleKey]: {
                                        ...(prev as any)[styleKey],
                                        fontWeight: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-0.5 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                >
                                  <option value="normal">Norm</option>
                                  <option value="bold">Bold</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                  Style
                                </label>
                                <select
                                  value={(style as any).fontStyle || "normal"}
                                  onChange={(e) =>
                                    setDocumentStyles((prev) => ({
                                      ...prev,
                                      [styleKey]: {
                                        ...(prev as any)[styleKey],
                                        fontStyle: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-0.5 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                >
                                  <option value="normal">Norm</option>
                                  <option value="italic">Italic</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                  Align
                                </label>
                                <select
                                  value={(style as any).textAlign || "left"}
                                  onChange={(e) =>
                                    setDocumentStyles((prev) => ({
                                      ...prev,
                                      [styleKey]: {
                                        ...(prev as any)[styleKey],
                                        textAlign: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-0.5 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                >
                                  <option value="left">L</option>
                                  <option value="center">C</option>
                                  <option value="right">R</option>
                                  <option value="justify">J</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                  Before
                                </label>
                                <input
                                  type="number"
                                  value={(style as any).marginTop || 0}
                                  onChange={(e) =>
                                    setDocumentStyles((prev) => ({
                                      ...prev,
                                      [styleKey]: {
                                        ...(prev as any)[styleKey],
                                        marginTop: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                />
                              </div>
                              <div>
                                <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                  After
                                </label>
                                <input
                                  type="number"
                                  value={(style as any).marginBottom || 0}
                                  onChange={(e) =>
                                    setDocumentStyles((prev) => ({
                                      ...prev,
                                      [styleKey]: {
                                        ...(prev as any)[styleKey],
                                        marginBottom: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                />
                              </div>
                            </div>
                            {/* Additional controls for styles with special properties */}
                            {((style as any).firstLineIndent !== undefined ||
                              (style as any).lineHeight !== undefined ||
                              (style as any).marginLeft !== undefined ||
                              (style as any).borderLeftWidth !== undefined) && (
                              <div className="grid grid-cols-6 gap-1.5 text-xs mt-1.5 pt-1.5 border-t border-[#e0c392]">
                                {(style as any).firstLineIndent !==
                                  undefined && (
                                  <div>
                                    <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                      Indent
                                    </label>
                                    <input
                                      type="number"
                                      value={(style as any).firstLineIndent}
                                      onChange={(e) =>
                                        setDocumentStyles((prev) => ({
                                          ...prev,
                                          [styleKey]: {
                                            ...(prev as any)[styleKey],
                                            firstLineIndent: Number(
                                              e.target.value
                                            ),
                                          },
                                        }))
                                      }
                                      className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                      min="0"
                                      max="200"
                                    />
                                  </div>
                                )}
                                {(style as any).lineHeight !== undefined && (
                                  <div>
                                    <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                      Line Ht
                                    </label>
                                    <select
                                      value={(style as any).lineHeight}
                                      onChange={(e) =>
                                        setDocumentStyles((prev) => ({
                                          ...prev,
                                          [styleKey]: {
                                            ...(prev as any)[styleKey],
                                            lineHeight: Number(e.target.value),
                                          },
                                        }))
                                      }
                                      className="w-full px-0.5 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                    >
                                      <option value="1">1.0</option>
                                      <option value="1.15">1.15</option>
                                      <option value="1.4">1.4</option>
                                      <option value="1.5">1.5</option>
                                      <option value="1.6">1.6</option>
                                      <option value="1.7">1.7</option>
                                      <option value="2">2.0</option>
                                    </select>
                                  </div>
                                )}
                                {(style as any).marginLeft !== undefined && (
                                  <div>
                                    <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                      L Margin
                                    </label>
                                    <input
                                      type="number"
                                      value={(style as any).marginLeft}
                                      onChange={(e) =>
                                        setDocumentStyles((prev) => ({
                                          ...prev,
                                          [styleKey]: {
                                            ...(prev as any)[styleKey],
                                            marginLeft: Number(e.target.value),
                                          },
                                        }))
                                      }
                                      className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                      min="0"
                                      max="200"
                                    />
                                  </div>
                                )}
                                {(style as any).marginRight !== undefined && (
                                  <div>
                                    <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                      R Margin
                                    </label>
                                    <input
                                      type="number"
                                      value={(style as any).marginRight}
                                      onChange={(e) =>
                                        setDocumentStyles((prev) => ({
                                          ...prev,
                                          [styleKey]: {
                                            ...(prev as any)[styleKey],
                                            marginRight: Number(e.target.value),
                                          },
                                        }))
                                      }
                                      className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                      min="0"
                                      max="200"
                                    />
                                  </div>
                                )}
                                {(style as any).borderLeftWidth !==
                                  undefined && (
                                  <>
                                    <div>
                                      <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                        Border
                                      </label>
                                      <input
                                        type="number"
                                        value={(style as any).borderLeftWidth}
                                        onChange={(e) =>
                                          setDocumentStyles((prev) => ({
                                            ...prev,
                                            [styleKey]: {
                                              ...(prev as any)[styleKey],
                                              borderLeftWidth: Number(
                                                e.target.value
                                              ),
                                            },
                                          }))
                                        }
                                        className="w-full px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                                        min="0"
                                        max="10"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[#6b7280] mb-0.5 text-[10px]">
                                        Color
                                      </label>
                                      <input
                                        type="color"
                                        value={
                                          (style as any).borderLeftColor ||
                                          "#e0c392"
                                        }
                                        onChange={(e) =>
                                          setDocumentStyles((prev) => ({
                                            ...prev,
                                            [styleKey]: {
                                              ...(prev as any)[styleKey],
                                              borderLeftColor: e.target.value,
                                            },
                                          }))
                                        }
                                        className="w-full h-5 px-0.5 border rounded cursor-pointer"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Header & Footer Section - Always visible at bottom */}
              <div className="border-b border-[#e0c392]">
                <button
                  type="button"
                  onClick={() => {
                    setExpandedStylesSections((prev) => {
                      const next = new Set(prev);
                      if (next.has("header-footer")) {
                        next.delete("header-footer");
                      } else {
                        next.add("header-footer");
                      }
                      return next;
                    });
                  }}
                  className="w-full px-4 py-2 flex items-center justify-between bg-[#f5ead9] hover:bg-[#eddcc5] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📄</span>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: stylesPanelSectionHeadingColor }}
                    >
                      Header & Footer
                    </span>
                  </div>
                  <span className="text-xs text-[#6b7280]">
                    {expandedStylesSections.has("header-footer") ? "▼" : "▶"}
                  </span>
                </button>

                {expandedStylesSections.has("header-footer") && (
                  <div className="p-3 bg-[#fffaf3]">
                    <div className="p-2 border rounded bg-white space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            className="block text-xs mb-1"
                            style={{ color: "rgb(245,166,36)" }}
                          >
                            Header (multiline)
                          </label>
                          <textarea
                            value={headerText}
                            onChange={(e) => setHeaderText(e.target.value)}
                            placeholder="Line 1\nLine 2\nLine 3"
                            rows={3}
                            className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432] resize-none"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs"
                            style={{ color: "rgb(245,166,36)" }}
                          >
                            Align
                          </label>
                          <select
                            value={headerAlign}
                            onChange={(e) =>
                              setHeaderAlign(
                                e.target.value as
                                  | "left"
                                  | "center"
                                  | "right"
                                  | "justify"
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            className="block text-xs mb-1"
                            style={{ color: "rgb(245,166,36)" }}
                          >
                            Footer (multiline)
                          </label>
                          <textarea
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="Line 1\nLine 2"
                            rows={2}
                            className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432] resize-none"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs"
                            style={{ color: "rgb(245,166,36)" }}
                          >
                            Align
                          </label>
                          <select
                            value={footerAlign}
                            onChange={(e) =>
                              setFooterAlign(
                                e.target.value as
                                  | "left"
                                  | "center"
                                  | "right"
                                  | "justify"
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showPageNumbers}
                            onChange={(e) =>
                              setShowPageNumbers(e.target.checked)
                            }
                            className="w-3 h-3 rounded border-gray-300 text-[#ef8432] focus:ring-[#ef8432]"
                          />
                          <span style={{ color: "rgb(245,166,36)" }}>
                            Page #s
                          </span>
                        </label>
                        {showPageNumbers && (
                          <>
                            <select
                              value={pageNumberPosition}
                              onChange={(e) =>
                                setPageNumberPosition(
                                  e.target.value as "header" | "footer"
                                )
                              }
                              className="px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                            >
                              <option value="header">In Header</option>
                              <option value="footer">In Footer</option>
                            </select>
                            <label
                              className="flex items-center gap-1 cursor-pointer"
                              title="Alternate page numbers on outside edges (left on even pages, right on odd pages)"
                            >
                              <input
                                type="checkbox"
                                checked={facingPages}
                                onChange={(e) =>
                                  setFacingPages(e.target.checked)
                                }
                                className="w-3 h-3 rounded border-gray-300 text-[#ef8432] focus:ring-[#ef8432]"
                              />
                              <span style={{ color: "rgb(245,166,36)" }}>
                                Facing Pages
                              </span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
              <button
                onClick={(e) => {
                  // Reset to defaults
                  setDocumentStyles(buildDefaultDocumentStyles());
                  setHeaderText("");
                  setFooterText("");
                  setShowPageNumbers(true);
                  setPageNumberPosition("footer");
                  setHeaderAlign("center");
                  setFooterAlign("center");
                  // Visual feedback
                  const btn = e.currentTarget;
                  const originalText = btn.textContent;
                  btn.textContent = "✓ Reset!";
                  btn.classList.add("text-green-600");
                  setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove("text-green-600");
                  }, 1500);
                }}
                className="px-3 py-1.5 text-sm text-[#111827] hover:text-[#ef8432] transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    // Apply styles to CSS variables and close
                    if (editorRef.current) {
                      editorRef.current.style.setProperty(
                        "--first-line-indent",
                        `${documentStyles.paragraph.firstLineIndent}px`
                      );
                    }
                    // Visual feedback before closing
                    const btn = e.currentTarget;
                    const originalText = btn.textContent;
                    btn.textContent = "✓ Applied!";
                    btn.classList.remove("bg-[#ef8432]");
                    btn.classList.add("bg-green-600");
                    setTimeout(() => {
                      setShowStylesPanel(false);
                    }, 800);
                  }}
                  className="px-3 py-1.5 text-sm bg-[#ef8432] text-white rounded hover:bg-[#d97320] transition-colors"
                >
                  Apply Styles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div className="border-b bg-yellow-50 p-3 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find..."
            className="px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") findInText();
              if (e.key === "Escape") setShowFindReplace(false);
            }}
          />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            className="px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowFindReplace(false);
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={findInText}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              disabled={!findText}
            >
              Find Next
            </button>
            {findMatches.length > 0 && (
              <span className="text-xs text-[#111827]">
                {Math.max(0, currentMatchIndex + 1)} / {findMatches.length}
              </span>
            )}
          </div>
          <button
            onClick={replaceOne}
            disabled={!findText}
            className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Replace
          </button>
          <button
            onClick={replaceInText}
            disabled={!findText}
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Replace All
          </button>
          <button
            onClick={() => setShowFindReplace(false)}
            className="px-3 py-1.5 hover:bg-gray-200 text-[#111827] rounded transition-colors text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Editor area with page view - tan background with white pages */}
      <div
        className="writer-stage"
        style={{
          position: "relative",
          minHeight: 0,
          flex: 1,
          backgroundColor: "#eddcc5",
          marginTop:
            viewMode === "writer" && !showFindReplace ? "-12px" : "0px",
          overflow: "hidden",
        }}
      >
        {/* Page Rail - absolutely positioned to not affect centering */}
        {showThumbnailRail && !focusMode && (
          <aside
            ref={pageRailRef}
            className="page-thumbnail-rail hide-scrollbar"
            style={{
              position: "absolute",
              left: "8px",
              top: "28px",
              bottom: "8px",
              width: "220px",
              zIndex: 10,
              borderRadius: "18px",
              border: "1px solid #e0c392",
              background:
                "linear-gradient(180deg, rgba(254,245,231,0.98), rgba(247,230,208,0.92))",
              boxShadow: "0 16px 32px rgba(44, 62, 80, 0.12)",
              padding: "16px 12px",
              paddingBottom: "16px",
              overflowY: "auto",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#92400e]">
                Page Rail
              </div>
              <span className="text-[11px] text-[#6b7280]">
                {pageCount} {pageCount === 1 ? "Page" : "Pages"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: pageCount }, (_, index) => {
                const snippet = pageSnippets[index] || "";
                const isActive = index === activePage;
                return (
                  <button
                    key={`thumbnail-${index}`}
                    type="button"
                    onClick={() =>
                      jumpToPage(index, { suppressSelectionSync: true })
                    }
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      previewTimeoutRef.current = setTimeout(() => {
                        const dims = computePreviewDimensions(
                          typeof window !== "undefined"
                            ? window.innerHeight
                            : undefined
                        );
                        setPreviewDimensions(dims);
                        setPreviewPageIndex(index);
                        const previewHeight = dims.previewHeight;
                        const previewWidth = dims.previewWidth;
                        let top = PREVIEW_SAFE_MARGIN_PX;
                        let left = rect.right + 20;

                        if (
                          typeof window !== "undefined" &&
                          top + previewHeight >
                            window.innerHeight - PREVIEW_SAFE_MARGIN_PX
                        ) {
                          top = Math.max(
                            PREVIEW_SAFE_MARGIN_PX,
                            window.innerHeight -
                              previewHeight -
                              PREVIEW_SAFE_MARGIN_PX
                          );
                        }

                        if (
                          typeof window !== "undefined" &&
                          left + previewWidth > window.innerWidth - 20
                        ) {
                          left = rect.left - previewWidth - 20;
                        }
                        setPreviewPosition({ top, left });
                      }, 600); // 600ms delay before showing preview
                    }}
                    onMouseLeave={() => {
                      if (previewTimeoutRef.current) {
                        clearTimeout(previewTimeoutRef.current);
                        previewTimeoutRef.current = null;
                      }
                      setPreviewPageIndex(null);
                    }}
                    className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                    style={{
                      border: isActive
                        ? "2px solid #ef8432"
                        : "1px solid #f5d1ab",
                      borderRadius: "16px",
                      padding: "10px",
                      backgroundColor: isActive ? "#fff" : "#fefdf9",
                      boxShadow: isActive
                        ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                        : "0 6px 14px rgba(44, 62, 80, 0.08)",
                      transition: "border 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#2c3e50]">
                        Page {index + 1}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-[#ef8432] font-semibold">
                          Live
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        border: "1px solid rgba(224,195,146,0.9)",
                        aspectRatio: "8.5 / 11",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "6px",
                          fontSize: "9px",
                          lineHeight: 1.3,
                          color: "#374151",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {snippet
                          ? snippet.substring(0, 200) +
                            (snippet.length > 200 ? "..." : "")
                          : "Start writing to fill this page."}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Page Preview Popup - Shows actual page content scaled down */}
        {previewPageIndex !== null && pagesContainerRef.current && (
          <div
            style={{
              position: "fixed",
              top: previewPosition.top,
              left: previewPosition.left,
              width: `${previewDimensions.previewWidth}px`,
              height: `${previewDimensions.previewHeight}px`,
              maxHeight: `${previewDimensions.previewHeight}px`,
              backgroundColor: "#f5f0e8",
              borderRadius: "16px",
              border: "2px solid #ef8432",
              boxShadow:
                "0 24px 48px rgba(44, 62, 80, 0.3), 0 8px 16px rgba(239, 132, 50, 0.15)",
              zIndex: 1000,
              overflow: "auto",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {/* Preview Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #fef5e7, #fff7ed)",
                padding: `${Math.max(
                  8,
                  Math.round(10 * previewScale)
                )}px ${Math.max(12, Math.round(16 * previewScale))}px`,
                minHeight: `${Math.max(
                  32,
                  Math.round(PREVIEW_HEADER_HEIGHT_PX * previewScale)
                )}px`,
                borderBottom: "1px solid #e0c392",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 600, color: "#92400e" }}
              >
                Page {previewPageIndex + 1} of {pageCount}
              </span>
              <span
                style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}
              >
                Full Page Preview
              </span>
            </div>

            {/* Full Page Preview - Scaled clone of actual page */}
            <div
              style={{
                padding: `${Math.max(
                  8,
                  Math.round((PREVIEW_PADDING_HEIGHT_PX / 2) * previewScale)
                )}px`,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                backgroundColor: "#e8e0d0",
              }}
            >
              <div
                style={{
                  width: `${previewDimensions.pageWidth}px`,
                  height: `${Math.round(
                    previewDimensions.pageWidth *
                      (PAGE_HEIGHT_PX / PAGE_WIDTH_PX)
                  )}px`,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "4px",
                  boxShadow:
                    "0 4px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)",
                  backgroundColor: "#ffffff",
                  flexShrink: 0,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.round(
                      (HEADER_RESERVED_PX * previewDimensions.pageWidth) /
                        PAGE_WIDTH_PX
                    )}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      headerAlign === "center"
                        ? "center"
                        : headerAlign === "right"
                        ? "flex-end"
                        : "flex-start",
                    padding: `0 ${Math.max(
                      20,
                      Math.round(46 * previewScale)
                    )}px`,
                    fontSize: "8px",
                    color: "#78716c",
                    borderBottom: "1px solid #e8e0d0",
                    backgroundColor: "#fafaf8",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{ whiteSpace: "pre-wrap", textAlign: headerAlign }}
                  >
                    {headerText || "Header"}
                    {showPageNumbers &&
                      pageNumberPosition === "header" &&
                      previewPageIndex > 0 && (
                        <span style={{ marginLeft: headerText ? "8px" : 0 }}>
                          {previewPageIndex + 1}
                        </span>
                      )}
                  </div>
                </div>

                {/* Page content area - extracts full content for this page */}
                <div
                  style={{
                    position: "absolute",
                    top: `${Math.round(
                      (HEADER_RESERVED_PX * previewDimensions.pageWidth) /
                        PAGE_WIDTH_PX
                    )}px`,
                    left: 0,
                    right: 0,
                    bottom: `${Math.round(
                      (FOOTER_RESERVED_PX * previewDimensions.pageWidth) /
                        PAGE_WIDTH_PX
                    )}px`,
                    overflow: "hidden",
                    padding: `8px ${Math.round(
                      (leftMargin * previewDimensions.pageWidth) / PAGE_WIDTH_PX
                    )}px`,
                    fontSize: "7px",
                    lineHeight: 1.4,
                    color: "#374151",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {(() => {
                    const editor = editorRef.current;
                    if (!editor) return "No content";

                    const wrapperRect =
                      wrapperRef.current?.getBoundingClientRect();
                    const scrollOffset = wrapperRef.current?.scrollTop ?? 0;
                    const blocks = Array.from(
                      editor.querySelectorAll<HTMLElement>(
                        "p, div, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, pre"
                      )
                    ).filter(
                      (block) =>
                        block.innerText && block.innerText.trim().length
                    );

                    let pageContent = "";

                    blocks.forEach((block) => {
                      const text = block.innerText || "";
                      if (!text.trim()) return;

                      const rect = block.getBoundingClientRect();
                      const relativeMid =
                        rect.top -
                        (wrapperRect?.top ?? 0) +
                        scrollOffset +
                        rect.height / 2;

                      const bucketIndex = Math.min(
                        Math.max(Math.floor(relativeMid / PAGE_HEIGHT_PX), 0),
                        pageCount - 1
                      );

                      if (bucketIndex === previewPageIndex) {
                        pageContent += `${text}\n\n`;
                      }
                    });

                    return pageContent.trim() || "No content on this page.";
                  })()}
                </div>

                {/* Footer */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.round(
                      (FOOTER_RESERVED_PX * previewDimensions.pageWidth) /
                        PAGE_WIDTH_PX
                    )}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      footerAlign === "center"
                        ? "center"
                        : footerAlign === "right"
                        ? "flex-end"
                        : "flex-start",
                    padding: `0 ${Math.max(
                      20,
                      Math.round(46 * previewScale)
                    )}px`,
                    fontSize: "8px",
                    color: "#78716c",
                    borderTop: "1px solid #e8e0d0",
                    backgroundColor: "#fafaf8",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{ whiteSpace: "pre-wrap", textAlign: footerAlign }}
                  >
                    {footerText || `Page ${previewPageIndex + 1}`}
                    {showPageNumbers &&
                      pageNumberPosition === "footer" &&
                      previewPageIndex > 0 &&
                      !footerText && <span>{previewPageIndex + 1}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Click to navigate hint */}
            <div
              style={{
                background: "linear-gradient(135deg, #fef5e7, #fff7ed)",
                padding: `${Math.max(
                  6,
                  Math.round(8 * previewScale)
                )}px ${Math.max(12, Math.round(16 * previewScale))}px`,
                minHeight: `${Math.max(
                  24,
                  Math.round(PREVIEW_HINT_HEIGHT_PX * previewScale)
                )}px`,
                borderTop: "1px solid #e0c392",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "#78716c" }}>
                Click thumbnail to jump to this page
              </span>
            </div>
          </div>
        )}

        {/* Advanced Tools Rail - Right Side */}
        {showThumbnailRail && !focusMode && (
          <aside
            className="advanced-tools-rail hide-scrollbar"
            style={{
              position: "absolute",
              right: "8px",
              top: "28px",
              bottom: "8px",
              width: "220px",
              zIndex: 10,
              borderRadius: "18px",
              border: "1px solid #e0c392",
              background:
                "linear-gradient(180deg, rgba(254,245,231,0.98), rgba(247,230,208,0.92))",
              boxShadow: "0 16px 32px rgba(44, 62, 80, 0.12)",
              padding: "16px 12px",
              paddingBottom: "16px",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#92400e]">
                Advanced Tools
              </div>
              <span className="text-[11px] text-[#6b7280]">17 Tools</span>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-[#92400e] mb-2 mt-1">
              Analysis Tools
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTool("ai-assistant")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "ai-assistant"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "ai-assistant" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "ai-assistant"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== "ai-assistant") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(44, 62, 80, 0.15)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== "ai-assistant") {
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(44, 62, 80, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    AI Assistant
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Get suggestions and completions
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("dialogue")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "dialogue"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "dialogue" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "dialogue"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== "dialogue") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(44, 62, 80, 0.15)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== "dialogue") {
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(44, 62, 80, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💬</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Dialogue
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Analyze dialogue flow
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("readability")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "readability"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "readability" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "readability"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== "readability") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(44, 62, 80, 0.15)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== "readability") {
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(44, 62, 80, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📊</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Readability
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Check reading level
                </div>
              </button>
              {/* Cliché Detector */}
              <button
                type="button"
                onClick={() => setActiveTool("cliche")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "cliche"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "cliche" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "cliche"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🚫</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Cliché Detector
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Find overused phrases
                </div>
              </button>
              {/* Beat Sheet */}
              <button
                type="button"
                onClick={() => setActiveTool("beats")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "beats"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "beats" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "beats"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📖</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Beat Sheet
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Story structure analysis
                </div>
              </button>
              {/* POV Checker */}
              <button
                type="button"
                onClick={() => setActiveTool("pov")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "pov"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "pov" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "pov"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">👁️</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    POV Checker
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Detect perspective shifts
                </div>
              </button>
              {/* Emotion Tracker */}
              <button
                type="button"
                onClick={() => setActiveTool("emotion")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "emotion"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "emotion" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "emotion"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💖</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Emotion Tracker
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Map emotional arcs
                </div>
              </button>
              {/* Motif Tracker */}
              <button
                type="button"
                onClick={() => setActiveTool("motif")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "motif"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "motif" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "motif"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🔮</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Motif Tracker
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Find recurring themes
                </div>
              </button>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-[#92400e] mb-2 mt-3">
              Genre Tools
            </div>
            <div className="flex flex-col gap-2">
              {/* Poetry Meter */}
              <button
                type="button"
                onClick={() => setActiveTool("poetry-meter")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "poetry-meter"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "poetry-meter" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "poetry-meter"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📖</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Poetry Meter
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Scan rhythm and rhyme schemes
                </div>
              </button>
              {/* Non-Fiction Outline */}
              <button
                type="button"
                onClick={() => setActiveTool("nonfiction-outline")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "nonfiction-outline"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "nonfiction-outline" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "nonfiction-outline"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📝</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Non-Fiction Outline
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Structure arguments and evidence
                </div>
              </button>
              {/* Citation Manager */}
              <button
                type="button"
                onClick={() => setActiveTool("citation-manager")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "citation-manager"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "citation-manager" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "citation-manager"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📚</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Citation Manager
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Format references (APA/MLA/Chicago)
                </div>
              </button>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-[#92400e] mb-2 mt-3">
              Content Tools
            </div>
            <div className="flex flex-col gap-2">
              {/* Name Generator */}
              <button
                type="button"
                onClick={() => setActiveTool("name-generator")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "name-generator"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "name-generator" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "name-generator"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">👤</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Name Generator
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Generate names by genre & culture
                </div>
              </button>
              {/* World-Building */}
              <button
                type="button"
                onClick={() => setActiveTool("world-building")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "world-building"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "world-building" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "world-building"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🗺️</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    World-Building
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Integrated wiki for characters & places
                </div>
              </button>
              {/* Writer's Notes */}
              <button
                type="button"
                onClick={() => setActiveTool("research-notes")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "research-notes"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "research-notes" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "research-notes"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📝</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Writer's Notes
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Quick notes without leaving editor
                </div>
              </button>
              {/* Mood Board */}
              <button
                type="button"
                onClick={() => setActiveTool("mood-board")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "mood-board"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "mood-board" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "mood-board"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🖼️</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Mood Board
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Upload reference images for scenes
                </div>
              </button>
              {/* Version History */}
              <button
                type="button"
                onClick={() => setActiveTool("version-history")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "version-history"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "version-history" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "version-history"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📜</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Version History
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Save snapshots, compare drafts
                </div>
              </button>
              {/* Comments */}
              <button
                type="button"
                onClick={() => setActiveTool("comments")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "comments"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "comments" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "comments"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💬</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Comments
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Leave notes for yourself or beta readers
                </div>
              </button>
            </div>
          </aside>
        )}

        <PaginatedEditor
          ref={paginatedEditorRef}
          initialContent={editorRef.current?.innerHTML || ""}
          onChange={(newContent) => {
            // Sync back to editorRef for formatting commands
            if (editorRef.current) {
              editorRef.current.innerHTML = newContent.html;
            }
            onUpdate?.({ html: newContent.html, text: newContent.text });
            // Update history - but skip during undo/redo operations
            if (!isUndoRedoRef.current) {
              if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
              }
              saveTimeoutRef.current = setTimeout(() => {
                saveToHistory(newContent.html);
              }, 500);
            }
            // Update analysis
            if (analysisTimeoutRef.current) {
              clearTimeout(analysisTimeoutRef.current);
            }
            analysisTimeoutRef.current = setTimeout(() => {
              analyzeContent(newContent.text);
            }, 300);
          }}
          onPageCountChange={handlePageCountChange}
          isEditable={isEditable}
          pageWidthPx={PAGE_WIDTH_PX}
          pageHeightPx={PAGE_HEIGHT_PX}
          marginTop={HEADER_RESERVED_PX}
          marginBottom={FOOTER_RESERVED_PX}
          marginLeft={effectiveLeftMargin}
          marginRight={effectiveRightMargin}
          firstLineIndent={effectiveFirstLineIndent}
          headerText={headerText}
          footerText={footerText}
          showPageNumbers={showPageNumbers}
          pageNumberPosition={pageNumberPosition}
          showRuler={showRuler}
          onLeftMarginChange={handleLeftMarginChange}
          onRightMarginChange={handleRightMarginChange}
          onFirstLineIndentChange={handleFirstLineIndentChange}
          documentStyles={documentStyles}
          showStyleLabels={showStyleLabels}
          activePage={activePage}
          onActivePageChange={setActivePage}
          onPageSnippetsChange={setPageSnippets}
          onScroll={(scrollTop) => setShowBackToTop(scrollTop > 300)}
          onExternalKeyDown={handleKeyDown}
          onPageBreakRemove={() => {
            handleInput();
          }}
        />
      </div>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#eddcc5", // Match writer-stage tan background
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div className="editor-spinner"></div>
          <p style={{ marginTop: "1rem", color: "#2c3e50", fontWeight: 500 }}>
            Loading document...
          </p>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="back-to-top-button"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 20px",
            borderRadius: "999px",
            border: "2px solid #e0c392",
            background: "linear-gradient(135deg, #f5ead9 0%, #f5e6d3 100%)",
            color: "#2c3e50",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 4px 16px rgba(44, 62, 80, 0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 1200,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateX(-50%) translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(44, 62, 80, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(-50%)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(44, 62, 80, 0.15)";
          }}
          title="Back to top"
          aria-label="Scroll to top"
        >
          <span style={{ fontSize: "16px" }}>↑</span>
          Back to top
        </button>
      )}

      {/* Backdrop for closing tools - click outside to close */}
      {viewMode === "writer" && !isFreeMode && activeTool && (
        <div
          onClick={() => setActiveTool(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
          }}
        />
      )}

      {/* Advanced Tool Components */}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "ai-assistant" && (
          <AIWritingAssistant
            selectedText={window.getSelection()?.toString() || ""}
            onInsertText={(text) => {
              // Try to insert at current selection in paginated editor
              const selection = window.getSelection();
              const scrollContainer = scrollShellRef.current;

              if (
                selection &&
                selection.rangeCount > 0 &&
                !selection.isCollapsed
              ) {
                const range = selection.getRangeAt(0);
                // Check if selection is in paginated editor
                if (scrollContainer?.contains(range.commonAncestorContainer)) {
                  range.deleteContents();
                  range.insertNode(document.createTextNode(text));
                  selection.collapseToEnd();
                  // Sync back to editorRef
                  if (paginatedEditorRef.current && editorRef.current) {
                    editorRef.current.innerHTML =
                      paginatedEditorRef.current.getContent();
                  }
                  handleInput();
                  return;
                }
                // Fallback to editorRef
                if (
                  editorRef.current?.contains(range.commonAncestorContainer)
                ) {
                  range.deleteContents();
                  range.insertNode(document.createTextNode(text));
                  selection.collapseToEnd();
                  handleInput();
                  return;
                }
              }

              // If no selection, append to the end via paginated editor
              if (paginatedEditorRef.current) {
                paginatedEditorRef.current.focus();
                paginatedEditorRef.current.execCommand(
                  "insertHTML",
                  "<br>" + text
                );
                if (editorRef.current) {
                  editorRef.current.innerHTML =
                    paginatedEditorRef.current.getContent();
                }
                handleInput();
              } else if (editorRef.current) {
                editorRef.current.appendChild(document.createElement("br"));
                editorRef.current.appendChild(document.createTextNode(text));
                handleInput();
              }
            }}
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("aiAssistant")}
          />
        )}
      {viewMode === "writer" && !isFreeMode && activeTool === "dialogue" && (
        <DialogueEnhancer
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("dialogue")}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "readability" && (
        <ReadabilityAnalyzer
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("readability")}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "cliche" && (
        <ClicheDetector
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("cliche")}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "beats" && (
        <BeatSheetGenerator
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("beatSheet")}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "pov" && (
        <POVChecker
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("povChecker")}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "emotion" && (
        <EmotionTracker
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("emotion")}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "motif" && (
        <MotifTracker
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("motif")}
        />
      )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "poetry-meter" && (
          <PoetryMeterAnalyzer
            text={editorRef.current?.innerText || ""}
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("poetryMeter")}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "nonfiction-outline" && (
          <NonFictionOutlineGenerator
            text={editorRef.current?.innerText || ""}
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("nonfictionOutline")}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "citation-manager" && (
          <AcademicCitationManager
            text={editorRef.current?.innerText || ""}
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("citationManager")}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "name-generator" && (
          <CharacterNameGenerator
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("nameGenerator")}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "world-building" && (
          <WorldBuildingNotebook
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("worldBuilding")}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "research-notes" && (
          <ResearchNotesPanel
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("researchNotes")}
          />
        )}
      {viewMode === "writer" && !isFreeMode && activeTool === "mood-board" && (
        <ImageMoodBoard
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("moodBoard")}
        />
      )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "version-history" && (
          <VersionHistory
            currentContent={editorRef.current?.innerText || ""}
            onRestore={(text) => {
              if (editorRef.current) {
                editorRef.current.innerText = text;
                handleInput();
              }
            }}
            onClose={() => setActiveTool(null)}
            onOpenHelp={() => onOpenHelp?.("versionHistory")}
          />
        )}
      {viewMode === "writer" && !isFreeMode && activeTool === "comments" && (
        <CommentAnnotation
          documentContent={editorRef.current?.innerText || ""}
          selectedText={window.getSelection()?.toString() || ""}
          onClose={() => setActiveTool(null)}
          onOpenHelp={() => onOpenHelp?.("comments")}
        />
      )}

      {/* Image Float Toolbar */}
      {selectedImage && (
        <div
          className="image-float-toolbar"
          style={{
            position: "fixed",
            top: `${imageToolbarPosition.top}px`,
            left: `${imageToolbarPosition.left}px`,
            transform: "translateX(-50%)",
            zIndex: 10000,
            backgroundColor: "#fffaf3",
            border: "1.5px solid #e0c392",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            padding: "6px 8px",
            display: "flex",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              if (selectedImage) {
                // For float to work, image must be at the START of content that wraps
                const parent = selectedImage.parentElement;

                if (
                  parent &&
                  parent.tagName === "P" &&
                  parent.childNodes.length === 1
                ) {
                  // Image is alone in a <p> - need to merge with next paragraph
                  const nextSibling = parent.nextElementSibling;
                  if (
                    nextSibling &&
                    (nextSibling.tagName === "P" ||
                      nextSibling.tagName === "DIV")
                  ) {
                    // Insert image at the start of the next paragraph
                    nextSibling.insertBefore(
                      selectedImage,
                      nextSibling.firstChild
                    );
                    parent.remove();
                  } else {
                    // No next paragraph - just unwrap and float
                    const grandparent = parent.parentElement;
                    if (grandparent) {
                      grandparent.insertBefore(selectedImage, parent);
                      parent.remove();
                    }
                  }
                }

                selectedImage.style.float = "left";
                selectedImage.style.margin = "0 20px 10px 0";
                selectedImage.style.maxWidth = "50%";
                selectedImage.style.display = "";
                handleInput();
                setSelectedImage(null);
              }
            }}
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              backgroundColor:
                selectedImage?.style.float === "left" ? "#f7e6d0" : "#fef5e7",
              border: "1px solid #e0c392",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Float Left (text wraps on right)"
          >
            ⬅️ Left
          </button>
          <button
            onClick={() => {
              if (selectedImage) {
                // For center, wrap image in its own <p> with text-align center
                selectedImage.style.float = "none";
                selectedImage.style.margin = "1rem auto";
                selectedImage.style.display = "block";
                selectedImage.style.maxWidth = "100%";
                const parent = selectedImage.parentElement;

                // If image is inside a paragraph with other content, extract it
                if (parent && parent.childNodes.length > 1) {
                  const p = document.createElement("p");
                  p.style.textAlign = "center";
                  parent.parentElement?.insertBefore(p, parent);
                  p.appendChild(selectedImage);
                } else if (parent && parent.tagName === "P") {
                  parent.style.textAlign = "center";
                } else if (parent) {
                  // Wrap in a centered paragraph
                  const p = document.createElement("p");
                  p.style.textAlign = "center";
                  parent.insertBefore(p, selectedImage);
                  p.appendChild(selectedImage);
                }
                handleInput();
                setSelectedImage(null);
              }
            }}
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              backgroundColor:
                selectedImage?.style.float === "none" ||
                !selectedImage?.style.float
                  ? "#f7e6d0"
                  : "#fef5e7",
              border: "1px solid #e0c392",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Center (no text wrap)"
          >
            ↔️ Center
          </button>
          <button
            onClick={() => {
              if (selectedImage) {
                // For float to work, image must be at the START of content that wraps
                const parent = selectedImage.parentElement;

                if (
                  parent &&
                  parent.tagName === "P" &&
                  parent.childNodes.length === 1
                ) {
                  // Image is alone in a <p> - need to merge with next paragraph
                  const nextSibling = parent.nextElementSibling;
                  if (
                    nextSibling &&
                    (nextSibling.tagName === "P" ||
                      nextSibling.tagName === "DIV")
                  ) {
                    // Insert image at the start of the next paragraph
                    nextSibling.insertBefore(
                      selectedImage,
                      nextSibling.firstChild
                    );
                    parent.remove();
                  } else {
                    // No next paragraph - just unwrap and float
                    const grandparent = parent.parentElement;
                    if (grandparent) {
                      grandparent.insertBefore(selectedImage, parent);
                      parent.remove();
                    }
                  }
                }

                selectedImage.style.float = "right";
                selectedImage.style.margin = "0 0 10px 20px";
                selectedImage.style.maxWidth = "50%";
                selectedImage.style.display = "";
                handleInput();
                setSelectedImage(null);
              }
            }}
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              backgroundColor:
                selectedImage?.style.float === "right" ? "#f7e6d0" : "#fef5e7",
              border: "1px solid #e0c392",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Float Right (text wraps on left)"
          >
            Right ➡️
          </button>
          <div
            style={{
              width: "1px",
              height: "20px",
              backgroundColor: "#e0c392",
              margin: "0 4px",
            }}
          />
          <button
            onClick={() => {
              if (selectedImage) {
                selectedImage.style.maxWidth = "30%";
                handleInput();
              }
            }}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              backgroundColor: "#fef5e7",
              border: "1px solid #e0c392",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            title="Small size (30%)"
          >
            S
          </button>
          <button
            onClick={() => {
              if (selectedImage) {
                selectedImage.style.maxWidth = "50%";
                handleInput();
              }
            }}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              backgroundColor: "#fef5e7",
              border: "1px solid #e0c392",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            title="Medium size (50%)"
          >
            M
          </button>
          <button
            onClick={() => {
              if (selectedImage) {
                selectedImage.style.maxWidth = "100%";
                handleInput();
              }
            }}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              backgroundColor: "#fef5e7",
              border: "1px solid #e0c392",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            title="Large size (100%)"
          >
            L
          </button>
          <div
            style={{
              width: "1px",
              height: "20px",
              backgroundColor: "#e0c392",
              margin: "0 4px",
            }}
          />
          <button
            onClick={() => {
              if (selectedImage) {
                const parent = selectedImage.parentElement;
                if (parent && parent.tagName === "P") {
                  parent.remove();
                } else {
                  selectedImage.remove();
                }
                handleInput();
                setSelectedImage(null);
              }
            }}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#dc2626",
            }}
            title="Delete image"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Image Resize Handles */}
      {selectedImage &&
        (() => {
          const rect = selectedImage.getBoundingClientRect();
          const handleStyle = {
            position: "fixed" as const,
            width: "10px",
            height: "10px",
            backgroundColor: "#8b6914",
            border: "1px solid #fff",
            borderRadius: "2px",
            zIndex: 10001,
          };

          const startResize = (handle: string) => (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            setResizeHandle(handle);
            setResizeStart({
              x: e.clientX,
              y: e.clientY,
              width: selectedImage.offsetWidth,
              height: selectedImage.offsetHeight,
            });
          };

          return (
            <>
              {/* Top-left */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.top - 5}px`,
                  left: `${rect.left - 5}px`,
                  cursor: "nw-resize",
                }}
                onMouseDown={startResize("nw")}
              />
              {/* Top-center */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.top - 5}px`,
                  left: `${rect.left + rect.width / 2 - 5}px`,
                  cursor: "n-resize",
                }}
                onMouseDown={startResize("n")}
              />
              {/* Top-right */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.top - 5}px`,
                  left: `${rect.right - 5}px`,
                  cursor: "ne-resize",
                }}
                onMouseDown={startResize("ne")}
              />
              {/* Middle-left */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.top + rect.height / 2 - 5}px`,
                  left: `${rect.left - 5}px`,
                  cursor: "w-resize",
                }}
                onMouseDown={startResize("w")}
              />
              {/* Middle-right */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.top + rect.height / 2 - 5}px`,
                  left: `${rect.right - 5}px`,
                  cursor: "e-resize",
                }}
                onMouseDown={startResize("e")}
              />
              {/* Bottom-left */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.bottom - 5}px`,
                  left: `${rect.left - 5}px`,
                  cursor: "sw-resize",
                }}
                onMouseDown={startResize("sw")}
              />
              {/* Bottom-center */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.bottom - 5}px`,
                  left: `${rect.left + rect.width / 2 - 5}px`,
                  cursor: "s-resize",
                }}
                onMouseDown={startResize("s")}
              />
              {/* Bottom-right */}
              <div
                className="image-resize-handle"
                style={{
                  ...handleStyle,
                  top: `${rect.bottom - 5}px`,
                  left: `${rect.right - 5}px`,
                  cursor: "se-resize",
                }}
                onMouseDown={startResize("se")}
              />
            </>
          );
        })()}
    </div>
  );
};
