# Web Development Concept Library

## Overview

The Web Development library combines JavaScript and React concepts into a unified library for better concept detection in web development educational content.

## Library Details

- **Domain**: `webdevelopment`
- **Version**: 1.0.0
- **Total Concepts**: 220+
- **File**: `src/data/webDevelopmentConceptLibrary.ts`

## Rationale for Consolidation

Previously, JavaScript and React were separate libraries with 85+ concepts each. Combining them provides several benefits:

1. **Better Concept Detection**: React tutorials naturally discuss JavaScript concepts (closures in hooks, promises in effects, etc.). A unified library prevents missed matches.

2. **Reduced Ambiguity**: Eliminates confusion when content mixes both technologies, which is standard practice.

3. **Proper Prerequisites**: Enables encoding relationships where React concepts require JavaScript fundamentals (e.g., React components require JavaScript functions, hooks require closures).

4. **Simplified Domain Selection**: Users select "Web Development" instead of choosing between React and JavaScript for mixed content.

## Concept Organization

### JavaScript Fundamentals (85+ concepts)

#### Core Concepts

- **Language**: JavaScript, ECMAScript
- **Functions**: function, arrow function, callback, closure
- **Variables**: var, let, const
- **Scope**: this keyword, hoisting, lexical scope
- **Object Model**: prototype, prototypal inheritance

#### Asynchronous JavaScript

- promise, async/await, event loop, setTimeout

#### ES6+ Features

- destructuring, spread operator, rest parameters
- template literals, class, module, default parameters

#### Data Structures

- **Arrays**: map, filter, reduce, forEach, find, some/every
- **Objects**: Object.keys, Object.values, Object.assign, JSON

#### DOM Manipulation

- DOM, querySelector, getElementById, addEventListener
- createElement, innerHTML, event handling

#### Web APIs

- fetch, localStorage, console

#### Error Handling

- try/catch, throw, Error objects

#### Patterns

- callback pattern, module pattern, debouncing

#### Node.js & Tooling

- Node.js, npm, require, Express
- Jest, Webpack, Babel, ESLint

#### Type Systems

- TypeScript, type checking

### React Framework (85+ concepts)

#### Core Concepts

- React, component, JSX, props, state

#### Hooks

- **State**: useState, useReducer
- **Effects**: useEffect
- **Context**: useContext
- **Refs**: useRef
- **Performance**: useMemo, useCallback
- **Custom**: custom hooks

#### Lifecycle

- mounting, updating, unmounting

#### Rendering

- virtual DOM, reconciliation, render, key prop

#### State Management

- Context API, provider, consumer

#### Events & Forms

- event handler, synthetic event
- controlled component, uncontrolled component

#### Performance

- React.memo, lazy loading, Suspense

#### Patterns

- higher-order component (HOC)
- render props
- compound components

#### Ecosystem

- **Routing**: React Router, Route, Link
- **Testing**: React Testing Library
- **Tooling**: Create React App, Vite

#### Frameworks

- Next.js, server-side rendering, static site generation

#### Modern Features

- Concurrent Mode, Server Components
- fragment, portal, StrictMode

### CSS & Styling (40+ concepts)

#### Core Styling

- CSS, selectors, pseudo-classes, pseudo-elements

#### Layout Systems

- **Flexbox**: flexible box model, flex container, flex items
- **Grid**: CSS Grid, two-dimensional layouts
- **Responsive**: media queries, breakpoints, viewport

#### Frameworks & Tools

- **Utility-First**: Tailwind CSS
- **Preprocessors**: Sass, SCSS
- **Modern CSS**: CSS variables, custom properties

### Build Tools & Bundlers (10+ concepts)

#### Modern Bundlers

- Vite, Webpack, esbuild, Rollup

#### Compilers

- Babel, SWC, TypeScript compiler

#### Task Runners

- npm scripts, build optimization

### Alternative Frameworks (5+ concepts)

#### Component Frameworks

- **Vue**: Progressive framework, approachable API
- **Svelte**: Compile-time framework, minimal runtime

### TypeScript Advanced (10+ concepts)

#### Type System

- generics, type inference, utility types
- interface, type aliases, type guards

#### Advanced Features

- Partial, Required, Pick, Omit, Record

### State Management (5+ concepts)

#### Libraries

- **Redux**: Predictable state container, actions, reducers
- **Zustand**: Lightweight hooks-based state
- Context API patterns

### Testing Tools (10+ concepts)

#### Unit Testing

- Jest, Vitest, React Testing Library

#### E2E Testing

- Cypress, Playwright, end-to-end workflows

## Prerequisites Encoding

The library encodes JavaScript → React dependencies:

```typescript
// Example: arrow function requires function
{
  name: "arrow function",
  prerequisites: ["function"]
}

// Example: async/await requires promise
{
  name: "async/await",
  prerequisites: ["promise", "function"]
}
```

This enables intelligent prerequisite checking where React content can reference JavaScript foundations.

## Usage in Domain Selection

When analyzing web development content, select **Web Development** domain:

- Covers both vanilla JavaScript and React
- Detects mixed content accurately
- Provides comprehensive coverage of modern web stack

The separate **Computer Science** domain remains for general CS topics (algorithms, data structures, computational theory, etc.).

## Impact on Analysis

### Concept Extraction

- Single library means concepts from both JavaScript and React are detected together
- Prevents "missed concept" false negatives in tutorials that mix both

### Prerequisite Order Check

- Can now validate that JavaScript fundamentals precede React usage
- Example: Functions should be introduced before components

### Relationship Analysis

- Better relationship detection between JavaScript and React concepts
- Identifies when React patterns use JavaScript features (e.g., hooks using closures)

## Migration Notes

**Previous Libraries Replaced:**

- `src/data/reactConceptLibrary.ts` (594 lines, 85+ concepts)
- `src/data/javascriptConceptLibrary.ts` (627 lines, 85+ concepts)

**New Library:**

- `src/data/webDevelopmentConceptLibrary.ts` (1,400+ lines, 220+ concepts)

**Updated Files:**

- `src/data/conceptLibraryRegistry.ts` - Import and register new library
- `src/data/conceptLibraryTypes.ts` - Updated Domain type and AVAILABLE_DOMAINS
- `src/components/ReferenceLibraryModal.tsx` - Updated documentation

**Domain ID Changed:**

- Old: `"react"` and `"javascript"` (separate)
- New: `"webdevelopment"` (unified)

## Future Enhancements

Potential additions to the library:

- ~~CSS concepts (flexbox, grid, selectors)~~ ✅ Added (v1.0.0)
- ~~Build tools (esbuild, Rollup, SWC)~~ ✅ Added (v1.0.0)
- ~~Alternative frameworks (Vue, Svelte)~~ ✅ Added (v1.0.0)
- ~~State management libraries (Redux, Zustand)~~ ✅ Added (v1.0.0)
- ~~Testing tools (Cypress, Playwright, Vitest)~~ ✅ Added (v1.0.0)
- ~~TypeScript advanced concepts (generics, utility types)~~ ✅ Added (v1.0.0)
- Web platform APIs (Service Workers, Web Workers, IndexedDB)
- CSS-in-JS solutions (styled-components, Emotion)
- GraphQL and API patterns

For now, the library covers core JavaScript, React, CSS, TypeScript, build tools, and modern testing frameworks.
