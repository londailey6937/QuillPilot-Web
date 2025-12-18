/**
 * PaginatedEditor - Production Custom Pagination Engine
 *
 * A Word-like pagination engine that renders content across multiple page elements.
 * Uses overflow detection and content splitting for true paginated editing.
 *
 * Key Features:
 * - Real page elements (not just visual indicators)
 * - Overflow detection with content splitting
 * - Inline formatting preservation across page breaks
 * - Cursor position management during repagination
 * - Configurable margins and page size
 * - Header/footer support
 * - Ruler integration ready
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DocumentStylesState } from "../types/documentStyles";

// ============================================================================
// Types
// ============================================================================

export interface PageDimensions {
  pageWidthPx: number;
  pageHeightPx: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface PageData {
  id: number;
  content: string;
}

export interface CursorPosition {
  pageIndex: number;
  nodeIndex: number;
  offset: number;
  atEnd: boolean;
}

export interface PaginatedEditorRef {
  getContent: () => string;
  setContent: (html: string) => void;
  focus: () => void;
  getPageCount: () => number;
  goToPage: (pageIndex: number) => void;
  scrollToTop: () => void;
  execCommand: (command: string, value?: string) => void;
  getPageContentElements: () => HTMLDivElement[];
  getScrollContainer: () => HTMLDivElement | null;
  getPagesContainer: () => HTMLDivElement | null;
  setSkipNextRepagination: (skip: boolean) => void;
  insertAtCursor: (html: string) => void;
}

export interface PaginatedEditorProps {
  initialContent?: string;
  onChange?: (content: { html: string; text: string }) => void;
  onPageCountChange?: (count: number) => void;
  isEditable?: boolean;
  // Dimensions
  pageWidthPx?: number;
  pageHeightPx?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  // First line indent
  firstLineIndent?: number;
  // Header/Footer
  headerText?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  pageNumberPosition?: "header" | "footer";
  // Styling
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  // Ruler
  showRuler?: boolean;
  onLeftMarginChange?: (value: number) => void;
  onRightMarginChange?: (value: number) => void;
  onFirstLineIndentChange?: (value: number) => void;
  // Document Styles
  documentStyles?: DocumentStylesState;
  showStyleLabels?: boolean;
  // Page Rail
  activePage?: number;
  onActivePageChange?: (pageIndex: number) => void;
  onPageSnippetsChange?: (snippets: string[]) => void;
  // Jump to page callback
  onJumpToPage?: (pageIndex: number) => void;
  // Scroll callback
  onScroll?: (scrollTop: number) => void;
  // Overlay content (for indicators)
  overlayContent?: React.ReactNode;
  // External keyboard handler for shortcuts like Cmd+Z
  onExternalKeyDown?: (e: React.KeyboardEvent) => void;
  // Callback when a page break is removed by double-clicking
  onPageBreakRemove?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const INCH_PX = 96;
const DEFAULT_PAGE_WIDTH = INCH_PX * 8.5;
const DEFAULT_PAGE_HEIGHT = INCH_PX * 11;
const DEFAULT_MARGIN = INCH_PX * 1;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_FONT_FAMILY = "Georgia, serif";
const REPAGINATE_DEBOUNCE_MS = 500; // Longer debounce to reduce cursor jumps
const MAX_PAGES = 200;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Deep clone a node while preserving all attributes and styles
 */
function deepCloneNode(node: Node): Node {
  return node.cloneNode(true);
}

/**
 * Serialize nodes to HTML string
 */
function nodesToHtml(nodes: Node[]): string {
  return nodes
    .map((n) =>
      n.nodeType === Node.ELEMENT_NODE
        ? (n as Element).outerHTML
        : n.nodeType === Node.TEXT_NODE
        ? n.textContent || ""
        : ""
    )
    .join("");
}

/**
 * Parse HTML string to nodes
 */
function htmlToNodes(html: string): Node[] {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return Array.from(temp.childNodes);
}

/**
 * Split HTML content at page breaks.
 * Returns an array of HTML strings, each representing content for one "section"
 * that should start on a new page.
 *
 * Logic: Find all .page-break elements, split content before/after each one.
 * The page-break element itself is removed (it's just a marker).
 */
function splitAtPageBreaks(html: string): string[] {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const sections: string[] = [];
  let currentSection: Node[] = [];

  // Recursively process nodes, looking for page-break at any level
  const processNode = (node: Node): boolean => {
    // Check if this node IS a page-break
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.classList?.contains("page-break")) {
        // Found a page break - flush current section and start new one
        if (currentSection.length > 0) {
          const wrapper = document.createElement("div");
          currentSection.forEach((n) => wrapper.appendChild(n.cloneNode(true)));
          sections.push(wrapper.innerHTML);
          currentSection = [];
        }
        return true; // Signal that we handled this node
      }

      // Check if this element CONTAINS a page-break
      const nestedBreak = el.querySelector(".page-break");
      if (nestedBreak) {
        // We need to split this element
        const beforeNodes: Node[] = [];
        const afterNodes: Node[] = [];
        let foundBreak = false;

        for (const child of Array.from(el.childNodes)) {
          if ((child as Element).classList?.contains("page-break")) {
            foundBreak = true;
            continue; // Skip the page-break itself
          }

          // Check if child contains the break
          if (!foundBreak && child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as Element;
            if (childEl.querySelector(".page-break")) {
              // Recursively handle - this child contains the break
              // For simplicity, treat content before break as "before"
              // This is a simplification; for deeply nested, we split at parent level
              foundBreak = true;
              // Add everything before this child to beforeNodes
              // The child itself needs recursive handling - skip for now, add to after
              afterNodes.push(child.cloneNode(true));
              continue;
            }
          }

          if (!foundBreak) {
            beforeNodes.push(child.cloneNode(true));
          } else {
            afterNodes.push(child.cloneNode(true));
          }
        }

        // Create "before" version of this element
        if (beforeNodes.length > 0) {
          const beforeEl = el.cloneNode(false) as Element;
          beforeNodes.forEach((n) => beforeEl.appendChild(n));
          currentSection.push(beforeEl);
        }

        // Flush the current section (before page break)
        if (currentSection.length > 0) {
          const wrapper = document.createElement("div");
          currentSection.forEach((n) => wrapper.appendChild(n.cloneNode(true)));
          sections.push(wrapper.innerHTML);
          currentSection = [];
        }

        // Create "after" version of this element for next section
        if (afterNodes.length > 0) {
          const afterEl = el.cloneNode(false) as Element;
          // Remove page-break from after nodes
          afterNodes.forEach((n) => {
            if ((n as Element).classList?.contains("page-break")) return;
            const cleaned = n.cloneNode(true) as Element;
            if (
              cleaned.nodeType === Node.ELEMENT_NODE &&
              cleaned.querySelectorAll
            ) {
              const nestedBreaks = cleaned.querySelectorAll(".page-break");
              nestedBreaks.forEach((pb) => pb.remove());
            }
            afterEl.appendChild(cleaned);
          });
          if (afterEl.childNodes.length > 0) {
            currentSection.push(afterEl);
          }
        }

        return true;
      }
    }

    // No page-break in this node, add to current section
    currentSection.push(node.cloneNode(true));
    return false;
  };

  // Process all top-level nodes
  for (const node of Array.from(temp.childNodes)) {
    processNode(node);
  }

  // Don't forget the last section
  if (currentSection.length > 0) {
    const wrapper = document.createElement("div");
    currentSection.forEach((n) => wrapper.appendChild(n.cloneNode(true)));
    sections.push(wrapper.innerHTML);
  }

  // If no sections (empty or no breaks), return original
  if (sections.length === 0) {
    return [html];
  }

  return sections;
}

/**
 * Check if a node is a block element
 */
function isBlockElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  // Also check for column-container class (special block element)
  if (element.classList?.contains("column-container")) return true;
  return [
    "p",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "ul",
    "ol",
    "li",
    "pre",
    "table",
    "tr",
    "section",
    "article",
    "header",
    "footer",
  ].includes(tag);
}

/**
 * Split text while preserving inline formatting
 * This handles <p>Some <b>bold</b> text here</p> correctly
 */
function splitFormattedText(
  element: Element,
  splitAtWord: number
): [Element, Element | null] {
  const clone1 = element.cloneNode(false) as Element;
  const clone2 = element.cloneNode(false) as Element;

  // Mark clone2 as a continuation (no first-line indent)
  if (clone2 instanceof HTMLElement) {
    clone2.classList.add("paragraph-continuation");
    console.log(
      "[PaginatedEditor] Added paragraph-continuation class to split element:",
      clone2.tagName,
      clone2.className
    );
  }

  let wordCount = 0;
  let foundSplit = false;

  function processNode(node: Node, target1: Node, target2: Node): void {
    if (foundSplit) {
      target2.appendChild(deepCloneNode(node));
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const words = text.split(/(\s+)/); // Keep whitespace

      const part1Words: string[] = [];
      const part2Words: string[] = [];

      for (const word of words) {
        if (foundSplit) {
          part2Words.push(word);
        } else if (word.trim()) {
          wordCount++;
          if (wordCount <= splitAtWord) {
            part1Words.push(word);
          } else {
            foundSplit = true;
            part2Words.push(word);
          }
        } else {
          // Whitespace
          if (wordCount < splitAtWord) {
            part1Words.push(word);
          } else if (wordCount === splitAtWord && !foundSplit) {
            part1Words.push(word);
          } else {
            part2Words.push(word);
          }
        }
      }

      if (part1Words.length > 0) {
        target1.appendChild(document.createTextNode(part1Words.join("")));
      }
      if (part2Words.length > 0) {
        target2.appendChild(document.createTextNode(part2Words.join("")));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const newEl1 = el.cloneNode(false) as Element;
      const newEl2 = el.cloneNode(false) as Element;

      for (const child of Array.from(el.childNodes)) {
        processNode(child, newEl1, newEl2);
      }

      if (newEl1.childNodes.length > 0 || newEl1.textContent) {
        target1.appendChild(newEl1);
      }
      if (newEl2.childNodes.length > 0 || newEl2.textContent) {
        target2.appendChild(newEl2);
      }
    }
  }

  for (const child of Array.from(element.childNodes)) {
    processNode(child, clone1, clone2);
  }

  return [clone1, clone2.childNodes.length > 0 ? clone2 : null];
}

/**
 * Count words in an element
 */
function countWords(element: Element): number {
  const text = element.textContent || "";
  return text.split(/\s+/).filter((w) => w.trim().length > 0).length;
}

// ============================================================================
// Main Component
// ============================================================================

export const PaginatedEditor = forwardRef<
  PaginatedEditorRef,
  PaginatedEditorProps
>(
  (
    {
      initialContent = "",
      onChange,
      onPageCountChange,
      isEditable = true,
      pageWidthPx = DEFAULT_PAGE_WIDTH,
      pageHeightPx = DEFAULT_PAGE_HEIGHT,
      marginTop = DEFAULT_MARGIN,
      marginBottom = DEFAULT_MARGIN,
      marginLeft = DEFAULT_MARGIN,
      marginRight = DEFAULT_MARGIN,
      firstLineIndent = 0,
      headerText = "",
      footerText = "",
      showPageNumbers = true,
      pageNumberPosition = "footer",
      fontFamily = DEFAULT_FONT_FAMILY,
      fontSize = DEFAULT_FONT_SIZE,
      lineHeight = DEFAULT_LINE_HEIGHT,
      showRuler = false,
      onLeftMarginChange,
      onRightMarginChange,
      onFirstLineIndentChange,
      // Document Styles
      documentStyles,
      showStyleLabels = true,
      // Page Rail
      activePage,
      onActivePageChange,
      onPageSnippetsChange,
      // Scroll
      onScroll,
      // Overlay content
      overlayContent,
      // External keyboard handler
      onExternalKeyDown,
      // Page break removal callback
      onPageBreakRemove,
    },
    ref
  ) => {
    // ========================================================================
    // State & Refs
    // ========================================================================

    const measureRef = useRef<HTMLDivElement>(null);
    const pagesContainerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const rulerContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const repaginateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRepaginatingRef = useRef(false);
    const savedCursorRef = useRef<CursorPosition | null>(null);

    const [pages, setPages] = useState<PageData[]>([{ id: 1, content: "" }]);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [rulerDragging, setRulerDragging] = useState<
      "left" | "right" | "indent" | null
    >(null);

    // Cross-page selection state
    const crossPageSelectionRef = useRef<{
      isSelecting: boolean;
      startPageIndex: number;
      startNode: Node | null;
      startOffset: number;
    }>({
      isSelecting: false,
      startPageIndex: -1,
      startNode: null,
      startOffset: 0,
    });

    // Notify parent when active page changes
    useEffect(() => {
      onActivePageChange?.(activePageIndex);
    }, [activePageIndex, onActivePageChange]);

    // Sync with external activePage prop (for thumbnail rail clicks)
    // Using a ref to track if we should skip the sync to prevent loops
    const skipSyncRef = useRef(false);
    const internalChangeRef = useRef(false);
    // Timeout-based skip - stores timestamp until which to skip repagination
    const skipUntilRef = useRef<number>(0);
    useEffect(() => {
      if (skipSyncRef.current) {
        skipSyncRef.current = false;
        return;
      }
      // Don't scroll if the change was from internal focus
      if (internalChangeRef.current) {
        internalChangeRef.current = false;
        return;
      }
      if (activePage !== undefined && activePage !== activePageIndex) {
        skipSyncRef.current = true;
        setActivePageIndex(activePage);
        // Scroll to the page (only for external changes like thumbnail click)
        const pageRef = pageRefs.current.get(pages[activePage]?.id);
        if (pageRef) {
          pageRef.scrollIntoView({ behavior: "smooth", block: "start" });
          pageRef.focus();
        }
      }
    }, [activePage, activePageIndex, pages]);

    // Computed dimensions
    const contentWidth = pageWidthPx - marginLeft - marginRight;
    const contentHeight = pageHeightPx - marginTop - marginBottom;

    // ========================================================================
    // Measurement
    // ========================================================================

    const measureHeight = useCallback((html: string): number => {
      if (!measureRef.current) {
        console.warn("[PaginatedEditor] measureRef not ready");
        return 0;
      }
      measureRef.current.innerHTML = html;
      const height = measureRef.current.scrollHeight;
      return height;
    }, []);

    // ========================================================================
    // Content Splitting
    // ========================================================================

    /**
     * Check if an element is a column container (unsplittable block)
     */
    const isColumnContainer = (node: Node): boolean => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      return (node as Element).classList?.contains("column-container") || false;
    };

    /**
     * Check if an element is a section container (template .sec class)
     * These need special handling to keep headings with their first field
     */
    const isSectionContainer = (node: Node): boolean => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      return (node as Element).classList?.contains("sec") || false;
    };

    /**
     * Copy style tags from original element to a cloned container
     * This ensures CSS styles are preserved when splitting template content
     */
    const copyStyleTags = (
      originalElement: Element,
      targetContainer: Element
    ): void => {
      const styleTags = originalElement.querySelectorAll(":scope > style");
      styleTags.forEach((styleTag) => {
        targetContainer.insertBefore(
          styleTag.cloneNode(true),
          targetContainer.firstChild
        );
      });
    };

    /**
     * Check if an element is a heading that should stay with following content
     */
    const isOrphanableHeading = (node: Node): boolean => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as Element;
      const tagName = el.tagName?.toUpperCase();
      // H1-H6 headings, or h2 inside a .sec container
      return (
        tagName === "H1" ||
        tagName === "H2" ||
        tagName === "H3" ||
        tagName === "H4" ||
        tagName === "H5" ||
        tagName === "H6"
      );
    };

    const splitContentAtHeight = useCallback(
      (html: string, maxHeight: number): [string, string] => {
        // Note: Page breaks are already handled by splitAtPageBreaks()
        // This function only handles height-based splitting
        const nodes = htmlToNodes(html);
        if (nodes.length === 0) return [html, ""];

        const fittingNodes: Node[] = [];
        const remainingNodes: Node[] = [];
        let foundSplit = false;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (foundSplit) {
            remainingNodes.push(deepCloneNode(node));
            continue;
          }

          // Test if adding this node exceeds height
          const testNodes = [...fittingNodes, deepCloneNode(node)];
          const testHtml = nodesToHtml(testNodes);
          const testHeight = measureHeight(testHtml);

          if (testHeight <= maxHeight) {
            fittingNodes.push(deepCloneNode(node));
          } else {
            // This node causes overflow

            // ORPHAN PREVENTION: If the last fitting node is a heading,
            // move it to the next page to keep it with following content
            if (fittingNodes.length > 0) {
              const lastFitting = fittingNodes[fittingNodes.length - 1];
              if (isOrphanableHeading(lastFitting)) {
                // Move the heading to remaining nodes
                const orphanedHeading = fittingNodes.pop();
                if (orphanedHeading) {
                  remainingNodes.push(orphanedHeading);
                }
              }
            }

            // SPECIAL HANDLING: Column containers cannot be split
            // They must be moved entirely to the next page
            if (isColumnContainer(node)) {
              console.warn(
                "[PaginatedEditor] Column container exceeds page height and will be moved to next page. " +
                  "Consider using less content in columns or avoid columns near page boundaries."
              );
              remainingNodes.push(deepCloneNode(node));
              foundSplit = true;
              continue;
            }

            // SPECIAL HANDLING: Section containers (.sec) with headings
            // Try to keep sections together, but if a section is larger than a page,
            // we need to split it while keeping the heading with at least some content
            if (isSectionContainer(node)) {
              const element = node as Element;
              const children = Array.from(element.children);

              // Find if there's a heading
              const headingIndex = children.findIndex((c) =>
                c.tagName?.match(/^H[1-6]$/i)
              );
              const minChildren = headingIndex >= 0 ? 2 : 1; // heading + 1 field minimum

              // Find how many children we can fit
              let fittingChildCount = 0;
              for (let c = 0; c < children.length; c++) {
                const testSection = element.cloneNode(false) as Element;
                for (let j = 0; j <= c; j++) {
                  testSection.appendChild(children[j].cloneNode(true));
                }
                const testHtml = nodesToHtml([...fittingNodes, testSection]);
                const h = measureHeight(testHtml);
                if (h <= maxHeight) {
                  fittingChildCount = c + 1;
                } else {
                  break;
                }
              }

              // If we can't fit the minimum (heading + first field), move entire section
              if (fittingChildCount < minChildren) {
                remainingNodes.push(deepCloneNode(node));
                foundSplit = true;
                continue;
              }

              // If all children fit, just add the whole section
              if (fittingChildCount >= children.length) {
                fittingNodes.push(deepCloneNode(node));
                // Don't set foundSplit - continue processing other nodes
              } else {
                // Split section by children - heading stays with fitting part
                const fittingSection = element.cloneNode(false) as Element;
                for (let j = 0; j < fittingChildCount; j++) {
                  fittingSection.appendChild(children[j].cloneNode(true));
                }
                fittingNodes.push(fittingSection);

                // Create remaining part with only non-heading children
                const remainingSection = element.cloneNode(false) as Element;
                for (let j = fittingChildCount; j < children.length; j++) {
                  remainingSection.appendChild(children[j].cloneNode(true));
                }
                if (remainingSection.children.length > 0) {
                  remainingNodes.push(remainingSection);
                }
                foundSplit = true;
              }
              continue;
            }

            if (isBlockElement(node)) {
              const element = node as Element;

              // Check if this block contains .sec children (template sections)
              // If so, split by sections, allowing partial section splits when needed
              const secChildren = Array.from(
                element.querySelectorAll(":scope > .sec")
              );
              if (secChildren.length > 0) {
                // This is a container with section children
                // Get all children but track which ones are .sec sections
                const allChildren = Array.from(element.children);

                // Separate non-sec header elements from sec elements
                const nonSecChildren: Element[] = [];
                const secOnlyChildren: Element[] = [];
                for (const child of allChildren) {
                  if (
                    child.tagName === "STYLE" ||
                    child.classList?.contains("sec")
                  ) {
                    if (child.classList?.contains("sec")) {
                      secOnlyChildren.push(child);
                    }
                  } else {
                    nonSecChildren.push(child); // header, etc - only in first page
                  }
                }

                let fittingChildCount = 0;
                let partialSectionData: {
                  index: number;
                  fittingCount: number;
                  children: Element[];
                } | null = null;

                // Test how many SECTIONS (not all children) we can fit
                // Include non-sec children only in the first test
                for (let c = 0; c < secOnlyChildren.length; c++) {
                  const child = secOnlyChildren[c];

                  // Test if we can fit this complete section
                  const testContainer = element.cloneNode(false) as Element;
                  copyStyleTags(element, testContainer);
                  // Add header elements to first page only
                  for (const nsc of nonSecChildren) {
                    testContainer.appendChild(nsc.cloneNode(true));
                  }
                  // Add sections up to and including c
                  for (let j = 0; j <= c; j++) {
                    testContainer.appendChild(
                      secOnlyChildren[j].cloneNode(true)
                    );
                  }
                  const testHtml = nodesToHtml([
                    ...fittingNodes,
                    testContainer,
                  ]);
                  const h = measureHeight(testHtml);

                  if (h <= maxHeight) {
                    fittingChildCount = c + 1;
                  } else {
                    // This section doesn't fit completely - try partial fit
                    const secChildElements = Array.from(child.children);
                    const hasHeading = secChildElements.some((sc) =>
                      (sc as Element).tagName?.match(/^H[1-6]$/i)
                    );
                    const minSecChildren = hasHeading ? 2 : 1;

                    // Find how many section children we can fit
                    let fittingSecChildren = 0;
                    for (let sc = 0; sc < secChildElements.length; sc++) {
                      const partialSec = child.cloneNode(false) as Element;
                      for (let j = 0; j <= sc; j++) {
                        partialSec.appendChild(
                          secChildElements[j].cloneNode(true)
                        );
                      }
                      const partialContainer = element.cloneNode(
                        false
                      ) as Element;
                      copyStyleTags(element, partialContainer);
                      // Add header elements
                      for (const nsc of nonSecChildren) {
                        partialContainer.appendChild(nsc.cloneNode(true));
                      }
                      // Add previous complete sections
                      for (let j = 0; j < c; j++) {
                        partialContainer.appendChild(
                          secOnlyChildren[j].cloneNode(true)
                        );
                      }
                      partialContainer.appendChild(partialSec);
                      const partialHtml = nodesToHtml([
                        ...fittingNodes,
                        partialContainer,
                      ]);
                      const partialH = measureHeight(partialHtml);
                      if (partialH <= maxHeight) {
                        fittingSecChildren = sc + 1;
                      } else {
                        break;
                      }
                    }

                    // Only allow partial split if we can fit minimum content
                    if (fittingSecChildren >= minSecChildren) {
                      partialSectionData = {
                        index: c,
                        fittingCount: fittingSecChildren,
                        children: secChildElements as Element[],
                      };
                    }
                    break; // Stop checking more sections
                  }
                }

                // Build the fitting and remaining containers
                if (partialSectionData) {
                  // We have a partial section split
                  const fittingContainer = element.cloneNode(false) as Element;
                  copyStyleTags(element, fittingContainer);

                  // Add header elements (only on first page)
                  for (const nsc of nonSecChildren) {
                    fittingContainer.appendChild(nsc.cloneNode(true));
                  }

                  // Add all complete sections before the partial one
                  for (let j = 0; j < partialSectionData.index; j++) {
                    fittingContainer.appendChild(
                      secOnlyChildren[j].cloneNode(true)
                    );
                  }

                  // Add partial section
                  const partialChild =
                    secOnlyChildren[partialSectionData.index];
                  const fittingSec = partialChild.cloneNode(false) as Element;
                  for (let j = 0; j < partialSectionData.fittingCount; j++) {
                    fittingSec.appendChild(
                      partialSectionData.children[j].cloneNode(true)
                    );
                  }
                  fittingContainer.appendChild(fittingSec);
                  fittingNodes.push(fittingContainer);

                  // Build remaining container - MUST copy style tags for CSS to work
                  // NO header elements on subsequent pages
                  const remainingContainer = element.cloneNode(
                    false
                  ) as Element;
                  copyStyleTags(element, remainingContainer);

                  // Add remaining part of partial section (without heading)
                  if (
                    partialSectionData.fittingCount <
                    partialSectionData.children.length
                  ) {
                    const remainingSec = partialChild.cloneNode(
                      false
                    ) as Element;
                    for (
                      let j = partialSectionData.fittingCount;
                      j < partialSectionData.children.length;
                      j++
                    ) {
                      remainingSec.appendChild(
                        partialSectionData.children[j].cloneNode(true)
                      );
                    }
                    remainingContainer.appendChild(remainingSec);
                  }

                  // Add all sections after the partial one
                  for (
                    let j = partialSectionData.index + 1;
                    j < secOnlyChildren.length;
                    j++
                  ) {
                    remainingContainer.appendChild(
                      secOnlyChildren[j].cloneNode(true)
                    );
                  }

                  if (remainingContainer.children.length > 0) {
                    remainingNodes.push(remainingContainer);
                  }
                  foundSplit = true;
                  continue;
                } else if (fittingChildCount > 0) {
                  // Create fitting container with complete sections
                  const fittingContainer = element.cloneNode(false) as Element;
                  copyStyleTags(element, fittingContainer);
                  // Add header elements (only on first page)
                  for (const nsc of nonSecChildren) {
                    fittingContainer.appendChild(nsc.cloneNode(true));
                  }
                  for (let j = 0; j < fittingChildCount; j++) {
                    fittingContainer.appendChild(
                      secOnlyChildren[j].cloneNode(true)
                    );
                  }
                  fittingNodes.push(fittingContainer);

                  // Create remaining container with the rest - MUST copy style tags
                  // NO header elements on subsequent pages
                  if (fittingChildCount < secOnlyChildren.length) {
                    const remainingContainer = element.cloneNode(
                      false
                    ) as Element;
                    copyStyleTags(element, remainingContainer);
                    for (
                      let j = fittingChildCount;
                      j < secOnlyChildren.length;
                      j++
                    ) {
                      remainingContainer.appendChild(
                        secOnlyChildren[j].cloneNode(true)
                      );
                    }
                    remainingNodes.push(remainingContainer);
                  }
                  foundSplit = true;
                  continue;
                } else {
                  // Can't fit any sections - push whole container to remaining
                  remainingNodes.push(deepCloneNode(node));
                  foundSplit = true;
                  continue;
                }
              }

              const totalWords = countWords(element);

              if (totalWords > 1) {
                // Binary search for split point
                let low = 1;
                let high = totalWords;
                let bestFit = 0;

                while (low <= high) {
                  const mid = Math.floor((low + high) / 2);
                  const [testPart] = splitFormattedText(element, mid);
                  const testHtml = nodesToHtml([...fittingNodes, testPart]);
                  const height = measureHeight(testHtml);

                  if (height <= maxHeight) {
                    bestFit = mid;
                    low = mid + 1;
                  } else {
                    high = mid - 1;
                  }
                }

                if (bestFit > 0) {
                  const [part1, part2] = splitFormattedText(element, bestFit);
                  fittingNodes.push(part1);
                  if (part2) {
                    remainingNodes.push(part2);
                  }
                } else {
                  // Can't fit any of it
                  remainingNodes.push(deepCloneNode(node));
                }
              } else {
                // Single word or empty - push whole to remaining
                remainingNodes.push(deepCloneNode(node));
              }
            } else {
              // Non-block element - push whole
              remainingNodes.push(deepCloneNode(node));
            }
            foundSplit = true;
          }
        }

        return [nodesToHtml(fittingNodes), nodesToHtml(remainingNodes)];
      },
      [measureHeight]
    );

    // ========================================================================
    // Cursor Management
    // ========================================================================

    const saveCursorPosition = useCallback((): CursorPosition | null => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);

      // Find which page contains the cursor
      for (let i = 0; i < pages.length; i++) {
        const pageRef = pageRefs.current.get(pages[i].id);
        if (pageRef && pageRef.contains(range.startContainer)) {
          // Calculate position within page
          const walker = document.createTreeWalker(
            pageRef,
            NodeFilter.SHOW_TEXT,
            null
          );

          let node = walker.nextNode();
          let nodeIndex = 0;

          while (node) {
            if (node === range.startContainer) {
              return {
                pageIndex: i,
                nodeIndex,
                offset: range.startOffset,
                atEnd:
                  range.collapsed &&
                  range.startOffset === (node.textContent?.length || 0),
              };
            }
            nodeIndex++;
            node = walker.nextNode();
          }

          // Fallback: return page with end position
          return {
            pageIndex: i,
            nodeIndex: 0,
            offset: 0,
            atEnd: true,
          };
        }
      }

      return null;
    }, [pages]);

    const restoreCursorPosition = useCallback(
      (saved: CursorPosition | null) => {
        if (!saved) return;

        const pageRef = pageRefs.current.get(pages[saved.pageIndex]?.id);
        if (!pageRef) return;

        // Focus the page
        pageRef.focus();

        const selection = window.getSelection();
        if (!selection) return;

        const walker = document.createTreeWalker(
          pageRef,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node = walker.nextNode();
        let nodeIndex = 0;

        while (node) {
          if (nodeIndex === saved.nodeIndex) {
            try {
              const range = document.createRange();
              const offset = Math.min(
                saved.offset,
                node.textContent?.length || 0
              );
              range.setStart(node, offset);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } catch {
              // Cursor restoration failed
            }
            return;
          }
          nodeIndex++;
          node = walker.nextNode();
        }

        // Fallback: put cursor at end of page
        if (saved.atEnd && pageRef.lastChild) {
          try {
            const range = document.createRange();
            range.selectNodeContents(pageRef);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch {
            // Fallback failed
          }
        }
      },
      [pages]
    );

    // ========================================================================
    // Repagination
    // ========================================================================

    const repaginate = useCallback(
      (fullHtml: string, preserveCursor = true) => {
        console.log(
          "[PaginatedEditor] repaginate called, html length:",
          fullHtml.length
        );

        if (isRepaginatingRef.current) {
          console.log("[PaginatedEditor] Already repaginating, skipping");
          return;
        }
        isRepaginatingRef.current = true;

        // Check if measure div is ready
        if (!measureRef.current) {
          console.warn(
            "[PaginatedEditor] measureRef not ready during repaginate"
          );
          isRepaginatingRef.current = false;
          return;
        }

        // Save cursor before repagination
        const savedCursor = preserveCursor ? saveCursorPosition() : null;

        // STEP 1: Split content at manual page breaks first
        // This gives us sections that MUST start on new pages
        const sections = splitAtPageBreaks(fullHtml);
        console.log(
          "[PaginatedEditor] Found",
          sections.length,
          "sections after page breaks"
        );

        const newPages: PageData[] = [];
        let pageId = 1;

        // Use slightly reduced height to account for measurement variance
        const safeContentHeight = contentHeight - 4;

        // STEP 2: For each section, paginate it (may span multiple pages if long)
        for (const section of sections) {
          let remaining = section;

          // Each section MUST start on a new page (that's what page-break means)
          // So we don't merge with previous page's content

          while (remaining.trim()) {
            const [fitting, leftover] = splitContentAtHeight(
              remaining,
              safeContentHeight
            );

            console.log(
              "[PaginatedEditor] Page",
              pageId,
              "fitting length:",
              fitting.length,
              "leftover length:",
              leftover.length
            );

            if (!fitting.trim() && leftover.trim()) {
              // Force content onto page to prevent infinite loop
              // Parse the leftover to check if it starts with a column-container
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = leftover;
              const firstElement = tempDiv.firstElementChild;

              if (firstElement?.classList?.contains("column-container")) {
                // Column container that's too tall - force it onto the page with a warning
                console.warn(
                  "[PaginatedEditor] WARNING: Column layout is taller than page content area. " +
                    "Content may overflow page boundaries. Consider reducing column content."
                );
                const columnHtml = firstElement.outerHTML;
                newPages.push({ id: pageId, content: columnHtml });
                // Remove the column from remaining content
                tempDiv.removeChild(firstElement);
                remaining = tempDiv.innerHTML;
              } else {
                // Standard force-fit logic for other content
                const closeTagIndex = leftover.indexOf("</");
                const endIndex =
                  closeTagIndex > -1
                    ? closeTagIndex +
                      leftover.substring(closeTagIndex).indexOf(">") +
                      1
                    : leftover.length;
                const forcedContent =
                  leftover.substring(0, endIndex) || leftover;
                newPages.push({ id: pageId, content: forcedContent });
                remaining = leftover.substring(forcedContent.length);
              }
            } else {
              newPages.push({ id: pageId, content: fitting });
              remaining = leftover;
            }

            pageId++;
            if (pageId > MAX_PAGES) break;
          }

          if (pageId > MAX_PAGES) break;
        }

        if (newPages.length === 0) {
          newPages.push({ id: 1, content: "" });
        }

        console.log("[PaginatedEditor] Setting", newPages.length, "pages");

        // DEBUG: Log first page content to see if styles are preserved
        if (newPages.length > 0) {
          console.log(
            "[PaginatedEditor DEBUG] First page content (first 500 chars):",
            newPages[0].content.substring(0, 500)
          );
        }

        setPages(newPages);
        onPageCountChange?.(newPages.length);

        // Generate page snippets for thumbnail rail
        if (onPageSnippetsChange) {
          const snippets = newPages.map((page) => {
            // Extract text from HTML and get first ~150 chars
            const temp = document.createElement("div");
            temp.innerHTML = page.content;
            const text = temp.textContent || "";
            return (
              text.substring(0, 150).trim() + (text.length > 150 ? "..." : "")
            );
          });
          onPageSnippetsChange(snippets);
        }

        // Schedule cursor restoration
        if (savedCursor) {
          savedCursorRef.current = savedCursor;
        }

        isRepaginatingRef.current = false;
      },
      [
        contentHeight,
        splitContentAtHeight,
        saveCursorPosition,
        onPageCountChange,
      ]
    );

    // Restore cursor after pages update
    useEffect(() => {
      if (savedCursorRef.current) {
        requestAnimationFrame(() => {
          restoreCursorPosition(savedCursorRef.current);
          savedCursorRef.current = null;
        });
      }
    }, [pages, restoreCursorPosition]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    const collectAllContent = useCallback((): string => {
      const allContent: string[] = [];
      pages.forEach((page) => {
        const ref = pageRefs.current.get(page.id);
        if (ref) {
          allContent.push(ref.innerHTML);
        }
      });
      return allContent.join("");
    }, [pages]);

    const handleInput = useCallback(() => {
      // Skip repagination if within skip window (e.g., during formatting operations)
      // Use timestamp-based check to skip multiple rapid onInput events
      if (Date.now() < skipUntilRef.current) {
        // Still within skip window - notify parent but don't repaginate
        const fullHtml = collectAllContent();
        onChange?.({
          html: fullHtml,
          text: fullHtml.replace(/<[^>]*>/g, ""),
        });
        return;
      }

      // Get full HTML content
      const fullHtml = collectAllContent();

      // Notify parent of content change
      onChange?.({
        html: fullHtml,
        text: fullHtml.replace(/<[^>]*>/g, ""),
      });

      // Check if we're currently editing inside a template field (.cf)
      // If so, skip the setPages call to avoid losing cursor position
      const selection = window.getSelection();
      const isInTemplateField =
        selection?.anchorNode &&
        (selection.anchorNode.parentElement?.classList.contains("cf") ||
          selection.anchorNode.parentElement?.closest(".cf") ||
          (selection.anchorNode as Element)?.classList?.contains("cf"));

      // IMPORTANT: We must NOT call setPages during normal typing because:
      // 1. setPages triggers React re-render
      // 2. React re-applies dangerouslySetInnerHTML
      // 3. This destroys the cursor position
      //
      // Instead, we let the DOM be the source of truth during editing.
      // The pages state will be synced on:
      // - repagination (when overflow detected)
      // - getContent() calls
      // - blur events
      //
      // This is safe because dangerouslySetInnerHTML only applies on mount
      // or when page.content changes - and we're not changing it here.

      // Check if repagination is actually needed
      // Only repaginate if content might have overflowed or pages need rebalancing
      const needsRepagination = () => {
        // Skip repagination entirely when editing template fields
        if (isInTemplateField) {
          return false;
        }

        // Always repaginate if there are page breaks in content
        if (fullHtml.includes("page-break")) {
          return true;
        }

        // Check if any page content exceeds the available height
        for (const page of pages) {
          const pageRef = pageRefs.current.get(page.id);
          if (pageRef) {
            const scrollHeight = pageRef.scrollHeight;
            const clientHeight = contentHeight;
            // Only repaginate if content significantly overflows (more than a line)
            if (scrollHeight > clientHeight + 30) {
              return true;
            }
          }
        }

        // Don't auto-collapse pages - let user manually handle that
        // This prevents repagination during normal editing
        return false;
      };

      // Clear any pending repagination
      if (repaginateTimeoutRef.current) {
        clearTimeout(repaginateTimeoutRef.current);
      }

      // Only schedule repagination if needed
      if (needsRepagination()) {
        // Debounce repagination
        repaginateTimeoutRef.current = setTimeout(() => {
          repaginate(fullHtml, true);
        }, REPAGINATE_DEBOUNCE_MS);
      }
    }, [collectAllContent, onChange, repaginate, pages, contentHeight]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, pageIndex: number) => {
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        console.log(
          "[PaginatedEditor handleKeyDown]",
          e.key,
          "modKey:",
          modKey,
          "metaKey:",
          e.metaKey,
          "ctrlKey:",
          e.ctrlKey
        );

        // Handle Cmd/Ctrl+Z (undo) and Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y (redo) FIRST
        // This must happen before any other key handling to prevent browser default
        if (
          modKey &&
          (e.key === "z" || e.key === "Z" || e.key === "y" || e.key === "Y")
        ) {
          console.log(
            "[PaginatedEditor] Undo/Redo key detected, calling onExternalKeyDown"
          );
          e.preventDefault();
          e.stopPropagation();
          if (onExternalKeyDown) {
            onExternalKeyDown(e);
          } else {
            console.log(
              "[PaginatedEditor] WARNING: onExternalKeyDown is not defined!"
            );
          }
          return;
        }

        // Handle other Cmd/Ctrl shortcuts (B, I, U, etc.)
        if (modKey && !e.altKey) {
          const key = e.key.toLowerCase();
          if (["b", "i", "u", "k", "s", "f"].includes(key)) {
            e.preventDefault();
            if (onExternalKeyDown) {
              onExternalKeyDown(e);
            }
            return;
          }
        }

        const pageRef = pageRefs.current.get(pages[pageIndex]?.id);
        if (!pageRef) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // Check cursor position - handle empty pages too
        const isAtStart = (() => {
          if (!range.collapsed) return false;
          // If page is empty or has no text, consider it "at start"
          const walker = document.createTreeWalker(
            pageRef,
            NodeFilter.SHOW_TEXT,
            null
          );
          const firstText = walker.nextNode();
          if (!firstText) return true; // Empty page
          return range.startContainer === firstText && range.startOffset === 0;
        })();

        const isAtEnd = (() => {
          if (!range.collapsed) return false;
          const walker = document.createTreeWalker(
            pageRef,
            NodeFilter.SHOW_TEXT,
            null
          );
          let lastText: Node | null = null;
          let node = walker.nextNode();
          while (node) {
            lastText = node;
            node = walker.nextNode();
          }
          if (!lastText) return true; // Empty page
          return (
            range.endContainer === lastText &&
            range.endOffset === (lastText.textContent?.length || 0)
          );
        })();

        // Navigate to previous page - only if we're at start AND there IS a previous page
        if (
          (e.key === "ArrowUp" || e.key === "ArrowLeft") &&
          isAtStart &&
          pageIndex > 0
        ) {
          e.preventDefault();
          const prevRef = pageRefs.current.get(pages[pageIndex - 1]?.id);
          if (prevRef) {
            prevRef.focus();
            // Move to end
            const newRange = document.createRange();
            newRange.selectNodeContents(prevRef);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
            setActivePageIndex(pageIndex - 1);
            // Scroll into view
            prevRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        // Backspace at start merges with previous page
        if (e.key === "Backspace" && isAtStart && pageIndex > 0) {
          // Let default behavior handle content deletion, then repaginate
          return;
        }

        // Navigate to next page - only if we're at end AND there IS a next page
        if (
          (e.key === "ArrowDown" || e.key === "ArrowRight") &&
          isAtEnd &&
          pageIndex < pages.length - 1
        ) {
          e.preventDefault();
          const nextRef = pageRefs.current.get(pages[pageIndex + 1]?.id);
          if (nextRef) {
            nextRef.focus();
            // Move to start
            const newRange = document.createRange();
            newRange.selectNodeContents(nextRef);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            setActivePageIndex(pageIndex + 1);
            // Scroll into view
            nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        // Handle Tab key for indentation - insert 4 spaces
        if (e.key === "Tab") {
          e.preventDefault();
          document.execCommand("insertHTML", false, "\u00A0\u00A0\u00A0\u00A0"); // 4 non-breaking spaces
          return;
        }

        // Handle Cmd/Ctrl+A to select all text across all pages
        const isMacCheck = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const hasModifier = isMacCheck ? e.metaKey : e.ctrlKey;

        if (hasModifier && e.key === "a") {
          e.preventDefault();

          // Get all page content elements
          const allPageRefs = Array.from(pageRefs.current.values());
          if (allPageRefs.length === 0) return;

          // Create a range that spans all pages
          const range = document.createRange();
          const firstPage = allPageRefs[0];
          const lastPage = allPageRefs[allPageRefs.length - 1];

          // Set range from start of first page to end of last page
          range.setStart(firstPage, 0);
          range.setEnd(lastPage, lastPage.childNodes.length);

          // Apply the selection
          selection.removeAllRanges();
          selection.addRange(range);

          return;
        }

        // Pass any other keys with modifiers to external handler
        if (hasModifier && onExternalKeyDown) {
          onExternalKeyDown(e);
        }
      },
      [pages, onExternalKeyDown]
    );

    const clearSampleField = useCallback(
      (cfField: HTMLElement | null, shouldPreventDefault?: boolean) => {
        if (!cfField) return false;

        if (cfField.hasAttribute("data-sample")) {
          // Store a way to find this field after re-render
          // Use id if available, otherwise use a temporary marker
          const fieldId = cfField.id;
          const tempMarkerId = `temp-focus-marker-${Date.now()}`;
          if (!fieldId) {
            cfField.setAttribute("data-temp-focus", tempMarkerId);
          }

          // Field has sample data - clear it
          cfField.textContent = "";
          cfField.removeAttribute("data-sample");

          // Don't call handleInput() here - just update pages state directly
          // to avoid repagination which would lose cursor position
          setPages((prevPages) => {
            return prevPages.map((page) => {
              const ref = pageRefs.current.get(page.id);
              if (ref) {
                return { ...page, content: ref.innerHTML };
              }
              return page;
            });
          });

          // Focus and place cursor - use setTimeout to ensure DOM is ready after React re-render
          setTimeout(() => {
            // Re-find the element after React re-render
            let targetField: HTMLElement | null = null;
            if (fieldId) {
              targetField = document.getElementById(fieldId);
            } else {
              targetField = document.querySelector(
                `[data-temp-focus="${tempMarkerId}"]`
              );
              targetField?.removeAttribute("data-temp-focus");
            }

            if (targetField && document.body.contains(targetField)) {
              targetField.focus();
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(targetField);
              range.collapse(true);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 50);

          return true; // Indicate we handled it
        }
        return false; // Indicate we didn't handle it
      },
      []
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault();

        // Get plain text or HTML
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Insert content
        if (html) {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const frag = document.createDocumentFragment();
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }
          range.insertNode(frag);
        } else if (text) {
          // Convert plain text to paragraphs
          const paragraphs = text.split(/\n\n+/);
          const frag = document.createDocumentFragment();
          paragraphs.forEach((para) => {
            const p = document.createElement("p");
            p.textContent = para;
            frag.appendChild(p);
          });
          range.insertNode(frag);
        }

        // Trigger repagination
        handleInput();
      },
      [handleInput]
    );

    // ========================================================================
    // Imperative Handle
    // ========================================================================

    useImperativeHandle(
      ref,
      () => ({
        getContent: () => collectAllContent(),
        setContent: (html: string) => {
          // Ensure the measure div is ready before repaginating
          if (!measureRef.current) {
            // If measure div isn't ready, wait for next frame
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                repaginate(html, false);
              });
            });
          } else {
            repaginate(html, false);
          }
        },
        focus: () => {
          // Focus the active page, or the first page if no active page
          const activePageId = pages[activePageIndex]?.id || pages[0]?.id;
          const targetPage = pageRefs.current.get(activePageId);
          if (targetPage) {
            targetPage.focus();
          }
        },
        getPageCount: () => pages.length,
        goToPage: (pageIndex: number) => {
          const pageRef = pageRefs.current.get(pages[pageIndex]?.id);
          if (pageRef) {
            pageRef.focus();
            setActivePageIndex(pageIndex);
            pageRef.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        },
        scrollToTop: () => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        execCommand: (command: string, value?: string) => {
          // For insertHTML, use the correct signature
          if (command === "insertHTML" && value) {
            document.execCommand(command, false, value);
          } else {
            document.execCommand(command, false, value);
          }
          // Trigger repagination after formatting
          setTimeout(() => {
            const fullHtml = collectAllContent();
            onChange?.({
              html: fullHtml,
              text: fullHtml.replace(/<[^>]*>/g, ""),
            });
            repaginate(fullHtml, true);
          }, 0);
        },
        getPageContentElements: () => {
          const elements: HTMLDivElement[] = [];
          pages.forEach((page) => {
            const ref = pageRefs.current.get(page.id);
            if (ref) elements.push(ref);
          });
          return elements;
        },
        getScrollContainer: () => scrollContainerRef.current,
        getPagesContainer: () => pagesContainerRef.current,
        setSkipNextRepagination: (skip: boolean) => {
          // When skip is true, set a 100ms window to skip repagination
          // When skip is false, clear the window immediately
          skipUntilRef.current = skip ? Date.now() + 100 : 0;
        },
        insertAtCursor: (html: string) => {
          // Focus the active page first
          const activePageId = pages[activePageIndex]?.id || pages[0]?.id;
          const targetPage = pageRefs.current.get(activePageId);
          if (targetPage) {
            targetPage.focus();
          }

          // Get current selection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // Check if we're inside one of our page elements
            const container = range.commonAncestorContainer;
            const isInEditor = Array.from(pageRefs.current.values()).some(
              (pageEl) => pageEl && pageEl.contains(container)
            );

            if (isInEditor) {
              // Delete any selected content and insert new HTML
              range.deleteContents();
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = html;
              const fragment = document.createDocumentFragment();
              let lastNode: Node | null = null;
              while (tempDiv.firstChild) {
                lastNode = fragment.appendChild(tempDiv.firstChild);
              }
              range.insertNode(fragment);

              // Move cursor to end of inserted content
              if (lastNode) {
                range.setStartAfter(lastNode);
                range.setEndAfter(lastNode);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            } else {
              // Not in editor - append to end of last page
              const lastPageEl = pageRefs.current.get(
                pages[pages.length - 1]?.id
              );
              if (lastPageEl) {
                lastPageEl.innerHTML += html;
              }
            }
          } else {
            // No selection - append to end of last page
            const lastPageEl = pageRefs.current.get(
              pages[pages.length - 1]?.id
            );
            if (lastPageEl) {
              lastPageEl.innerHTML += html;
            }
          }

          // Trigger repagination
          setTimeout(() => {
            const fullHtml = collectAllContent();
            onChange?.({
              html: fullHtml,
              text: fullHtml.replace(/<[^>]*>/g, ""),
            });
            repaginate(fullHtml, true);
          }, 0);
        },
      }),
      [collectAllContent, repaginate, pages, activePageIndex, onChange]
    );

    // ========================================================================
    // Ruler Drag Handling
    // ========================================================================

    const handleRulerDragStart = useCallback(
      (type: "left" | "right" | "indent", e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setRulerDragging(type);
      },
      []
    );

    useEffect(() => {
      if (!rulerDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!rulerContainerRef.current) return;

        const rect = rulerContainerRef.current.getBoundingClientRect();
        const relativeX = Math.max(0, e.clientX - rect.left);
        const maxWidth = Math.min(rect.width, pageWidthPx);
        const constrainedX = Math.max(0, Math.min(relativeX, maxWidth));

        if (rulerDragging === "left") {
          const newLeft = Math.max(0, Math.min(constrainedX, 200));
          onLeftMarginChange?.(newLeft);
        } else if (rulerDragging === "right") {
          const fromRight = maxWidth - constrainedX;
          onRightMarginChange?.(Math.max(0, Math.min(fromRight, 200)));
        } else if (rulerDragging === "indent") {
          const rawAbsolutePos = Math.max(
            marginLeft,
            Math.min(constrainedX, maxWidth - marginRight)
          );
          const relativeIndent = rawAbsolutePos - marginLeft;
          const snappedIndent = Math.round(relativeIndent / 24) * 24;
          const newIndent = Math.max(
            0,
            Math.min(snappedIndent, maxWidth - marginRight - marginLeft)
          );
          onFirstLineIndentChange?.(newIndent);
        }
      };

      const handleMouseUp = () => {
        setRulerDragging(null);
      };

      document.addEventListener("mousemove", handleMouseMove, true);
      document.addEventListener("mouseup", handleMouseUp, true);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove, true);
        document.removeEventListener("mouseup", handleMouseUp, true);
      };
    }, [
      rulerDragging,
      marginLeft,
      marginRight,
      pageWidthPx,
      onLeftMarginChange,
      onRightMarginChange,
      onFirstLineIndentChange,
    ]);

    // ========================================================================
    // Cross-Page Selection Handling
    // ========================================================================

    // Handle mouse down to start potential cross-page selection
    const handleCrossPageMouseDown = useCallback(
      (e: React.MouseEvent, pageIndex: number) => {
        // Only track for left mouse button
        if (e.button !== 0) return;

        const selection = window.getSelection();
        if (!selection) return;

        // Record the starting point for potential cross-page selection
        const range = selection.getRangeAt(0);
        crossPageSelectionRef.current = {
          isSelecting: true,
          startPageIndex: pageIndex,
          startNode: range.startContainer,
          startOffset: range.startOffset,
        };
      },
      []
    );

    // Handle mouse up to finalize cross-page selection
    const handleCrossPageMouseUp = useCallback(
      (e: React.MouseEvent, pageIndex: number) => {
        const crossPageState = crossPageSelectionRef.current;

        if (
          !crossPageState.isSelecting ||
          crossPageState.startPageIndex === pageIndex
        ) {
          // Not a cross-page selection, let browser handle it
          crossPageSelectionRef.current.isSelecting = false;
          return;
        }

        // This is a cross-page selection - need to handle it specially
        const startPageIdx = crossPageState.startPageIndex;
        const endPageIdx = pageIndex;

        // Ensure start < end for iteration
        const [firstIdx, lastIdx] =
          startPageIdx < endPageIdx
            ? [startPageIdx, endPageIdx]
            : [endPageIdx, startPageIdx];

        // For now, just ensure we can select within each page but highlight
        // the selected content across pages visually
        // True cross-page selection requires a different architecture
        // (single contentEditable with virtual pages)

        crossPageSelectionRef.current.isSelecting = false;
      },
      []
    );

    // ========================================================================
    // Initialization
    // ========================================================================

    useEffect(() => {
      if (initialContent) {
        repaginate(initialContent, false);
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Focus first page on mount
    useEffect(() => {
      const timer = setTimeout(() => {
        const firstPage = pageRefs.current.get(1);
        if (firstPage && isEditable) {
          firstPage.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [isEditable]);

    // ========================================================================
    // Render
    // ========================================================================

    // Get line height from documentStyles if available, otherwise use prop
    const effectiveLineHeight =
      documentStyles?.paragraph?.lineHeight ?? lineHeight;

    // Styles for page content
    // NOTE: text-indent is handled via CSS selectors to allow .paragraph-continuation override
    const contentStyle: React.CSSProperties = {
      position: "absolute",
      top: `${marginTop}px`,
      left: `${marginLeft}px`,
      width: `${contentWidth}px`,
      height: `${contentHeight}px`,
      overflow: "hidden",
      outline: "none",
      fontSize: `${fontSize}px`,
      lineHeight: effectiveLineHeight,
      fontFamily: fontFamily,
      color: "#333",
      // Don't set textIndent here - it's applied via CSS to allow .paragraph-continuation override
    };

    return (
      <div
        className="paginated-editor-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#eddcc5", // Match writer-stage tan background
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden", // Don't scroll the outer container
        }}
      >
        {/* Inline styles for first-line indent and document styles */}
        <style
          key={`indent-style-${firstLineIndent}-${JSON.stringify(
            documentStyles || {}
          )}-${effectiveLineHeight}`}
        >
          {`
            .paginated-page-content {
              line-height: ${effectiveLineHeight} !important;
            }
            .paginated-page-content * {
              line-height: ${effectiveLineHeight} !important;
            }
            .paginated-page-content p:not(.paragraph-continuation),
            .paginated-page-content div:not(.page-break):not(.paragraph-continuation) {
              text-indent: ${firstLineIndent}px !important;
              margin-bottom: 0;
              margin-top: 0;
              line-height: ${effectiveLineHeight} !important;
            }
            /* Paragraph continuation - no first-line indent on continued paragraphs */
            .paginated-page-content p.paragraph-continuation,
            .paginated-page-content div.paragraph-continuation,
            p.paragraph-continuation,
            div.paragraph-continuation,
            .paragraph-continuation {
              text-indent: 0px !important;
            }
            /* List styles - proper hanging indent so wrapped text aligns with first line */
            .paginated-page-content ul,
            .paginated-page-content ol {
              text-indent: 0 !important;
              margin-left: 0;
              padding-left: 2.5em;
              margin-bottom: 0;
              margin-top: 0;
              list-style-position: outside;
            }
            .paginated-page-content ul {
              list-style-type: disc !important;
            }
            .paginated-page-content ol {
              list-style-type: decimal !important;
            }
            .paginated-page-content li {
              text-indent: 0 !important;
              margin-bottom: 0;
              padding-left: 0;
              display: list-item !important;
            }
            /* Centered lists - use inside bullets so they center with text */
            .paginated-page-content ul[style*="text-align: center"],
            .paginated-page-content ol[style*="text-align: center"],
            .paginated-page-content ul[style*="text-align:center"],
            .paginated-page-content ol[style*="text-align:center"],
            .paginated-page-content ul[align="center"],
            .paginated-page-content ol[align="center"],
            .paginated-page-content [style*="text-align: center"] ul,
            .paginated-page-content [style*="text-align:center"] ul,
            .paginated-page-content [align="center"] ul,
            .paginated-page-content div[align="center"] ul,
            .paginated-page-content [style*="text-align: center"] ol,
            .paginated-page-content [style*="text-align:center"] ol,
            .paginated-page-content [align="center"] ol,
            .paginated-page-content div[align="center"] ol {
              list-style-position: inside !important;
              margin-left: 0 !important;
              padding-left: 0 !important;
              text-align: center !important;
            }
            .paginated-page-content ul[style*="text-align: center"] li,
            .paginated-page-content ol[style*="text-align: center"] li,
            .paginated-page-content ul[style*="text-align:center"] li,
            .paginated-page-content ol[style*="text-align:center"] li,
            .paginated-page-content ul[align="center"] li,
            .paginated-page-content ol[align="center"] li,
            .paginated-page-content [style*="text-align: center"] li,
            .paginated-page-content [style*="text-align:center"] li,
            .paginated-page-content [align="center"] li,
            .paginated-page-content div[align="center"] li {
              text-align: center !important;
            }
            /* Right-aligned lists */
            .paginated-page-content ul[style*="text-align: right"],
            .paginated-page-content ol[style*="text-align: right"],
            .paginated-page-content ul[style*="text-align:right"],
            .paginated-page-content ol[style*="text-align:right"],
            .paginated-page-content ul[align="right"],
            .paginated-page-content ol[align="right"],
            .paginated-page-content [style*="text-align: right"] ul,
            .paginated-page-content [style*="text-align:right"] ul,
            .paginated-page-content [align="right"] ul,
            .paginated-page-content div[align="right"] ul,
            .paginated-page-content [style*="text-align: right"] ol,
            .paginated-page-content [style*="text-align:right"] ol,
            .paginated-page-content [align="right"] ol,
            .paginated-page-content div[align="right"] ol {
              list-style-position: inside !important;
              margin-left: 0 !important;
              padding-left: 0 !important;
              text-align: right !important;
            }
            .paginated-page-content [style*="text-align: right"] li,
            .paginated-page-content [style*="text-align:right"] li,
            .paginated-page-content [align="right"] li,
            .paginated-page-content div[align="right"] li {
              text-align: right !important;
            }
            /* Don't apply text-indent to centered or right-aligned text */
            .paginated-page-content p[style*="text-align: center"],
            .paginated-page-content div[style*="text-align: center"],
            .paginated-page-content p[style*="text-align:center"],
            .paginated-page-content div[style*="text-align:center"],
            .paginated-page-content p[align="center"],
            .paginated-page-content div[align="center"],
            .paginated-page-content [style*="text-align: center"] p,
            .paginated-page-content [style*="text-align: center"] div,
            .paginated-page-content p[style*="text-align: right"],
            .paginated-page-content div[style*="text-align: right"],
            .paginated-page-content p[style*="text-align:right"],
            .paginated-page-content div[style*="text-align:right"],
            .paginated-page-content p[align="right"],
            .paginated-page-content div[align="right"] {
              text-indent: 0 !important;
            }
            .paginated-page-content:focus {
              outline: none;
            }
            /* Book Title styles */
            ${
              documentStyles?.["book-title"]?.color
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { color: ${documentStyles["book-title"].color} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.backgroundColor
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { background-color: ${documentStyles["book-title"].backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.fontSize
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { font-size: ${documentStyles["book-title"].fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.fontFamily
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { font-family: ${documentStyles["book-title"].fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.fontWeight
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { font-weight: ${documentStyles["book-title"].fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.fontStyle
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { font-style: ${documentStyles["book-title"].fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.textAlign
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { text-align: ${documentStyles["book-title"].textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.marginTop
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { margin-top: ${documentStyles["book-title"].marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.marginBottom
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { margin-bottom: ${documentStyles["book-title"].marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.lineHeight
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { line-height: ${documentStyles["book-title"].lineHeight} !important; }`
                : ""
            }
            /* Book title and doc-title must have text-indent: 0 to center properly with ruler margins */
            .paginated-page-content .book-title,
            .paginated-page-content .doc-title,
            .paginated-page-content h1.book-title,
            .paginated-page-content h1.doc-title,
            .paginated-page-content p.book-title,
            .paginated-page-content p.doc-title {
              text-indent: 0 !important;
            }
            /* Chapter Heading styles */
            ${
              documentStyles?.["chapter-heading"]?.color
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { color: ${documentStyles["chapter-heading"].color} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.backgroundColor
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { background-color: ${documentStyles["chapter-heading"].backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.fontSize
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { font-size: ${documentStyles["chapter-heading"].fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.fontFamily
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { font-family: ${documentStyles["chapter-heading"].fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.fontWeight
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { font-weight: ${documentStyles["chapter-heading"].fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.fontStyle
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { font-style: ${documentStyles["chapter-heading"].fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.textAlign
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { text-align: ${documentStyles["chapter-heading"].textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.marginTop
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { margin-top: ${documentStyles["chapter-heading"].marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.marginBottom
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { margin-bottom: ${documentStyles["chapter-heading"].marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.lineHeight
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { line-height: ${documentStyles["chapter-heading"].lineHeight} !important; }`
                : ""
            }
            /* Chapter heading must have text-indent: 0 to center properly with ruler margins */
            .paginated-page-content .chapter-heading,
            .paginated-page-content h1.chapter-heading,
            .paginated-page-content p.chapter-heading {
              text-indent: 0 !important;
            }
            /* Subtitle styles */
            ${
              documentStyles?.subtitle?.color
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { color: ${documentStyles.subtitle.color} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.backgroundColor
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { background-color: ${documentStyles.subtitle.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.fontSize
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { font-size: ${documentStyles.subtitle.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.fontFamily
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { font-family: ${documentStyles.subtitle.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.fontWeight
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { font-weight: ${documentStyles.subtitle.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.fontStyle
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { font-style: ${documentStyles.subtitle.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.textAlign
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { text-align: ${documentStyles.subtitle.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.marginTop
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { margin-top: ${documentStyles.subtitle.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.marginBottom
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { margin-bottom: ${documentStyles.subtitle.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.lineHeight
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { line-height: ${documentStyles.subtitle.lineHeight} !important; }`
                : ""
            }
            /* Subtitle must have text-indent: 0 to center properly with ruler margins */
            .paginated-page-content .subtitle,
            .paginated-page-content .doc-subtitle,
            .paginated-page-content p.subtitle,
            .paginated-page-content p.doc-subtitle {
              text-indent: 0 !important;
            }
            /* Paragraph styles */
            ${
              documentStyles?.paragraph?.color
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { color: ${documentStyles.paragraph.color} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.backgroundColor
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { background-color: ${documentStyles.paragraph.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.fontSize
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { font-size: ${documentStyles.paragraph.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.fontFamily
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { font-family: ${documentStyles.paragraph.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.fontWeight
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { font-weight: ${documentStyles.paragraph.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.fontStyle
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { font-style: ${documentStyles.paragraph.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.textAlign
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote):not([style*="text-align"]) { text-align: ${documentStyles.paragraph.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.marginTop
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { margin-top: ${documentStyles.paragraph.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.marginBottom
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { margin-bottom: ${documentStyles.paragraph.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.lineHeight
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote):not(.lead-paragraph):not(.pullquote) { line-height: ${documentStyles.paragraph.lineHeight} !important; }`
                : ""
            }
            /* Heading 1 styles */
            ${
              documentStyles?.heading1?.color
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { color: ${documentStyles.heading1.color} !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.backgroundColor
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { background-color: ${documentStyles.heading1.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.fontSize
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { font-size: ${documentStyles.heading1.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.fontFamily
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { font-family: ${documentStyles.heading1.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.fontWeight
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { font-weight: ${documentStyles.heading1.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.fontStyle
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { font-style: ${documentStyles.heading1.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.textAlign
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { text-align: ${documentStyles.heading1.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.marginTop
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { margin-top: ${documentStyles.heading1.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.marginBottom
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { margin-bottom: ${documentStyles.heading1.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading1?.lineHeight
                ? `.paginated-page-content h1:not(.chapter-heading):not(.doc-title):not(.book-title) { line-height: ${documentStyles.heading1.lineHeight} !important; }`
                : ""
            }
            /* Heading 2 styles */
            ${
              documentStyles?.heading2?.color
                ? `.paginated-page-content h2 { color: ${documentStyles.heading2.color} !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.backgroundColor
                ? `.paginated-page-content h2 { background-color: ${documentStyles.heading2.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.fontSize
                ? `.paginated-page-content h2 { font-size: ${documentStyles.heading2.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.fontFamily
                ? `.paginated-page-content h2 { font-family: ${documentStyles.heading2.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.fontWeight
                ? `.paginated-page-content h2 { font-weight: ${documentStyles.heading2.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.fontStyle
                ? `.paginated-page-content h2 { font-style: ${documentStyles.heading2.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.textAlign
                ? `.paginated-page-content h2 { text-align: ${documentStyles.heading2.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.marginTop
                ? `.paginated-page-content h2 { margin-top: ${documentStyles.heading2.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.marginBottom
                ? `.paginated-page-content h2 { margin-bottom: ${documentStyles.heading2.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading2?.lineHeight
                ? `.paginated-page-content h2 { line-height: ${documentStyles.heading2.lineHeight} !important; }`
                : ""
            }
            /* Heading 3 styles */
            ${
              documentStyles?.heading3?.color
                ? `.paginated-page-content h3 { color: ${documentStyles.heading3.color} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.backgroundColor
                ? `.paginated-page-content h3 { background-color: ${documentStyles.heading3.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontSize
                ? `.paginated-page-content h3 { font-size: ${documentStyles.heading3.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontFamily
                ? `.paginated-page-content h3 { font-family: ${documentStyles.heading3.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontWeight
                ? `.paginated-page-content h3 { font-weight: ${documentStyles.heading3.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontStyle
                ? `.paginated-page-content h3 { font-style: ${documentStyles.heading3.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.textAlign
                ? `.paginated-page-content h3 { text-align: ${documentStyles.heading3.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginTop
                ? `.paginated-page-content h3 { margin-top: ${documentStyles.heading3.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginBottom
                ? `.paginated-page-content h3 { margin-bottom: ${documentStyles.heading3.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.lineHeight
                ? `.paginated-page-content h3 { line-height: ${documentStyles.heading3.lineHeight} !important; }`
                : ""
            }
            /* Blockquote styles */
            ${
              documentStyles?.blockquote?.color
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { color: ${documentStyles.blockquote.color} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.backgroundColor
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { background-color: ${documentStyles.blockquote.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.fontSize
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { font-size: ${documentStyles.blockquote.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.fontFamily
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { font-family: ${documentStyles.blockquote.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.fontWeight
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { font-weight: ${documentStyles.blockquote.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.fontStyle
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { font-style: ${documentStyles.blockquote.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.textAlign
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { text-align: ${documentStyles.blockquote.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.marginTop
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { margin-top: ${documentStyles.blockquote.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.marginBottom
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { margin-bottom: ${documentStyles.blockquote.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.marginLeft
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { margin-left: ${documentStyles.blockquote.marginLeft}px !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.marginRight
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { margin-right: ${documentStyles.blockquote.marginRight}px !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.borderLeftWidth
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { border-left-width: ${documentStyles.blockquote.borderLeftWidth}px !important; border-left-style: solid !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.borderLeftColor
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { border-left-color: ${documentStyles.blockquote.borderLeftColor} !important; }`
                : ""
            }
            ${
              documentStyles?.blockquote?.lineHeight
                ? `.paginated-page-content blockquote, .paginated-page-content .quote, .paginated-page-content .intense-quote { line-height: ${documentStyles.blockquote.lineHeight} !important; }`
                : ""
            }
            /* Lead Paragraph styles */
            ${
              documentStyles?.["lead-paragraph"]?.color
                ? `.paginated-page-content .lead-paragraph { color: ${documentStyles["lead-paragraph"].color} !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.backgroundColor
                ? `.paginated-page-content .lead-paragraph { background-color: ${documentStyles["lead-paragraph"].backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.fontSize
                ? `.paginated-page-content .lead-paragraph { font-size: ${documentStyles["lead-paragraph"].fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.fontFamily
                ? `.paginated-page-content .lead-paragraph { font-family: ${documentStyles["lead-paragraph"].fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.fontWeight
                ? `.paginated-page-content .lead-paragraph { font-weight: ${documentStyles["lead-paragraph"].fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.fontStyle
                ? `.paginated-page-content .lead-paragraph { font-style: ${documentStyles["lead-paragraph"].fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.textAlign
                ? `.paginated-page-content .lead-paragraph { text-align: ${documentStyles["lead-paragraph"].textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.["lead-paragraph"]?.lineHeight
                ? `.paginated-page-content .lead-paragraph { line-height: ${documentStyles["lead-paragraph"].lineHeight} !important; }`
                : ""
            }
            /* Pullquote styles */
            ${
              documentStyles?.pullquote?.color
                ? `.paginated-page-content .pullquote { color: ${documentStyles.pullquote.color} !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.backgroundColor
                ? `.paginated-page-content .pullquote { background-color: ${documentStyles.pullquote.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.fontSize
                ? `.paginated-page-content .pullquote { font-size: ${documentStyles.pullquote.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.fontFamily
                ? `.paginated-page-content .pullquote { font-family: ${documentStyles.pullquote.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.fontWeight
                ? `.paginated-page-content .pullquote { font-weight: ${documentStyles.pullquote.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.fontStyle
                ? `.paginated-page-content .pullquote { font-style: ${documentStyles.pullquote.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.textAlign
                ? `.paginated-page-content .pullquote { text-align: ${documentStyles.pullquote.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.pullquote?.lineHeight
                ? `.paginated-page-content .pullquote { line-height: ${documentStyles.pullquote.lineHeight} !important; }`
                : ""
            }
            /* Heading 4 styles */
            ${
              documentStyles?.heading3?.color
                ? `.paginated-page-content h4 { color: ${documentStyles.heading3.color} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.backgroundColor
                ? `.paginated-page-content h4 { background-color: ${documentStyles.heading3.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontSize
                ? `.paginated-page-content h4 { font-size: ${Math.max(
                    10,
                    (documentStyles.heading3.fontSize || 14) - 2
                  )}pt !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontFamily
                ? `.paginated-page-content h4 { font-family: ${documentStyles.heading3.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontWeight
                ? `.paginated-page-content h4 { font-weight: ${documentStyles.heading3.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontStyle
                ? `.paginated-page-content h4 { font-style: ${documentStyles.heading3.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.textAlign
                ? `.paginated-page-content h4 { text-align: ${documentStyles.heading3.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginTop
                ? `.paginated-page-content h4 { margin-top: ${documentStyles.heading3.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginBottom
                ? `.paginated-page-content h4 { margin-bottom: ${documentStyles.heading3.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.lineHeight
                ? `.paginated-page-content h4 { line-height: ${documentStyles.heading3.lineHeight} !important; }`
                : ""
            }
            /* Heading 5 styles */
            ${
              documentStyles?.heading3?.color
                ? `.paginated-page-content h5 { color: ${documentStyles.heading3.color} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.backgroundColor
                ? `.paginated-page-content h5 { background-color: ${documentStyles.heading3.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontSize
                ? `.paginated-page-content h5 { font-size: ${Math.max(
                    10,
                    (documentStyles.heading3.fontSize || 14) - 3
                  )}pt !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontFamily
                ? `.paginated-page-content h5 { font-family: ${documentStyles.heading3.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontWeight
                ? `.paginated-page-content h5 { font-weight: ${documentStyles.heading3.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontStyle
                ? `.paginated-page-content h5 { font-style: ${documentStyles.heading3.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.textAlign
                ? `.paginated-page-content h5 { text-align: ${documentStyles.heading3.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginTop
                ? `.paginated-page-content h5 { margin-top: ${documentStyles.heading3.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginBottom
                ? `.paginated-page-content h5 { margin-bottom: ${documentStyles.heading3.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.lineHeight
                ? `.paginated-page-content h5 { line-height: ${documentStyles.heading3.lineHeight} !important; }`
                : ""
            }
            /* Heading 6 styles */
            ${
              documentStyles?.heading3?.color
                ? `.paginated-page-content h6 { color: ${documentStyles.heading3.color} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.backgroundColor
                ? `.paginated-page-content h6 { background-color: ${documentStyles.heading3.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontSize
                ? `.paginated-page-content h6 { font-size: ${Math.max(
                    10,
                    (documentStyles.heading3.fontSize || 14) - 4
                  )}pt !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontFamily
                ? `.paginated-page-content h6 { font-family: ${documentStyles.heading3.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontWeight
                ? `.paginated-page-content h6 { font-weight: ${documentStyles.heading3.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.fontStyle
                ? `.paginated-page-content h6 { font-style: ${documentStyles.heading3.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.textAlign
                ? `.paginated-page-content h6 { text-align: ${documentStyles.heading3.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginTop
                ? `.paginated-page-content h6 { margin-top: ${documentStyles.heading3.marginTop}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.marginBottom
                ? `.paginated-page-content h6 { margin-bottom: ${documentStyles.heading3.marginBottom}em !important; }`
                : ""
            }
            ${
              documentStyles?.heading3?.lineHeight
                ? `.paginated-page-content h6 { line-height: ${documentStyles.heading3.lineHeight} !important; }`
                : ""
            }
            /* Caption styles */
            ${
              documentStyles?.caption?.color
                ? `.paginated-page-content .caption { color: ${documentStyles.caption.color} !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.backgroundColor
                ? `.paginated-page-content .caption { background-color: ${documentStyles.caption.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.fontSize
                ? `.paginated-page-content .caption { font-size: ${documentStyles.caption.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.fontFamily
                ? `.paginated-page-content .caption { font-family: ${documentStyles.caption.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.fontWeight
                ? `.paginated-page-content .caption { font-weight: ${documentStyles.caption.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.fontStyle
                ? `.paginated-page-content .caption { font-style: ${documentStyles.caption.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.textAlign
                ? `.paginated-page-content .caption { text-align: ${documentStyles.caption.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.caption?.lineHeight
                ? `.paginated-page-content .caption { line-height: ${documentStyles.caption.lineHeight} !important; }`
                : ""
            }
            /* Abstract styles */
            ${
              documentStyles?.abstract?.color
                ? `.paginated-page-content .abstract { color: ${documentStyles.abstract.color} !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.backgroundColor
                ? `.paginated-page-content .abstract { background-color: ${documentStyles.abstract.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.fontSize
                ? `.paginated-page-content .abstract { font-size: ${documentStyles.abstract.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.fontFamily
                ? `.paginated-page-content .abstract { font-family: ${documentStyles.abstract.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.fontWeight
                ? `.paginated-page-content .abstract { font-weight: ${documentStyles.abstract.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.fontStyle
                ? `.paginated-page-content .abstract { font-style: ${documentStyles.abstract.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.textAlign
                ? `.paginated-page-content .abstract { text-align: ${documentStyles.abstract.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.abstract?.lineHeight
                ? `.paginated-page-content .abstract { line-height: ${documentStyles.abstract.lineHeight} !important; }`
                : ""
            }
            /* Epigraph styles */
            ${
              documentStyles?.epigraph?.color
                ? `.paginated-page-content .epigraph { color: ${documentStyles.epigraph.color} !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.backgroundColor
                ? `.paginated-page-content .epigraph { background-color: ${documentStyles.epigraph.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.fontSize
                ? `.paginated-page-content .epigraph { font-size: ${documentStyles.epigraph.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.fontFamily
                ? `.paginated-page-content .epigraph { font-family: ${documentStyles.epigraph.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.fontWeight
                ? `.paginated-page-content .epigraph { font-weight: ${documentStyles.epigraph.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.fontStyle
                ? `.paginated-page-content .epigraph { font-style: ${documentStyles.epigraph.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.textAlign
                ? `.paginated-page-content .epigraph { text-align: ${documentStyles.epigraph.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.epigraph?.lineHeight
                ? `.paginated-page-content .epigraph { line-height: ${documentStyles.epigraph.lineHeight} !important; }`
                : ""
            }
            /* Dedication styles */
            ${
              documentStyles?.dedication?.color
                ? `.paginated-page-content .dedication { color: ${documentStyles.dedication.color} !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.backgroundColor
                ? `.paginated-page-content .dedication { background-color: ${documentStyles.dedication.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.fontSize
                ? `.paginated-page-content .dedication { font-size: ${documentStyles.dedication.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.fontFamily
                ? `.paginated-page-content .dedication { font-family: ${documentStyles.dedication.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.fontWeight
                ? `.paginated-page-content .dedication { font-weight: ${documentStyles.dedication.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.fontStyle
                ? `.paginated-page-content .dedication { font-style: ${documentStyles.dedication.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.textAlign
                ? `.paginated-page-content .dedication { text-align: ${documentStyles.dedication.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.dedication?.lineHeight
                ? `.paginated-page-content .dedication { line-height: ${documentStyles.dedication.lineHeight} !important; }`
                : ""
            }
            /* Verse styles */
            ${
              documentStyles?.verse?.color
                ? `.paginated-page-content .verse { color: ${documentStyles.verse.color} !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.backgroundColor
                ? `.paginated-page-content .verse { background-color: ${documentStyles.verse.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.fontSize
                ? `.paginated-page-content .verse { font-size: ${documentStyles.verse.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.fontFamily
                ? `.paginated-page-content .verse { font-family: ${documentStyles.verse.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.fontWeight
                ? `.paginated-page-content .verse { font-weight: ${documentStyles.verse.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.fontStyle
                ? `.paginated-page-content .verse { font-style: ${documentStyles.verse.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.textAlign
                ? `.paginated-page-content .verse { text-align: ${documentStyles.verse.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.verse?.lineHeight
                ? `.paginated-page-content .verse { line-height: ${documentStyles.verse.lineHeight} !important; }`
                : ""
            }
            /* Sidebar styles */
            ${
              documentStyles?.sidebar?.color
                ? `.paginated-page-content .sidebar { color: ${documentStyles.sidebar.color} !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.backgroundColor
                ? `.paginated-page-content .sidebar { background-color: ${documentStyles.sidebar.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.fontSize
                ? `.paginated-page-content .sidebar { font-size: ${documentStyles.sidebar.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.fontFamily
                ? `.paginated-page-content .sidebar { font-family: ${documentStyles.sidebar.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.fontWeight
                ? `.paginated-page-content .sidebar { font-weight: ${documentStyles.sidebar.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.fontStyle
                ? `.paginated-page-content .sidebar { font-style: ${documentStyles.sidebar.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.textAlign
                ? `.paginated-page-content .sidebar { text-align: ${documentStyles.sidebar.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.sidebar?.lineHeight
                ? `.paginated-page-content .sidebar { line-height: ${documentStyles.sidebar.lineHeight} !important; }`
                : ""
            }
            /* Callout styles */
            ${
              documentStyles?.callout?.color
                ? `.paginated-page-content .callout { color: ${documentStyles.callout.color} !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.backgroundColor
                ? `.paginated-page-content .callout { background-color: ${documentStyles.callout.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.fontSize
                ? `.paginated-page-content .callout { font-size: ${documentStyles.callout.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.fontFamily
                ? `.paginated-page-content .callout { font-family: ${documentStyles.callout.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.fontWeight
                ? `.paginated-page-content .callout { font-weight: ${documentStyles.callout.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.fontStyle
                ? `.paginated-page-content .callout { font-style: ${documentStyles.callout.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.textAlign
                ? `.paginated-page-content .callout { text-align: ${documentStyles.callout.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.callout?.lineHeight
                ? `.paginated-page-content .callout { line-height: ${documentStyles.callout.lineHeight} !important; }`
                : ""
            }
            /* Footnote styles */
            ${
              documentStyles?.footnote?.color
                ? `.paginated-page-content .footnote { color: ${documentStyles.footnote.color} !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.backgroundColor
                ? `.paginated-page-content .footnote { background-color: ${documentStyles.footnote.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.fontSize
                ? `.paginated-page-content .footnote { font-size: ${documentStyles.footnote.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.fontFamily
                ? `.paginated-page-content .footnote { font-family: ${documentStyles.footnote.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.fontWeight
                ? `.paginated-page-content .footnote { font-weight: ${documentStyles.footnote.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.fontStyle
                ? `.paginated-page-content .footnote { font-style: ${documentStyles.footnote.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.textAlign
                ? `.paginated-page-content .footnote { text-align: ${documentStyles.footnote.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.footnote?.lineHeight
                ? `.paginated-page-content .footnote { line-height: ${documentStyles.footnote.lineHeight} !important; }`
                : ""
            }
            /* Citation styles */
            ${
              documentStyles?.citation?.color
                ? `.paginated-page-content .citation { color: ${documentStyles.citation.color} !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.backgroundColor
                ? `.paginated-page-content .citation { background-color: ${documentStyles.citation.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.fontSize
                ? `.paginated-page-content .citation { font-size: ${documentStyles.citation.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.fontFamily
                ? `.paginated-page-content .citation { font-family: ${documentStyles.citation.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.fontWeight
                ? `.paginated-page-content .citation { font-weight: ${documentStyles.citation.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.fontStyle
                ? `.paginated-page-content .citation { font-style: ${documentStyles.citation.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.textAlign
                ? `.paginated-page-content .citation { text-align: ${documentStyles.citation.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.citation?.lineHeight
                ? `.paginated-page-content .citation { line-height: ${documentStyles.citation.lineHeight} !important; }`
                : ""
            }
            /* Bibliography styles */
            ${
              documentStyles?.bibliography?.color
                ? `.paginated-page-content .bibliography { color: ${documentStyles.bibliography.color} !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.backgroundColor
                ? `.paginated-page-content .bibliography { background-color: ${documentStyles.bibliography.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.fontSize
                ? `.paginated-page-content .bibliography { font-size: ${documentStyles.bibliography.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.fontFamily
                ? `.paginated-page-content .bibliography { font-family: ${documentStyles.bibliography.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.fontWeight
                ? `.paginated-page-content .bibliography { font-weight: ${documentStyles.bibliography.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.fontStyle
                ? `.paginated-page-content .bibliography { font-style: ${documentStyles.bibliography.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.textAlign
                ? `.paginated-page-content .bibliography { text-align: ${documentStyles.bibliography.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.bibliography?.lineHeight
                ? `.paginated-page-content .bibliography { line-height: ${documentStyles.bibliography.lineHeight} !important; }`
                : ""
            }
            /* Author Info styles */
            ${
              documentStyles?.["author-info"]?.color
                ? `.paginated-page-content .author-info { color: ${documentStyles["author-info"].color} !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.backgroundColor
                ? `.paginated-page-content .author-info { background-color: ${documentStyles["author-info"].backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.fontSize
                ? `.paginated-page-content .author-info { font-size: ${documentStyles["author-info"].fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.fontFamily
                ? `.paginated-page-content .author-info { font-family: ${documentStyles["author-info"].fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.fontWeight
                ? `.paginated-page-content .author-info { font-weight: ${documentStyles["author-info"].fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.fontStyle
                ? `.paginated-page-content .author-info { font-style: ${documentStyles["author-info"].fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.textAlign
                ? `.paginated-page-content .author-info { text-align: ${documentStyles["author-info"].textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.["author-info"]?.lineHeight
                ? `.paginated-page-content .author-info { line-height: ${documentStyles["author-info"].lineHeight} !important; }`
                : ""
            }
            /* Address styles */
            ${
              documentStyles?.address?.color
                ? `.paginated-page-content .address { color: ${documentStyles.address.color} !important; }`
                : ""
            }
            ${
              documentStyles?.address?.backgroundColor
                ? `.paginated-page-content .address { background-color: ${documentStyles.address.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.address?.fontSize
                ? `.paginated-page-content .address { font-size: ${documentStyles.address.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.address?.fontFamily
                ? `.paginated-page-content .address { font-family: ${documentStyles.address.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.address?.fontWeight
                ? `.paginated-page-content .address { font-weight: ${documentStyles.address.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.address?.fontStyle
                ? `.paginated-page-content .address { font-style: ${documentStyles.address.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.address?.textAlign
                ? `.paginated-page-content .address { text-align: ${documentStyles.address.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.address?.lineHeight
                ? `.paginated-page-content .address { line-height: ${documentStyles.address.lineHeight} !important; }`
                : ""
            }
            /* Salutation styles */
            ${
              documentStyles?.salutation?.color
                ? `.paginated-page-content .salutation { color: ${documentStyles.salutation.color} !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.backgroundColor
                ? `.paginated-page-content .salutation { background-color: ${documentStyles.salutation.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.fontSize
                ? `.paginated-page-content .salutation { font-size: ${documentStyles.salutation.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.fontFamily
                ? `.paginated-page-content .salutation { font-family: ${documentStyles.salutation.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.fontWeight
                ? `.paginated-page-content .salutation { font-weight: ${documentStyles.salutation.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.fontStyle
                ? `.paginated-page-content .salutation { font-style: ${documentStyles.salutation.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.textAlign
                ? `.paginated-page-content .salutation { text-align: ${documentStyles.salutation.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.salutation?.lineHeight
                ? `.paginated-page-content .salutation { line-height: ${documentStyles.salutation.lineHeight} !important; }`
                : ""
            }
            /* Closing styles */
            ${
              documentStyles?.closing?.color
                ? `.paginated-page-content .closing { color: ${documentStyles.closing.color} !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.backgroundColor
                ? `.paginated-page-content .closing { background-color: ${documentStyles.closing.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.fontSize
                ? `.paginated-page-content .closing { font-size: ${documentStyles.closing.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.fontFamily
                ? `.paginated-page-content .closing { font-family: ${documentStyles.closing.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.fontWeight
                ? `.paginated-page-content .closing { font-weight: ${documentStyles.closing.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.fontStyle
                ? `.paginated-page-content .closing { font-style: ${documentStyles.closing.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.textAlign
                ? `.paginated-page-content .closing { text-align: ${documentStyles.closing.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.closing?.lineHeight
                ? `.paginated-page-content .closing { line-height: ${documentStyles.closing.lineHeight} !important; }`
                : ""
            }
            /* Signature styles */
            ${
              documentStyles?.signature?.color
                ? `.paginated-page-content .signature { color: ${documentStyles.signature.color} !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.backgroundColor
                ? `.paginated-page-content .signature { background-color: ${documentStyles.signature.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.fontSize
                ? `.paginated-page-content .signature { font-size: ${documentStyles.signature.fontSize}pt !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.fontFamily
                ? `.paginated-page-content .signature { font-family: ${documentStyles.signature.fontFamily} !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.fontWeight
                ? `.paginated-page-content .signature { font-weight: ${documentStyles.signature.fontWeight} !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.fontStyle
                ? `.paginated-page-content .signature { font-style: ${documentStyles.signature.fontStyle} !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.textAlign
                ? `.paginated-page-content .signature { text-align: ${documentStyles.signature.textAlign} !important; }`
                : ""
            }
            ${
              documentStyles?.signature?.lineHeight
                ? `.paginated-page-content .signature { line-height: ${documentStyles.signature.lineHeight} !important; }`
                : ""
            }
            /* Image float styles - ensure text wraps around floated images */
            /* Include small outer margin to prevent border/outline clipping */
            .paginated-page-content img[style*="float: left"],
            .paginated-page-content img[style*="float:left"] {
              float: left !important;
              margin: 0 20px 10px 4px !important;
              shape-outside: margin-box;
              max-width: calc(50% - 4px) !important;
            }
            .paginated-page-content img[style*="float: right"],
            .paginated-page-content img[style*="float:right"] {
              float: right !important;
              margin: 0 4px 10px 20px !important;
              shape-outside: margin-box;
              max-width: calc(50% - 4px) !important;
            }
            /* Ensure paragraphs don't clear floats - they should wrap around images */
            .paginated-page-content p {
              overflow: visible !important;
              clear: none !important;
            }
            /* Add clearfix after content to contain floats */
            .paginated-page-content::after {
              content: "";
              display: table;
              clear: both;
            }
            /* Column container styles */
            .paginated-page-content .column-container {
              display: flex !important;
              gap: 20px;
              margin: 1rem 4px;
              page-break-inside: avoid;
              break-inside: avoid;
              box-sizing: border-box;
            }
            .paginated-page-content .column-content {
              flex: 1;
              min-width: 0;
              padding: 10px;
              border: 1px solid #e8dcc8;
              border-radius: 4px;
              background: white;
              min-height: 80px;
              box-sizing: border-box;
            }
            .paginated-page-content .column-content:focus {
              outline: 2px solid #8b6914;
              outline-offset: 2px;
            }
            .paginated-page-content .column-content img {
              max-width: 100%;
              height: auto;
            }
          `}
        </style>

        {/* Hidden measurement div */}
        <div
          ref={measureRef}
          className="paginated-page-content editor-content"
          aria-hidden="true"
          style={{
            position: "absolute",
            visibility: "hidden",
            width: `${contentWidth}px`,
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            fontFamily: fontFamily,
            textIndent: `${firstLineIndent}px`,
          }}
        />

        {/* Ruler - Fixed at top */}
        {showRuler && (
          <div
            style={{
              flexShrink: 0,
              zIndex: 20,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#eddcc5",
              paddingTop: "8px",
              paddingBottom: "0px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "relative",
                width: `${pageWidthPx}px`,
                height: "24px",
                display: "flex",
                alignItems: "flex-end",
                boxSizing: "border-box",
              }}
            >
              {/* Ruler background */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "#fffaf3",
                  borderRadius: "0",
                  border: "none",
                  borderBottom: "1px solid #e0c392",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <div
                ref={rulerContainerRef}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  userSelect: rulerDragging ? "none" : "auto",
                  cursor: rulerDragging ? "ew-resize" : "default",
                  zIndex: 1,
                }}
              >
                {/* Inch marks (0-8) */}
                {Array.from({ length: 9 }, (_, i) => i).map((inch) => (
                  <div
                    key={inch}
                    style={{
                      position: "absolute",
                      left: `${(inch / 8.5) * 100}%`,
                      bottom: 0,
                      width: "1px",
                      height: inch === 0 ? "16px" : "12px",
                      backgroundColor: inch === 0 ? "#b45309" : "#d97706",
                    }}
                  />
                ))}
                {/* Final half-inch mark at 8.5 */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: "1px",
                    height: "16px",
                    backgroundColor: "#b45309",
                  }}
                />
                {/* Half-inch marks */}
                {Array.from({ length: 8 }, (_, i) => i).map((i) => (
                  <div
                    key={`half-${i}`}
                    style={{
                      position: "absolute",
                      left: `${((i + 0.5) / 8.5) * 100}%`,
                      bottom: 0,
                      width: "1px",
                      height: "8px",
                      backgroundColor: "#f59e0b",
                    }}
                  />
                ))}
                {/* Inch labels (0-8) */}
                {Array.from({ length: 9 }, (_, i) => i).map((inch) => (
                  <div
                    key={`label-${inch}`}
                    style={{
                      position: "absolute",
                      left: `${(inch / 8.5) * 100}%`,
                      top: "0px",
                      transform:
                        inch === 0 ? "translateX(0)" : "translateX(-50%)",
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "#92400e",
                    }}
                  >
                    {inch}
                  </div>
                ))}
                {/* Left margin handle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${(marginLeft / pageWidthPx) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    backgroundColor: "#ef4444",
                    cursor: "ew-resize",
                    zIndex: 2,
                  }}
                  onMouseDown={(e) => handleRulerDragStart("left", e)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-2px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#ef4444",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                {/* Right margin handle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${
                      ((pageWidthPx - marginRight) / pageWidthPx) * 100
                    }%`,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    backgroundColor: "#ef4444",
                    cursor: "ew-resize",
                    zIndex: 2,
                  }}
                  onMouseDown={(e) => handleRulerDragStart("right", e)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-2px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#ef4444",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                {/* First line indent handle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${
                      ((marginLeft + firstLineIndent) / pageWidthPx) * 100
                    }%`,
                    top: "0",
                    transform: "translateX(-50%)",
                    cursor: "ew-resize",
                    zIndex: 3,
                    padding: "4px",
                  }}
                  onMouseDown={(e) => handleRulerDragStart("indent", e)}
                  title="First Line Indent"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ pointerEvents: "none" }}
                  >
                    <path d="M6 0L12 8H0L6 0Z" fill="#ef8432" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Pages Container */}
        <div
          ref={scrollContainerRef}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            onScroll?.(target.scrollTop);
          }}
          className="hide-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: showRuler ? "0px" : "24px",
            paddingBottom: "24px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            position: "relative",
          }}
        >
          {/* Headers and Footers Overlay - completely separate from contentEditable */}
          <div
            style={{
              position: "absolute",
              top: showRuler ? "0px" : "24px",
              left: 0,
              right: 0,
              pointerEvents: "none",
              zIndex: 100,
            }}
          >
            {pages.map((page, index) => (
              <div
                key={`overlay-${page.id}`}
                style={{
                  width: `${pageWidthPx}px`,
                  height: `${pageHeightPx}px`,
                  margin: "0 auto 24px auto",
                  position: "relative",
                }}
              >
                {headerText && (
                  <div
                    className="page-header-element"
                    style={{
                      position: "absolute",
                      top: `${marginTop / 3}px`,
                      left: `${marginLeft}px`,
                      right: `${marginRight}px`,
                      fontSize: "11px",
                      color: "#666",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{headerText}</span>
                    {showPageNumbers &&
                      pageNumberPosition === "header" &&
                      index > 0 && <span>{index + 1}</span>}
                  </div>
                )}
                <div
                  className="page-footer-element"
                  style={{
                    position: "absolute",
                    bottom: `${marginBottom / 3}px`,
                    left: `${marginLeft}px`,
                    right: `${marginRight}px`,
                    fontSize: "11px",
                    color: "#666",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{footerText}</span>
                  {showPageNumbers &&
                    pageNumberPosition === "footer" &&
                    index > 0 && <span>Page {index + 1}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pages */}
          <div
            ref={pagesContainerRef}
            className="paginated-pages-stack"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onInput={() => handleInput()}
            onKeyDown={(e) => {
              // Find which page the cursor is in
              const sel = window.getSelection();
              if (!sel || !sel.rangeCount) return;
              const range = sel.getRangeAt(0);
              const pageContent = range.startContainer.parentElement?.closest(
                ".paginated-page-content"
              );
              if (pageContent) {
                const pageElements = Array.from(
                  document.querySelectorAll(".paginated-page-content")
                );
                const pageIndex = pageElements.indexOf(pageContent as Element);
                if (pageIndex >= 0) {
                  handleKeyDown(e, pageIndex);
                }
              }
            }}
            onPaste={(e) => handlePaste(e)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              alignItems: "center",
              position: "relative",
              outline: "none",
            }}
          >
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="paginated-page"
                style={
                  {
                    width: `${pageWidthPx}px`,
                    height: `${pageHeightPx}px`,
                    backgroundColor: "#fef5e7",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    position: "relative",
                    overflow: "hidden",
                    // Performance optimization: skip rendering for off-screen pages
                    contentVisibility: "auto",
                    containIntrinsicSize: `${pageWidthPx}px ${pageHeightPx}px`,
                  } as React.CSSProperties
                }
              >
                {/* Content area */}
                <div
                  ref={(el) => {
                    if (el) {
                      pageRefs.current.set(page.id, el);
                    } else {
                      pageRefs.current.delete(page.id);
                    }
                  }}
                  className="paginated-page-content editor-content"
                  onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
                    internalChangeRef.current = true;
                    setActivePageIndex(index);
                    // Don't clear sample on focus - let mousedown handle it
                  }}
                  onMouseDown={(e) => {
                    // Handle sample text clearing on mousedown (before focus)
                    const target = e.target as HTMLElement;
                    const cfField = target.classList.contains("cf")
                      ? target
                      : (target.closest(".cf") as HTMLElement | null);

                    if (cfField?.hasAttribute("data-sample")) {
                      // Prevent default browser focus/selection behavior
                      e.preventDefault();
                      clearSampleField(cfField);
                    }
                  }}
                  onClick={(e) => {
                    // Handle button clicks for template actions (onclick attrs don't work in contentEditable)
                    const target = e.target as HTMLElement;

                    // Check if clicked element is a button or inside a button
                    const button =
                      target.tagName === "BUTTON"
                        ? target
                        : target.closest("button");
                    if (button) {
                      const onclickAttr = button.getAttribute("onclick");
                      if (onclickAttr) {
                        e.preventDefault();
                        e.stopPropagation();
                        // Parse and dispatch the event
                        if (onclickAttr.includes("saveCharacterTemplate")) {
                          window.dispatchEvent(
                            new CustomEvent("saveCharacterTemplate")
                          );
                        } else if (
                          onclickAttr.includes("addCharacterRelationship")
                        ) {
                          window.dispatchEvent(
                            new CustomEvent("addCharacterRelationship")
                          );
                        } else if (onclickAttr.includes("addCharacterAlias")) {
                          window.dispatchEvent(
                            new CustomEvent("addCharacterAlias")
                          );
                        }
                        return;
                      }
                    }
                    // Sample text clearing is handled by onMouseDown
                  }}
                  onDoubleClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.classList.contains("page-break")) {
                      e.preventDefault();
                      e.stopPropagation();
                      target.remove();
                      handleInput();
                      onPageBreakRemove?.();
                    }
                  }}
                  style={contentStyle}
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />

                {/* Page edge shadow for depth */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background:
                      "linear-gradient(to right, transparent, rgba(0,0,0,0.05))",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "4px",
                    background:
                      "linear-gradient(to bottom, transparent, rgba(0,0,0,0.05))",
                    pointerEvents: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

PaginatedEditor.displayName = "PaginatedEditor";

export default PaginatedEditor;
