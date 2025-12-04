/**
 * Shared DOCX Style Definitions
 *
 * This file defines the canonical styles used throughout QuillPilot.
 * Both import (mammoth) and export (html-to-docx) reference these definitions
 * to ensure round-trip fidelity.
 */

// Style names that map between Word, HTML classes, and our internal representation
export const STYLE_NAMES = {
  // Document structure
  TITLE: "Title",
  SUBTITLE: "Subtitle",
  HEADING_1: "Heading 1",
  HEADING_2: "Heading 2",
  HEADING_3: "Heading 3",
  HEADING_4: "Heading 4",

  // Body text
  BODY_TEXT: "Body Text",
  BODY_TEXT_FIRST: "Body Text First Indent",
  NO_SPACING: "No Spacing",

  // Special
  QUOTE: "Quote",
  BLOCK_QUOTE: "Block Quote",
  EPIGRAPH: "Epigraph",

  // Lists
  LIST_PARAGRAPH: "List Paragraph",
  LIST_BULLET: "List Bullet",
  LIST_NUMBER: "List Number",

  // Character styles
  EMPHASIS: "Emphasis",
  STRONG: "Strong",
  BOOK_TITLE: "Book Title",
} as const;

// CSS class names that correspond to Word styles
export const CSS_CLASSES = {
  [STYLE_NAMES.TITLE]: "doc-title",
  [STYLE_NAMES.SUBTITLE]: "doc-subtitle",
  [STYLE_NAMES.HEADING_1]: "chapter-heading",
  [STYLE_NAMES.HEADING_2]: "section-heading",
  [STYLE_NAMES.HEADING_3]: "subsection-heading",
  [STYLE_NAMES.BODY_TEXT]: "body-text",
  [STYLE_NAMES.BODY_TEXT_FIRST]: "first-paragraph",
  [STYLE_NAMES.NO_SPACING]: "no-spacing",
  [STYLE_NAMES.QUOTE]: "quote",
  [STYLE_NAMES.BLOCK_QUOTE]: "block-quote",
  [STYLE_NAMES.EPIGRAPH]: "epigraph",
  [STYLE_NAMES.LIST_PARAGRAPH]: "list-paragraph",
} as const;

/**
 * Mammoth style map for DOCX import
 * Maps Word style names to HTML elements/classes
 */
export const MAMMOTH_STYLE_MAP = [
  // Paragraph styles - Title and headings
  "p[style-name='Title'] => h1.doc-title:fresh",
  "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
  "p[style-name='Heading 1'] => h1.chapter-heading:fresh",
  "p[style-name='Heading 2'] => h2.section-heading:fresh",
  "p[style-name='Heading 3'] => h3.subsection-heading:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
  "p[style-name='Heading 5'] => h5:fresh",
  "p[style-name='Heading 6'] => h6:fresh",

  // Body text styles
  "p[style-name='Body Text'] => p.body-text:fresh",
  "p[style-name='Body Text First Indent'] => p.first-paragraph:fresh",
  "p[style-name='First Paragraph'] => p.first-paragraph:fresh",
  "p[style-name='No Spacing'] => p.no-spacing:fresh",
  "p[style-name='Normal'] => p:fresh",

  // Quote styles
  "p[style-name='Quote'] => blockquote.quote:fresh",
  "p[style-name='Block Quote'] => blockquote.block-quote:fresh",
  "p[style-name='Block Text'] => blockquote.block-quote:fresh",
  "p[style-name='Epigraph'] => blockquote.epigraph:fresh",
  "p[style-name='Intense Quote'] => blockquote.intense-quote:fresh",

  // List styles
  "p[style-name='List Paragraph'] => p.list-paragraph:fresh",
  "p[style-name='List Bullet'] => li.list-bullet:fresh",
  "p[style-name='List Number'] => li.list-number:fresh",

  // Character styles
  "r[style-name='Strong'] => strong",
  "r[style-name='Emphasis'] => em",
  "r[style-name='Intense Emphasis'] => strong > em",
  "r[style-name='Book Title'] => em.book-title",
  "r[style-name='Subtle Emphasis'] => span.subtle-emphasis",
  "r[style-name='Subtle Reference'] => span.subtle-reference",

  // Preserve underlines
  "u => u",
].join("\n");

/**
 * HTML-to-DOCX style options
 * Defines how HTML elements/classes map to Word styles in exported documents
 */
export const HTML_TO_DOCX_STYLES = {
  // Font settings
  font: "Times New Roman",
  fontSize: 24, // 12pt in half-points

  // Page margins (in EMUs - English Metric Units)
  margins: {
    top: 1440, // 1 inch = 1440 twips
    right: 1440,
    bottom: 1440,
    left: 1440,
  },

  // Style definitions for html-to-docx
  styleDefinitions: {
    // Headings
    "h1.doc-title": {
      fontSize: 72, // 36pt
      bold: true,
      alignment: "center",
      spacingBefore: 480,
      spacingAfter: 240,
    },
    "p.doc-subtitle": {
      fontSize: 40, // 20pt
      italics: true,
      alignment: "center",
      spacingBefore: 120,
      spacingAfter: 360,
    },
    "h1.chapter-heading": {
      fontSize: 52, // 26pt
      bold: true,
      alignment: "center",
      spacingBefore: 480,
      spacingAfter: 240,
    },
    "h2.section-heading": {
      fontSize: 44, // 22pt
      bold: true,
      spacingBefore: 360,
      spacingAfter: 180,
    },
    "h3.subsection-heading": {
      fontSize: 36, // 18pt
      bold: true,
      spacingBefore: 240,
      spacingAfter: 120,
    },

    // Body text
    "p.body-text": {
      fontSize: 24, // 12pt
      firstLineIndent: 720, // 0.5 inch
      lineSpacing: 360, // 1.5 lines
    },
    "p.first-paragraph": {
      fontSize: 24,
      firstLineIndent: 0, // No indent for first paragraph
      lineSpacing: 360,
    },
    "p.no-spacing": {
      fontSize: 24,
      spacingBefore: 0,
      spacingAfter: 0,
    },

    // Quotes
    "blockquote.quote": {
      fontSize: 24,
      italics: true,
      leftIndent: 720, // 0.5 inch
      rightIndent: 720,
      spacingBefore: 240,
      spacingAfter: 240,
    },
    "blockquote.epigraph": {
      fontSize: 22,
      italics: true,
      alignment: "right",
      rightIndent: 720,
      spacingBefore: 240,
      spacingAfter: 360,
    },
  },
};

/**
 * CSS styles to inject for consistent editor display
 * These should match the DOCX export styles
 */
export const EDITOR_CSS = `
/* Document Title */
h1.doc-title {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-top: 2em;
  margin-bottom: 1em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Document Subtitle */
p.doc-subtitle {
  font-size: 20px;
  font-style: italic;
  text-align: center;
  margin-top: 0.5em;
  margin-bottom: 1.5em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Chapter Heading (H1) */
h1.chapter-heading {
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  margin-top: 2em;
  margin-bottom: 1em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Section Heading (H2) */
h2.section-heading {
  font-size: 22px;
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Subsection Heading (H3) */
h3.subsection-heading {
  font-size: 18px;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Body Text with indent */
p.body-text {
  text-indent: 1.5em;
  line-height: 1.5;
  margin-bottom: 0;
  font-family: 'Times New Roman', Georgia, serif;
}

/* First paragraph - no indent */
p.first-paragraph {
  text-indent: 0;
  line-height: 1.5;
  margin-bottom: 0;
  font-family: 'Times New Roman', Georgia, serif;
}

/* No spacing paragraph */
p.no-spacing {
  margin: 0;
  padding: 0;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Quotes */
blockquote.quote {
  font-style: italic;
  margin-left: 2em;
  margin-right: 2em;
  padding: 0.5em 0;
  border-left: 3px solid #ccc;
  padding-left: 1em;
  font-family: 'Times New Roman', Georgia, serif;
}

blockquote.block-quote {
  margin-left: 2em;
  margin-right: 2em;
  padding: 0.5em 0;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Epigraph - typically for chapter opening quotes */
blockquote.epigraph {
  font-style: italic;
  text-align: right;
  margin-right: 2em;
  margin-top: 1em;
  margin-bottom: 1.5em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Intense quote */
blockquote.intense-quote {
  font-style: italic;
  font-weight: bold;
  margin-left: 2em;
  margin-right: 2em;
  padding: 0.5em 1em;
  background-color: #f5f5f5;
  border-left: 4px solid #666;
  font-family: 'Times New Roman', Georgia, serif;
}

/* List paragraph */
p.list-paragraph {
  margin-left: 1.5em;
  text-indent: -0.5em;
  padding-left: 0.5em;
  font-family: 'Times New Roman', Georgia, serif;
}

/* Book title character style */
em.book-title {
  font-style: italic;
}

/* Subtle emphasis */
span.subtle-emphasis {
  font-style: italic;
  color: #666;
}

/* Subtle reference */
span.subtle-reference {
  font-size: 0.9em;
  color: #888;
}
`;

/**
 * Get mammoth options with our style map
 */
export function getMammothOptions() {
  return {
    styleMap: MAMMOTH_STYLE_MAP,
    includeDefaultStyleMap: true, // Keep default mappings as fallback
    convertImage: mammoth.images.imgElement(async (image) => {
      try {
        const buffer = await image.read();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const mimeType = image.contentType || "image/png";
        return { src: `data:${mimeType};base64,${base64}` };
      } catch {
        return { src: "" };
      }
    }),
  };
}

// Import mammoth for the image converter reference
import mammoth from "mammoth";
