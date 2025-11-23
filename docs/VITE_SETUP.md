`# Chapter Checker - Vite + React + Tailwind CSS

A modern, production-ready React application for analyzing educational chapters using 10 evidence-based learning science principles.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
chapter-checker/
├── src/
│   ├── components/              # React components organized by feature
│   │   ├── ChapterInput/         # Chapter input section
│   │   │   └── index.tsx         # Main component
│   │   ├── Input/                # Input sub-components
│   │   │   ├── TextAreaInput.tsx
│   │   │   ├── FileUploadButton.tsx
│   │   │   ├── AnalyzeButton.tsx
│   │   │   ├── WordCounter.tsx
│   │   │   └── InfoCard.tsx
│   │   ├── Alerts/               # Alert components
│   │   │   └── ErrorAlert.tsx
│   │   └── Dashboard/            # Analysis results
│   │       ├── ChapterAnalysisDashboard.tsx
│   │       └── Components/
│   │           ├── OverallScoreCard.tsx
│   │           ├── PrincipleScoresGrid.tsx
│   │           ├── PrincipleScoreCard.tsx
│   │           ├── ConceptAnalysisSection.tsx
│   │           ├── RecommendationsSection.tsx
│   │           └── RecommendationCard.tsx
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                   # Utility functions
│   │   └── AnalysisEngine.ts
│   ├── styles/                  # Global styles
│   │   └── globals.css
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Application entry point
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript config for build tools
├── package.json                 # Project dependencies
└── .gitignore                   # Git ignore file
```

## 🏗️ Component Architecture

### Component Hierarchy & Props Flow

```
App (root)
├── Header (sticky, manages navigation)
├── ChapterInput (input section, manages form state)
│   ├── TextAreaInput (controlled by parent)
│   │   Props: value, onChange, placeholder, disabled
│   ├── FileUploadButton (file upload handler)
│   │   Props: onUpload, isDisabled, fileInputRef
│   ├── AnalyzeButton (analysis trigger)
│   │   Props: onClick, disabled, isLoading, progress
│   ├── WordCounter (display)
│   │   Props: count
│   ├── InfoCard (display) - 3x
│   │   Props: title, items
│   └── ErrorAlert (conditional display)
│       Props: message, onDismiss
├── ChapterAnalysisDashboard (analysis results)
│   ├── OverallScoreCard
│   │   Props: score
│   ├── PrincipleScoresGrid
│   │   Props: principles
│   │   └── PrincipleScoreCard (map)
│   │       Props: principle
│   ├── ConceptAnalysisSection
│   │   Props: totalConcepts, coreConcepts, density, balance
│   ├── RecommendationsSection
│   │   Props: recommendations
│   │   └── RecommendationCard (map)
│   │       Props: recommendation
│   └── Export button (export functionality)
└── Footer (static information)
```

### Props Pattern Example

**Parent Component (ChapterInput):**

```tsx
const [chapterText, setChapterText] = useState<string>("");

<TextAreaInput
  value={chapterText} // Props passed from parent
  onChange={(value) => setChapterText(value)}
  placeholder="Enter chapter..."
  disabled={isLoading}
/>;
```

**Child Component (TextAreaInput):**

```tsx
function TextAreaInput({
  value, // Props destructured
  onChange,
  placeholder,
  disabled,
}: TextAreaInputProps): JSX.Element {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)} // Call parent callback
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
```

## 🎨 Styling with Tailwind CSS

### Custom Component Classes

Located in `src/styles/globals.css` using `@layer` directives:

```css
@layer components {
  .btn-primary {
    @apply btn-base bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-glow;
  }

  .card {
    @apply bg-white rounded-xl shadow-soft border border-gray-100;
  }

  .input-base {
    @apply w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary-500;
  }
}
```

### Typography

Using "Inter" font from Google Fonts (loaded in `index.html`):

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
  rel="stylesheet"
/>
```

Applied globally in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  },
}
```

## 📝 Code Style & Conventions

### Component Comments

```tsx
/**
 * Component Description
 *
 * Detailed explanation of what it does.
 * Parent/child relationships.
 *
 * Parent: ParentName
 * Children: Child1, Child2
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} Description of returned element
 */
```

### Props Interface

```tsx
/**
 * Props interface for ComponentName component
 */
interface ComponentNameProps {
  /** Description of prop */
  propName: PropType;
}
```

### Function Comments

```tsx
/**
 * Function description
 *
 * Detailed explanation of functionality.
 *
 * @param {ParamType} paramName - Parameter description
 * @returns {ReturnType} Return value description
 */
const functionName = (paramName: ParamType): ReturnType => {
  // implementation
};
```

### Destructuring Pattern

```tsx
// Always destructure props
function Component({ prop1, prop2, prop3 }: ComponentProps): JSX.Element {
  // Use destructured props directly
  return <div>{prop1}</div>;
}

// Destructure in function bodies
const { title, score, findings } = analysis;

// Destructure with renaming when needed
const {
  conceptAnalysis: { totalConcepts },
} = analysis;
```

## 🔧 Key Configuration Files

### vite.config.ts

- Configures Vite build tool
- Sets up path aliases (@components, @types, @utils)
- Defines development server port (3000)

### tailwind.config.ts

- Extends Tailwind with custom colors
- Defines custom component classes
- Sets up Inter font family

### tsconfig.json

- Strict mode enabled
- Path aliases matching vite.config.ts
- React JSX support
- ES2020 target

### index.html

- Loads Inter font from Google Fonts
- React root element mount point
- Links to main.tsx entry

## 🎯 Development Workflow

### 1. Create New Component

```bash
# Create component file
src/components/Feature/ComponentName.tsx
```

### 2. Define Props Interface

```tsx
interface ComponentNameProps {
  /** Prop description */
  propName: string;
}
```

### 3. Implement Component

```tsx
/**
 * Component Description
 * Parent: ParentName
 * Children: ChildNames
 */
function ComponentName({ propName }: ComponentNameProps): JSX.Element {
  return <div>{propName}</div>;
}
```

### 4. Export Default

```tsx
export default ComponentName;
```

### 5. Import and Use in Parent

```tsx
import ComponentName from "@components/Feature/ComponentName";

// In parent component
<ComponentName propName="value" />;
```

## 🧩 Adding New Features

### Add a New Type

1. Update `src/types/index.ts`
2. Use in components with full type safety
3. Export from types file

### Add a New Component

1. Create file in appropriate `src/components/` subdirectory
2. Create Props interface
3. Add detailed comments
4. Implement with destructuring
5. Export default
6. Import in parent component

### Add Global Styles

1. Add to `src/styles/globals.css`
2. Use `@layer` for proper cascade
3. Follow Tailwind conventions

## 🚀 Performance Tips

### Code Splitting

- Components automatically code-split by Vite
- Dynamic imports supported

### Optimization

- Production build uses Terser minification
- CSS automatically purged by Tailwind
- Images can be optimized with build tools

### Development

- Fast refresh for instant feedback
- Only load used CSS
- HMR (Hot Module Replacement) enabled

## 📊 Learning Principles Implemented

1. **Deep Processing** - Encourages thoughtful engagement
2. **Spaced Repetition** - Tracks concept mentions
3. **Retrieval Practice** - Prompts for recall
4. **Interleaving** - Analyzes topic mixing
5. **Dual Coding** - Supports visual + text
6. **Generative Learning** - Encourages creation
7. **Metacognition** - Self-assessment opportunities
8. **Schema Building** - Hierarchical organization
9. **Cognitive Load** - Appropriate pacing
10. **Emotion & Relevance** - Personal connection

## 🔗 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Inter Font](https://fonts.google.com/specimen/Inter)

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 🐛 Debugging

### Debug in VS Code

1. Install Debugger for Chrome extension
2. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "/src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### React DevTools

- Install React DevTools browser extension
- Inspect component props and state
- Profile performance

## 📦 Deployment

### Build

```bash
npm run build
# Creates optimized bundle in dist/
```

### Deploy Options

- Vercel: `vercel deploy`
- Netlify: Drag dist/ folder
- GitHub Pages: Configure GitHub Actions
- AWS S3 + CloudFront: Upload dist/ contents

---

**Happy coding! 🎉**

For questions or issues, refer to the component comments and type definitions for detailed guidance.
