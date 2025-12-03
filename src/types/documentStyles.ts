export type TextAlignOption = "left" | "center" | "right" | "justify";
export type FontWeightOption = "normal" | "bold";
export type FontStyleOption = "normal" | "italic";

export interface ParagraphStyle {
  fontSize: number;
  firstLineIndent: number;
  lineHeight: number;
  marginBottom: number;
  marginTop: number;
  textAlign: TextAlignOption;
  fontWeight: FontWeightOption;
  fontStyle: FontStyleOption;
}

export interface TitleStyle {
  fontSize: number;
  fontWeight: FontWeightOption;
  fontStyle: FontStyleOption;
  textAlign: TextAlignOption;
  marginTop: number;
  marginBottom: number;
  firstLineIndent: number;
}

export interface HeadingStyle {
  fontSize: number;
  fontWeight: FontWeightOption;
  fontStyle: FontStyleOption;
  textAlign: TextAlignOption;
  marginTop: number;
  marginBottom: number;
  firstLineIndent: number;
}

export interface BlockquoteStyle {
  fontSize: number;
  fontStyle: FontStyleOption;
  fontWeight: FontWeightOption;
  textAlign: TextAlignOption;
  marginLeft: number;
  marginTop: number;
  marginBottom: number;
  firstLineIndent: number;
  borderLeftWidth: number;
  borderLeftColor: string;
}

export interface SimpleCenteredStyle {
  fontSize: number;
  fontStyle: FontStyleOption;
  fontWeight: FontWeightOption;
  textAlign: TextAlignOption;
  marginTop: number;
  marginBottom: number;
  firstLineIndent: number;
  marginLeft?: number;
}

export interface DocumentStylesState {
  paragraph: ParagraphStyle;
  "book-title": TitleStyle;
  title: TitleStyle;
  subtitle: TitleStyle;
  "chapter-heading": TitleStyle;
  "part-title": TitleStyle;
  heading1: HeadingStyle;
  heading2: HeadingStyle;
  heading3: HeadingStyle;
  blockquote: BlockquoteStyle;
  epigraph: SimpleCenteredStyle;
  dedication: SimpleCenteredStyle;
  verse: SimpleCenteredStyle;
}
