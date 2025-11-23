# HTML Export Templates

This directory contains HTML templates used for exporting documents with consistent styling.

## Template Structure

### `exportTemplate.html`

The main export template with professional styling for educational content.

**Placeholders:**

- `{{DOCUMENT_TITLE}}` - The document title (used in HTML head)
- `{{CONTENT}}` - The main content body

## Using Templates

### Basic Usage

```typescript
import { exportToHtml } from "@/utils/htmlExport";

exportToHtml({
  text: documentText,
  html: richHtmlContent,
  fileName: "my-chapter",
  analysis: analysisResults,
  includeHighlights: true,
});
```

### Template Features

The template includes pre-styled components for:

1. **Analysis Summary**

   - Overall scores with color-coded badges
   - **Simplified principle summaries** (brief score-based text instead of detailed lists)
   - Principle-by-principle breakdowns
   - Key recommendations

2. **Spacing Indicators**

   - Visual markers between paragraphs
   - Color-coded by spacing tone (compact/balanced/extended)
   - Word count and guidance

3. **Dual Coding Callouts**

   - Visual suggestion boxes
   - Priority badges (high/medium/low)
   - Actionable recommendations

4. **Content Formatting**
   - Responsive typography
   - Print-friendly styles
   - Semantic HTML structure

## Customizing Templates

### Creating a New Template

1. Create a new `.html` file in this directory
2. Include placeholders: `{{PLACEHOLDER_NAME}}`
3. Add CSS in `<style>` tags or link external stylesheets
4. Update `htmlExport.ts` to use your template

### Template Variables

You can add custom placeholders in your template and replace them in the export function:

```typescript
const finalHtml = templateHtml
  .replace("{{DOCUMENT_TITLE}}", documentTitle)
  .replace("{{CONTENT}}", contentHtml)
  .replace("{{CUSTOM_VAR}}", customValue);
```

### CSS Classes Reference

#### Analysis Components

- `.analysis-summary` - Container for analysis section
- `.principle-section` - Individual principle card
- `.principle-header` - Title and score row
- `.principle-summary` - Brief italic summary text (new simplified format)
- `.principle-score` - Score badge (with `.high`, `.medium`, `.low` modifiers)
- `.recommendation` - Recommendation card (with `.high`, `.medium` modifiers)

#### Spacing Components

- `.spacing-indicator` - Spacing target marker
- `.spacing-indicator.compact` - Green spacing (good)
- `.spacing-indicator.extended` - Amber spacing (needs adjustment)

#### Dual Coding Components

- `.dual-coding-callout` - Visual suggestion box
- `.callout-priority` - Priority badge (with `.high`, `.medium`, `.low` modifiers)
- `.callout-icon` - Icon container
- `.callout-action` - Action recommendation

#### Content Components

- `.chapter-content` - Main content wrapper
- `.content-divider` - Section separator

## Best Practices

1. **Keep HTML semantic** - Use proper heading hierarchy (h1-h6)
2. **Include print styles** - Use `@media print` for printer-friendly output
3. **Test responsively** - Ensure templates work on mobile, tablet, and desktop
4. **Accessibility** - Use ARIA labels and semantic HTML
5. **Color contrast** - Ensure text is readable (WCAG AA minimum)

## Export Formats Comparison

| Feature          | HTML Export       | DOCX Export (Nov 2025)           |
| ---------------- | ----------------- | -------------------------------- |
| Styling Control  | Full CSS control  | Shaded backgrounds & borders     |
| File Size        | Smaller           | Larger                           |
| Browser Viewable | ✅ Yes            | ❌ No (needs Word)               |
| Editable         | In code editor    | In Word/Office                   |
| Print-Friendly   | ✅ Yes            | ✅ Yes                           |
| Embedded Images  | Base64 or URLs    | Embedded binary                  |
| Cross-Platform   | ✅ Universal      | ⚠️ Requires Office               |
| Visual Richness  | ✅ Full CSS       | ✅ Colored shading (new feature) |
| Consistency      | ✅ Template-based | ✅ Same HTML builder             |

**Note**: DOCX exports now include colored backgrounds for spacing indicators and dual-coding callouts, matching the HTML template design. Both formats use the same unified HTML builder for consistency.

## Examples

### Minimal Template

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{DOCUMENT_TITLE}}</title>
    <style>
      body {
        font-family: Georgia, serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }
    </style>
  </head>
  <body>
    {{CONTENT}}
  </body>
</html>
```

### Using Custom Styles

You can modify `exportTemplate.html` directly, or create alternate templates:

```
templates/
  ├── exportTemplate.html          (default)
  ├── academicTemplate.html        (for academic papers)
  ├── reportTemplate.html          (for business reports)
  └── presentationTemplate.html    (for slides)
```

Then import and use in your export function:

```typescript
import academicTemplate from "@/templates/academicTemplate.html?raw";

const finalHtml = academicTemplate
  .replace("{{DOCUMENT_TITLE}}", title)
  .replace("{{CONTENT}}", content);
```
