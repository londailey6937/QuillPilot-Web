export type TextAlignOption = "left" | "center" | "right" | "justify";
export type FontWeightOption = "normal" | "bold";
export type FontStyleOption = "normal" | "italic";

export interface BlockStyle {
  fontSize: number;
  fontFamily?: string;
  fontWeight: FontWeightOption;
  fontStyle: FontStyleOption;
  textAlign: TextAlignOption;
  marginTop: number;
  marginBottom: number;
  firstLineIndent: number;
  lineHeight?: number;
  marginLeft?: number;
  marginRight?: number;
  borderLeftWidth?: number;
  borderLeftColor?: string;
  color?: string;
  backgroundColor?: string;
}

export interface StyleTemplate {
  name: string;
  id: string;
  createdAt: string;
  styles: Partial<DocumentStylesState>;
}

export type ParagraphStyle = BlockStyle & { lineHeight: number };

export interface DocumentStylesState {
  paragraph: ParagraphStyle;
  "book-title": BlockStyle;
  title: BlockStyle;
  subtitle: BlockStyle;
  "chapter-heading": BlockStyle;
  "part-title": BlockStyle;
  heading1: BlockStyle;
  heading2: BlockStyle;
  heading3: BlockStyle;
  blockquote: BlockStyle;
  epigraph: BlockStyle;
  dedication: BlockStyle;
  verse: BlockStyle;
  "scene-heading": BlockStyle;
  action: BlockStyle;
  character: BlockStyle;
  dialogue: BlockStyle;
  parenthetical: BlockStyle;
  transition: BlockStyle;
  abstract: BlockStyle;
  keywords: BlockStyle;
  bibliography: BlockStyle;
  references: BlockStyle;
  appendix: BlockStyle;
  footnote: BlockStyle;
  citation: BlockStyle;
  "author-info": BlockStyle;
  "date-info": BlockStyle;
  address: BlockStyle;
  salutation: BlockStyle;
  closing: BlockStyle;
  signature: BlockStyle;
  sidebar: BlockStyle;
  callout: BlockStyle;
  acknowledgments: BlockStyle;
  copyright: BlockStyle;
  "lead-paragraph": BlockStyle;
  pullquote: BlockStyle;
  caption: BlockStyle;
  "figure-caption": BlockStyle;
  "table-title": BlockStyle;
  equation: BlockStyle;
  byline: BlockStyle;
  dateline: BlockStyle;
  "press-lead": BlockStyle;
  "nut-graf": BlockStyle;
  "fact-box": BlockStyle;
  "hero-headline": BlockStyle;
  "marketing-subhead": BlockStyle;
  "feature-callout": BlockStyle;
  testimonial: BlockStyle;
  "cta-block": BlockStyle;
  "api-heading": BlockStyle;
  "code-reference": BlockStyle;
  "warning-note": BlockStyle;
  "success-note": BlockStyle;
  "memo-heading": BlockStyle;
  "subject-line": BlockStyle;
  "executive-summary": BlockStyle;
  "front-matter": BlockStyle;
  "scene-break": BlockStyle;
  afterword: BlockStyle;
  shot: BlockStyle;
  lyric: BlockStyle;
  beat: BlockStyle;
}
