# Unified Export System

## Overview

The Chapter-Analysis project uses a **unified HTML-based export system** that ensures consistent styling between HTML and DOCX exports. Both formats are generated from the same HTML content, which is built using a shared HTML builder utility.

## Architecture

```
┌─────────────────────────────────────────┐
│   User clicks Export HTML or Export DOCX │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      htmlBuilder.ts                      │
│  buildHtmlFromTemplate() or              │
│  buildContentHtml()                      │
│                                          │
│  • Builds analysis summary               │
│  • Adds spacing indicators               │
│  • Adds dual-coding callouts             │
│  • Applies CSS classes                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌─────────────┐     ┌──────────────┐
│ htmlExport  │     │  docxExport  │
│             │     │              │
│ Downloads   │     │ Converts     │
│ HTML file   │     │ HTML→DOCX    │
│ directly    │     │ paragraphs   │
└─────────────┘     └──────────────┘
```

## Key Files

### 1. **src/utils/htmlBuilder.ts** (Shared Content Builder)

Central utility for building HTML content with consistent styling.

#### Functions:

- **`buildHtmlFromTemplate(options)`** - Builds complete HTML document with template

  - Returns full HTML with `<!DOCTYPE>`, `<head>`, CSS, etc.
  - Used by HTML export to create downloadable `.html` files

- **`buildContentHtml(options)`** - Builds just the body content HTML
  - Returns only the content without template wrapper
  - Used by DOCX export (doesn't need HTML boilerplate)

#### What it generates:

```html
<!-- Analysis Summary Section -->
<div class="analysis-summary">
  <h2>Analysis Summary</h2>
  <div class="score-display">Overall Score: 85/100</div>

  <div class="principle-section">
    <div class="principle-header">
      <div class="principle-title">Spacing Analysis</div>
      <div class="principle-score high">82/100</div>
    </div>
    <p class="principle-summary">
      Strong application of this principle. See highlighted sections below for
      details.
    </p>
  </div>
</div>
<hr class="content-divider" />
<h1>Edited Chapter Text</h1>

<!-- Chapter Content with Highlights -->
<div class="chapter-content">
  <div class="spacing-indicator compact">
    <div class="spacing-label">
      Spacing Target · Paragraph 2 · 45 words · Good
    </div>
    <div class="spacing-message">Within optimal range...</div>
  </div>

  <p>Chapter paragraph text...</p>

  <div class="dual-coding-callout">
    <div class="callout-header">
      <span class="callout-icon">📊</span>
      <span class="callout-title">Diagram - High priority</span>
      <span class="callout-priority high">high</span>
    </div>
    <div class="callout-reason">Complex spatial relationships...</div>
    <div class="callout-context">Excerpt from paragraph...</div>
    <div class="callout-action">
      <strong>Suggested action:</strong> Create a diagram...
    </div>
  </div>
</div>
```

### 2. **src/utils/htmlExport.ts** (HTML Export)

Thin wrapper around htmlBuilder for HTML downloads.

```typescript
export const exportToHtml = ({
  text,
  html,
  fileName,
  analysis,
  includeHighlights,
}) => {
  // Use shared builder
  const finalHtml = buildHtmlFromTemplate({
    text,
    html,
    fileName,
    analysis,
    includeHighlights,
  });

  // Download
  downloadHtmlFile(finalHtml, documentTitle);
};
```

### 3. **src/utils/docxExport.ts** (DOCX Export)

Converts HTML from htmlBuilder to Microsoft Word format.

```typescript
export const exportToDocx = async ({
  text,
  html,
  fileName,
  analysis,
  includeHighlights,
}) => {
  // Build HTML using shared builder
  const htmlContent = buildContentHtml({
    text,
    html,
    analysis,
    includeHighlights,
  });

  // Convert HTML to DOCX paragraphs
  const paragraphs: Paragraph[] = [];

  // Add title
  paragraphs.push(
    new Paragraph({ text: safeTitle, heading: HeadingLevel.TITLE })
  );

  // Parse HTML and convert to DOCX format
  const htmlParagraphs = convertHtmlToParagraphs(htmlContent);
  paragraphs.push(...htmlParagraphs);

  // Create document
  const doc = new Document({ sections: [{ children: paragraphs }] });

  // Generate and download
  const blob = await Packager.toBlob(doc);
  saveAs(blob, downloadName);
};
```

The `convertHtmlToParagraphs()` function:

- Parses HTML using browser's DOMParser
- Converts HTML elements to docx `Paragraph` and `TextRun` objects
- Preserves formatting (bold, italic, colors, headings)
- Handles lists, blockquotes, images
- Maps CSS classes to Word styles where possible

## CSS Classes Used

The HTML template (`src/templates/exportTemplate.html`) defines these CSS classes:

| Class                         | Purpose                         | DOCX Conversion                        |
| ----------------------------- | ------------------------------- | -------------------------------------- |
| `.analysis-summary`           | Container for analysis section  | Background color, padding              |
| `.score-display`              | Overall score badge             | Bold, larger font                      |
| `.principle-section`          | Individual principle box        | Light background, border               |
| `.principle-header`           | Principle title + score row     | Flex layout                            |
| `.principle-summary`          | Brief text summary (simplified) | Italic, gray text                      |
| `.principle-score.high`       | High scores (≥80)               | Green color                            |
| `.principle-score.medium`     | Medium scores (50-79)           | Yellow/orange color                    |
| `.principle-score.low`        | Low scores (<50)                | Red color                              |
| `.spacing-indicator`          | Paragraph spacing overlay       | **Blue shaded background (#DBEAFE)**   |
| `.spacing-indicator.compact`  | Compact spacing warning         | **Orange shaded background + border**  |
| `.spacing-indicator.extended` | Extended spacing warning        | **Red shaded background + border**     |
| `.dual-coding-callout`        | Visual suggestion box           | **Yellow shaded background (#FEF9C3)** |
| `.callout-priority.high`      | High Priority badge             | **Red text ("High Priority")**         |
| `.callout-priority.medium`    | Medium Priority badge           | **Orange text ("Medium Priority")**    |
| `.callout-priority.low`       | Low Priority badge              | **Gray text ("Low Priority")**         |
| `.chapter-content`            | Main document content           | Standard paragraph styling             |

## Analysis Section Format

### Simplified Summaries (Current Approach)

The analysis sections (Spacing Analysis and Dual Coding Analysis) are intentionally **simplified** to avoid overwhelming the reader:

- **Score display**: Color-coded score badge (high/medium/low)
- **Brief summary**: One-sentence explanation based on score:
  - Score ≥80: "Strong application of this principle. See highlighted sections below for details."
  - Score 50-79: "Moderate application. Review highlighted sections below for improvement opportunities."
  - Score <50: "Significant opportunities for improvement. See highlighted sections below for specific suggestions."

**No detailed findings or suggestion lists** are shown in the summary. All specific feedback is provided contextually through:

- 🔵 **Spacing indicators** between paragraphs in the document
- 💡 **Dual-coding callouts** with visual suggestions inline

This approach keeps the top summary clean while preserving all detailed feedback in the actual chapter text where it's most relevant.

## Benefits of Unified Approach

### 1. **Consistency**

Both HTML and DOCX exports show the same information with the same visual hierarchy.

### 2. **Maintainability**

Changes to analysis formatting only need to be made in one place (`htmlBuilder.ts`).

### 3. **Extensibility**

Adding new analysis features (e.g., interleaving detector) requires:

- Update `htmlBuilder.ts` to generate HTML
- No changes needed to `htmlExport.ts` or `docxExport.ts`

### 4. **Testability**

Can test HTML generation independently of export format.

### 5. **Clean Separation**

- **htmlBuilder** = Content generation logic
- **htmlExport** = Download mechanism for HTML
- **docxExport** = Conversion mechanism for Word

### 6. **Visual Richness in DOCX**

DOCX exports now include colored backgrounds and borders matching HTML:

- **Spacing indicators**: Colored shaded paragraphs (blue/orange/red)
- **Dual-coding callouts**: Yellow shaded boxes with colored priority badges
- **Increased heading sizes**: H1 (400pt before), H2 (320pt before), H3 (240pt before)
- **Priority labels**: Two-word format ("High Priority", "Medium Priority", "Low Priority")

These enhancements use Word's `ShadingType` and border features to replicate the HTML template's visual design.

## Example Usage

### From ChapterCheckerV2.tsx:

```typescript
// HTML Export
const handleExportHtml = () => {
  exportToHtml({
    text: documentText,
    html: editorHtml,
    fileName: fileName || "edited-chapter",
    analysis: analysis,
    includeHighlights: true,
  });
};

// DOCX Export
const handleExportDocx = async () => {
  await exportToDocx({
    text: documentText,
    html: editorHtml,
    fileName: fileName || "edited-chapter",
    analysis: analysis,
    includeHighlights: true,
  });
};
```

Both functions accept identical parameters and produce visually consistent outputs.

## HTML Template Customization

To customize export styling, edit `src/templates/exportTemplate.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{DOCUMENT_TITLE}}</title>
    <style>
      /* Modify colors, fonts, spacing here */
      .analysis-summary {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        /* ... */
      }
    </style>
  </head>
  <body>
    {{CONTENT}}
  </body>
</html>
```

The `{{DOCUMENT_TITLE}}` and `{{CONTENT}}` placeholders are replaced at runtime.

## Future Enhancements

Potential improvements to the unified export system:

1. **PDF Export** - Add `pdfExport.ts` that renders the HTML template in a headless browser
2. **Markdown Export** - Convert HTML to Markdown for version control-friendly docs
3. **Custom Templates** - Allow users to upload their own HTML templates
4. **Style Presets** - Multiple built-in color schemes (dark mode, high contrast, etc.)
5. **Print-Optimized CSS** - Better page breaks and margins for printing
6. **Interactive HTML** - Add collapsible sections, tabs, interactive charts to HTML export

## Migration Notes

**Old Approach (Pre-Unification):**

- `docxExport.ts` manually built paragraphs with separate analysis summary logic
- `htmlExport.ts` manually built HTML with duplicate analysis summary logic
- Changes required updating both files
- Risk of inconsistencies between formats

**New Approach (Current):**

- `htmlBuilder.ts` centralizes all content generation
- `docxExport.ts` calls htmlBuilder, then converts HTML→DOCX
- `htmlExport.ts` calls htmlBuilder, then downloads HTML
- Changes only require updating htmlBuilder
- Guaranteed consistency between formats

## Troubleshooting

### Issue: DOCX export looks different from HTML export

**Cause:** The `convertHtmlToParagraphs()` function may not be mapping certain CSS classes correctly.

**Solution:** Check the HTML→DOCX conversion logic around line 779 in `docxExport.ts`. You may need to add specific handling for new CSS classes.

### Issue: HTML template changes not appearing

**Cause:** Vite may have cached the old template.

**Solution:**

```bash
# Restart dev server
npm run dev
```

### Issue: Export buttons not working

**Cause:** Missing import or function call.

**Solution:** Verify imports in `ChapterCheckerV2.tsx`:

```typescript
import { exportToHtml } from "@/utils/htmlExport";
import { exportToDocx } from "@/utils/docxExport";
```

## Related Documentation

- `docs/HTML_EXPORT_GUIDE.md` - Detailed HTML export usage
- `src/templates/README.md` - Template system documentation
- `docs/TECHNICAL_ARCHITECTURE.md` - Overall system architecture
