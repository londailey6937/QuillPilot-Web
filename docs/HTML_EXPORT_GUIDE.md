# HTML Export Guide

## Overview

The HTML export feature allows you to export your analyzed documents as beautifully styled HTML files that can be viewed in any browser, printed, or shared easily.

## Features

✅ **Professional Styling** - Clean, readable design optimized for educational content
✅ **Simplified Analysis** - Brief score-based summaries instead of detailed lists
✅ **Analysis Integration** - Includes scores, recommendations, and insights
✅ **Spacing Indicators** - Visual markers showing paragraph spacing analysis
✅ **Dual Coding Callouts** - Highlighted suggestions for visual aids
✅ **Print-Friendly** - Optimized CSS for printing
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **No External Dependencies** - Self-contained HTML file
✅ **DOCX Parity** - Same visual design as Word exports## How to Use

### 1. Upload & Analyze Document

```
1. Upload your DOCX or OBT file
2. Run the analysis
3. Review results in the interface
```

### 2. Export as HTML

Click the **"🌐 Export HTML"** button in the document header.

The exported HTML file will:

- Include your edited text
- Show all analysis results
- Display spacing indicators between paragraphs
- Highlight dual-coding suggestions
- Include scoring and recommendations

### 3. View or Share

Open the downloaded `.html` file in any web browser:

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Full support
- **Mobile browsers** - Responsive design

## Export Options Comparison

### HTML Export vs DOCX Export

| Aspect              | HTML                    | DOCX                          |
| ------------------- | ----------------------- | ----------------------------- |
| **Viewing**         | Any browser             | Requires Word/Office          |
| **Editing**         | HTML/CSS skills         | Word processor                |
| **Styling**         | Full CSS control        | Colored backgrounds (Nov '25) |
| **File Size**       | Smaller                 | Larger                        |
| **Sharing**         | Email, web, link        | Email, cloud drive            |
| **Printing**        | Browser print           | Word print                    |
| **Portability**     | ✅ Universal            | ⚠️ Needs software             |
| **Visual Richness** | ✅ Full CSS             | ✅ Shaded backgrounds (new)   |
| **Consistency**     | ✅ Unified HTML builder | ✅ Same content as HTML       |

**Note**: As of November 2025, DOCX exports now include colored shaded backgrounds for spacing indicators and dual-coding callouts, matching the HTML design.

## Customizing HTML Exports

### Using the Template System

1. **Locate Template**

   ```
   src/templates/exportTemplate.html
   ```

2. **Edit CSS Styles**
   Modify the `<style>` section in the template:

   ```css
   body {
     font-family: "Your Font", serif;
     color: #yourcolor;
     max-width: 1000px; /* Adjust width */
   }
   ```

3. **Change Colors**

   ```css
   /* Analysis section */
   .analysis-summary {
     background-color: #f3f4f6; /* Background */
     border-left-color: #2563eb; /* Accent */
   }

   /* Spacing indicators */
   .spacing-indicator {
     background-color: #dbeafe;
   }

   /* Dual coding callouts */
   .dual-coding-callout {
     background-color: #fef9c3;
     border-color: #fbbf24;
   }

   /* Simplified principle summaries */
   .principle-summary {
     font-style: italic;
     color: #4b5563;
   }
   ```

4. **Adjust Typography**

   ```css
   body {
     font-size: 18px; /* Base size */
     line-height: 1.9; /* Line spacing */
   }

   h1 {
     font-size: 36px;
   }
   h2 {
     font-size: 28px;
   }
   ```

### Creating Custom Templates

1. **Duplicate Template**

   ```bash
   cp src/templates/exportTemplate.html src/templates/customTemplate.html
   ```

2. **Modify Template**

   - Update styles
   - Add/remove sections
   - Change layout

3. **Use in Code**

   ```typescript
   import customTemplate from "@/templates/customTemplate.html?raw";

   // In htmlExport.ts
   const finalHtml = customTemplate
     .replace("{{DOCUMENT_TITLE}}", title)
     .replace("{{CONTENT}}", content);
   ```

## Template Placeholders

The template system uses placeholders that get replaced with actual content:

- `{{DOCUMENT_TITLE}}` - Document name/title
- `{{CONTENT}}` - Main document content with analysis

## Styling Components

### Available CSS Classes

#### Structure

- `.analysis-summary` - Analysis section wrapper
- `.chapter-content` - Main text content
- `.content-divider` - Section separator

#### Analysis Components

- `.principle-section` - Individual principle card
- `.principle-score` - Score badge
  - `.high` - Green (80-100)
  - `.medium` - Yellow (50-79)
  - `.low` - Red (0-49)

#### Spacing Components

- `.spacing-indicator` - Base spacing marker
  - `.compact` - Green indicator (good spacing)
  - `.extended` - Amber indicator (needs work)

#### Dual Coding Components

- `.dual-coding-callout` - Suggestion box
- `.callout-priority` - Priority badge
  - `.high` - Red priority
  - `.medium` - Yellow priority
  - `.low` - Gray priority

#### Recommendations

- `.recommendation` - Recommendation card
  - `.high` - High priority (red border)
  - `.medium` - Medium priority (yellow border)

## Best Practices

### For Reading

- Use serif fonts (Georgia, Times) for body text
- Sans-serif (Arial, Helvetica) for headings
- Line height: 1.6-1.8 for readability
- Max width: 900px for comfortable reading

### For Printing

- Include `@media print` styles
- Use page-break-inside: avoid for sections
- Consider black & white printing
- Remove unnecessary colors

### For Sharing

- Keep file size small (compress images)
- Use relative units (rem, em) not fixed pixels
- Test in multiple browsers
- Include print stylesheet

## Advanced Customization

### Adding Your Logo

```css
body::before {
  content: "";
  display: block;
  width: 200px;
  height: 60px;
  background: url("your-logo.png") no-repeat center;
  background-size: contain;
  margin: 0 auto 20px;
}
```

### Custom Fonts

```html
<head>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
    rel="stylesheet"
  />
  <style>
    body {
      font-family: "Inter", sans-serif;
    }
  </style>
</head>
```

### Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1f2937;
    color: #f9fafb;
  }

  .analysis-summary {
    background-color: #374151;
    border-left-color: #60a5fa;
  }
}
```

## Troubleshooting

### Styles Not Applying

- Check CSS syntax
- Verify class names match
- Clear browser cache
- Check for typos in selectors

### Images Not Showing

- Ensure images are base64 encoded
- Check image URLs are accessible
- Verify image permissions

### Print Issues

- Add `@media print` styles
- Set page margins
- Use `page-break-inside: avoid`

### Browser Compatibility

- Test in multiple browsers
- Use standard CSS properties
- Avoid experimental features
- Check caniuse.com for support

## Examples

### Minimal Export (No Analysis)

```typescript
exportToHtml({
  text: documentText,
  fileName: "chapter",
  includeHighlights: false, // Skip analysis sections
});
```

### With Full Analysis

```typescript
exportToHtml({
  text: documentText,
  html: richHtmlContent,
  fileName: "analyzed-chapter",
  analysis: analysisResults,
  includeHighlights: true, // Include all annotations
});
```

## Support

For issues or questions about HTML exports:

1. Check this guide
2. Review template README: `src/templates/README.md`
3. Inspect browser console for errors
4. Verify file downloads correctly

## Resources

- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
