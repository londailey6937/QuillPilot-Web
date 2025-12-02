# Quill Pilot Color Palette

## Brand Colors

### Primary Orange (Tome Orange)

- **#ef8432** - Main brand color, primary accent
  - Used for: Buttons, borders, highlights, logo, active states
  - RGB: `rgb(239, 132, 50)`

### Dark Navy (Tome Navy)

- **#2c3e50** - Primary text and structural elements
  - Used for: Text, borders, logo, structural elements
  - RGB: `rgb(44, 62, 80)`

## Typography

### Default Font Settings

- **Default Font Family:** Georgia, serif
- **Default Font Size:** 16px
- **Line Height:** 1.6 (editor content)

### Font Options Available

| Font Name         | Stack                      | Use Case              |
| ----------------- | -------------------------- | --------------------- |
| Georgia (Default) | `Georgia, serif`           | General prose, novels |
| Times New Roman   | `Times New Roman, serif`   | Academic, formal      |
| Palatino          | `Palatino Linotype, serif` | Literary, elegant     |
| Garamond          | `Garamond, serif`          | Classic, books        |
| Arial             | `Arial, sans-serif`        | Modern, clean         |
| Helvetica         | `Helvetica, sans-serif`    | Professional          |
| Verdana           | `Verdana, sans-serif`      | Screen readability    |
| Courier New       | `Courier New, monospace`   | Code, scripts         |
| Courier Prime     | `Courier Prime, monospace` | Screenplay format     |

### Font Size Range

- **Minimum:** 8px
- **Maximum:** 72px
- **Default:** 16px
- **Adjustment:** ±1px per click (A-/A+ buttons)

## Background Colors

### Cream & Tan Backgrounds

- **#fef5e7** - Main card background (soft cream)

  - RGB: `rgb(254, 245, 231)`
  - Used for: Primary cards, dropdowns, main content areas, analysis legend gradient endpoint

- **#fffaf3** - Lightest cream

  - RGB: `rgb(255, 250, 243)`
  - Used for: Analysis legend gradient start point, subtle highlights

- **#f7e6d0** - Hover/selected state (light tan)

  - RGB: `rgb(247, 230, 208)`
  - Used for: Hover states, selected items, active backgrounds

- **#f5ead9** - Subtle variant (pale tan)

  - RGB: `rgb(245, 234, 217)`
  - Used for: Section backgrounds, alternating rows

- **#f5e6d3** - Lighter variant

  - RGB: `rgb(245, 230, 211)`
  - Used for: Concept analysis sections

- **#eddcc5** - Darker beige
  - RGB: `rgb(237, 220, 197)`
  - Used for: Section dividers, darker backgrounds

### Gradient Backgrounds

- **#fff7ed to #fef3c7** - Warm gradient

  - Used for: Upgrade prompts, featured sections

- **#fef5e7 to #fff7ed** - Subtle cream gradient

  - Used for: Quick Start Guide, Reference Library shells

- **#fffaf3 to #fef5e7** - Analysis legend gradient
  - Gradient direction: 135deg
  - Used for: Editor analysis legend background
  - Paired with: #e0c392 border, rgba(239, 132, 50, 0.12) shadow

## Border Colors

### Primary Borders

- **#e0c392** - Soft tan border

  - RGB: `rgb(224, 195, 146)`
  - Opacity variants: `rgba(224, 195, 146, 0.5)` for subtle borders
  - Used for: Card borders, button outlines, section dividers

- **#f5d1ab** - Lighter tan border
  - RGB: `rgb(245, 209, 171)`
  - Used for: Header borders, subtle dividers

### Accent Borders

- **rgba(217, 119, 6, 0.15)** - Orange tint border

  - Used for: Quick Start shell borders

- **rgba(217, 119, 6, 0.12)** - Lighter orange tint
  - Used for: Quick Start card borders

## Text Colors

### Primary Text

- **#2c3e50** - Main text color (navy)
- **#111827** - Strong headings (near black)
  - RGB: `rgb(17, 24, 39)`
- **#374151** - Secondary text (gray)
  - RGB: `rgb(55, 65, 81)`

### Special Text

- **#92400e** - Dark amber (warnings)
  - RGB: `rgb(146, 64, 14)`
- **#7c2d12** - Darker amber
  - RGB: `rgb(124, 45, 18)`
- **#9a3412** - Rich orange-red
  - RGB: `rgb(154, 52, 18)`

### Muted Text

- **#9ca3af** - Light gray (dividers, bullets)
  - RGB: `rgb(156, 163, 175)`
- **#6b7280** - Medium gray (secondary labels)
  - RGB: `rgb(107, 114, 128)`
- **#64748b** - Slate gray (disabled states)
  - RGB: `rgb(100, 116, 139)`
- **#78716c** - Stone gray (legend text)
  - RGB: `rgb(120, 113, 108)`
  - Used for: Analysis legend labels, muted UI text

## Status Colors

### Success

- **#10b981** - Green success
  - RGB: `rgb(16, 185, 129)`
  - Used for: Success messages, positive indicators

### Warning

- **#f59e0b** - Amber warning

  - RGB: `rgb(245, 158, 11)`
  - Used for: Warning messages, moderate issues

- **#eab308** - Yellow warning/indicator
  - RGB: `rgb(234, 179, 8)`
  - Used for: Sensory detail suggestions, missing elements indicator

### Error/Critical

- **#ef4444** - Red error

  - RGB: `rgb(239, 68, 68)`
  - Used for: Error messages, critical issues

- **#c16659** - Muted red (unselected error state)
  - RGB: `rgb(193, 102, 89)`
  - Used for: Inactive error indicators

### Info/Accent

- **#f97316** - Bright orange

  - RGB: `rgb(249, 115, 22)`
  - Used for: Call-to-action buttons, emphasis, long paragraph indicators

- **#8b5cf6** - Purple indicator
  - RGB: `rgb(139, 92, 246)`
  - Used for: Passive voice indicators, stylistic suggestions

## Neutral Grays

### Light Grays

- **#ffffff** - Pure white

  - Used for: Button backgrounds, clean surfaces

- **#e2e8f0** - Very light gray

  - RGB: `rgb(226, 232, 240)`
  - Used for: Disabled button backgrounds

- **#dce4ec** - Light blue-gray
  - RGB: `rgb(220, 228, 236)`
  - Used for: Section backgrounds, subtle containers

## Usage Guidelines

### Hierarchy

1. **Primary Actions**: `#ef8432` (Tome Orange) on white or cream backgrounds
2. **Secondary Actions**: Tan backgrounds with navy text
3. **Tertiary Actions**: Cream backgrounds with borders

### Contrast Requirements

- Always use `#2c3e50` (navy) for text on cream backgrounds
- Use `#ffffff` (white) text on `#ef8432` (orange) backgrounds
- Ensure minimum 4.5:1 contrast ratio for body text

### Hover States

- Cards/Buttons: Background changes from `#fef5e7` to `#f7e6d0`
- Borders: Intensity increases or color shifts to `#ef8432`
- Text: Can shift to `#ef8432` for emphasis

### Consistency Notes

- All main UI cards use `#fef5e7` background
- All hover states use `#f7e6d0`
- All primary borders use `#e0c392`
- All primary CTAs use `#ef8432`

## Color Conversion Reference

### Most Common Colors in rgb() format

```css
/* Brand Colors */
--tome-orange: rgb(239, 132, 50);
--tome-navy: rgb(44, 62, 80);

/* Backgrounds */
--cream: rgb(254, 245, 231);
--tan-light: rgb(247, 230, 208);
--tan-subtle: rgb(245, 234, 217);

/* Borders */
--border-tan: rgb(224, 195, 146);

/* Text */
--text-primary: rgb(44, 62, 80);
--text-heading: rgb(17, 24, 39);
--text-secondary: rgb(55, 65, 81);
--text-muted: rgb(156, 163, 175);

/* Status */
--success: rgb(16, 185, 129);
--warning: rgb(245, 158, 11);
--error: rgb(239, 68, 68);
```

## Implementation Notes

- Prefer hex codes (`#ef8432`) in component styles for consistency
- Use `rgb()` format when opacity modifications might be needed
- Use `rgba()` for borders and shadows with transparency
- Reference this document before adding new colors
- Update this document when introducing new colors to the palette
