/**
 * VML Text Extractor
 *
 * Extracts text from VML (Vector Markup Language) elements in DOCX files.
 * This handles WordArt, decorative text, and text boxes that mammoth cannot extract.
 * Also handles tracked changes/revisions that can cause duplicate text.
 */

import JSZip from "jszip";

interface VmlTextElement {
  text: string;
  type: "wordart" | "textbox" | "shape";
  position?: number; // Approximate position in document
}

interface DocxDebugInfo {
  hasTrackedChanges: boolean;
  hasVmlContent: boolean;
  hasDrawingML: boolean;
  deletedText: string[];
  insertedText: string[];
  vmlText: string[];
  drawingText: string[];
  paragraphStyles: Array<{ styleId: string; text: string }>;
  availableStyles: Array<{ styleId: string; name: string; type: string }>;
}

/**
 * Debug a DOCX to understand its structure and potential issues
 */
export async function debugDocx(
  arrayBuffer: ArrayBuffer
): Promise<DocxDebugInfo> {
  const info: DocxDebugInfo = {
    hasTrackedChanges: false,
    hasVmlContent: false,
    hasDrawingML: false,
    deletedText: [],
    insertedText: [],
    vmlText: [],
    drawingText: [],
    paragraphStyles: [],
    availableStyles: [],
  };

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file("word/document.xml")?.async("string");
    const stylesXml = await zip.file("word/styles.xml")?.async("string");

    // Extract available styles from styles.xml
    if (stylesXml) {
      // Match style definitions
      const styleMatches = stylesXml.matchAll(
        /<w:style[^>]*w:type="([^"]*)"[^>]*w:styleId="([^"]*)"[^>]*>[\s\S]*?<w:name[^>]*w:val="([^"]*)"[^>]*\/>[\s\S]*?<\/w:style>/gi
      );
      for (const match of styleMatches) {
        info.availableStyles.push({
          type: match[1],
          styleId: match[2],
          name: match[3],
        });
      }

      // Try alternate pattern where styleId comes before type
      const altStyleMatches = stylesXml.matchAll(
        /<w:style[^>]*w:styleId="([^"]*)"[^>]*w:type="([^"]*)"[^>]*>[\s\S]*?<w:name[^>]*w:val="([^"]*)"[^>]*\/>[\s\S]*?<\/w:style>/gi
      );
      for (const match of altStyleMatches) {
        // Only add if not already present
        if (!info.availableStyles.find((s) => s.styleId === match[1])) {
          info.availableStyles.push({
            styleId: match[1],
            type: match[2],
            name: match[3],
          });
        }
      }

      console.log(
        "[debugDocx] Available styles in document:",
        info.availableStyles
      );
    }

    if (documentXml) {
      // Extract paragraph style IDs with their text content
      const paraMatches = documentXml.matchAll(/<w:p[\s\S]*?<\/w:p>/gi);
      for (const match of paraMatches) {
        const para = match[0];
        // Find the pStyle (paragraph style)
        const styleMatch = para.match(/<w:pStyle[^>]*w:val="([^"]*)"/i);
        if (styleMatch) {
          const styleId = styleMatch[1];
          const text = extractWtText(para);
          if (text.trim()) {
            info.paragraphStyles.push({
              styleId,
              text: text.trim().substring(0, 100), // First 100 chars
            });
          }
        }
      }

      console.log(
        "[debugDocx] Paragraph styles used:",
        info.paragraphStyles.slice(0, 10)
      );

      // Check for tracked changes (revisions)
      if (/<w:del[\s>]/.test(documentXml) || /<w:ins[\s>]/.test(documentXml)) {
        info.hasTrackedChanges = true;

        // Extract deleted text (this shows up but shouldn't)
        const delMatches = documentXml.matchAll(
          /<w:del[^>]*>([\s\S]*?)<\/w:del>/gi
        );
        for (const match of delMatches) {
          const innerText = extractWtText(match[1]);
          if (innerText.trim()) {
            info.deletedText.push(innerText.trim());
          }
        }

        // Extract inserted text
        const insMatches = documentXml.matchAll(
          /<w:ins[^>]*>([\s\S]*?)<\/w:ins>/gi
        );
        for (const match of insMatches) {
          const innerText = extractWtText(match[1]);
          if (innerText.trim()) {
            info.insertedText.push(innerText.trim());
          }
        }
      }

      // Check for VML
      if (/<v:/.test(documentXml) || /<w:pict>/.test(documentXml)) {
        info.hasVmlContent = true;
        const vmlElements = extractVmlFromXml(documentXml);
        info.vmlText = vmlElements.map((el) => el.text);
      }

      // Check for DrawingML
      if (/<a:t>/.test(documentXml) || /<w:drawing>/.test(documentXml)) {
        info.hasDrawingML = true;
        // Extract text from inline DrawingML
        const drawingMatches = documentXml.matchAll(/<a:t>([^<]*)<\/a:t>/gi);
        for (const match of drawingMatches) {
          const text = decodeXmlEntities(match[1]);
          if (text.trim()) {
            info.drawingText.push(text.trim());
          }
        }
      }
    }
  } catch (error) {
    console.warn("[VML Extractor] Debug failed:", error);
  }

  return info;
}

/**
 * Helper to extract w:t text from XML fragment
 */
function extractWtText(xml: string): string {
  const matches = xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
  let text = "";
  for (const match of matches) {
    text += decodeXmlEntities(match[1]);
  }
  return text;
}

/**
 * Extract text from VML elements in a DOCX file
 */
export async function extractVmlText(
  arrayBuffer: ArrayBuffer
): Promise<VmlTextElement[]> {
  const textElements: VmlTextElement[] = [];

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // VML content can be in several locations:
    // 1. word/document.xml - inline VML
    // 2. word/vmlDrawing*.xml - separate VML files
    // 3. word/drawings/*.xml - DrawingML that may contain text

    // Process main document for inline VML
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (documentXml) {
      const vmlTexts = extractVmlFromXml(documentXml);
      textElements.push(...vmlTexts);
    }

    // Process separate VML drawing files
    const vmlFiles = Object.keys(zip.files).filter((name) =>
      name.match(/word\/vmlDrawing\d*\.xml/i)
    );

    for (const vmlFile of vmlFiles) {
      const vmlContent = await zip.file(vmlFile)?.async("string");
      if (vmlContent) {
        const vmlTexts = extractVmlFromXml(vmlContent);
        textElements.push(...vmlTexts);
      }
    }

    // Process DrawingML files
    const drawingFiles = Object.keys(zip.files).filter((name) =>
      name.match(/word\/drawings\/.*\.xml/i)
    );

    for (const drawingFile of drawingFiles) {
      const drawingContent = await zip.file(drawingFile)?.async("string");
      if (drawingContent) {
        const drawingTexts = extractDrawingMlText(drawingContent);
        textElements.push(...drawingTexts);
      }
    }
  } catch (error) {
    console.warn("[VML Extractor] Failed to extract VML text:", error);
  }

  return textElements;
}

/**
 * Extract text from VML XML content
 */
function extractVmlFromXml(xml: string): VmlTextElement[] {
  const elements: VmlTextElement[] = [];
  const parser = new DOMParser();

  try {
    // Parse as XML
    const doc = parser.parseFromString(xml, "text/xml");

    // Look for v:textpath elements (WordArt style text)
    // Pattern: <v:textpath ... string="Text Here" />
    const textPathMatches = xml.matchAll(
      /<v:textpath[^>]*string\s*=\s*["']([^"']+)["'][^>]*\/?>/gi
    );
    for (const match of textPathMatches) {
      const text = decodeXmlEntities(match[1]);
      if (text.trim()) {
        elements.push({ text: text.trim(), type: "wordart" });
      }
    }

    // Look for v:textbox elements (text boxes)
    // These contain actual text content inside
    const textBoxMatches = xml.matchAll(
      /<v:textbox[^>]*>([\s\S]*?)<\/v:textbox>/gi
    );
    for (const match of textBoxMatches) {
      const innerContent = match[1];
      // Extract text from inner content (may have w:t elements)
      const textMatches = innerContent.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
      let boxText = "";
      for (const textMatch of textMatches) {
        boxText += decodeXmlEntities(textMatch[1]) + " ";
      }
      if (boxText.trim()) {
        elements.push({ text: boxText.trim(), type: "textbox" });
      }
    }

    // Look for w:txbxContent (textbox content) elements
    const txbxMatches = xml.matchAll(
      /<w:txbxContent[^>]*>([\s\S]*?)<\/w:txbxContent>/gi
    );
    for (const match of txbxMatches) {
      const innerContent = match[1];
      const textMatches = innerContent.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
      let txbxText = "";
      for (const textMatch of textMatches) {
        txbxText += decodeXmlEntities(textMatch[1]) + " ";
      }
      if (txbxText.trim()) {
        elements.push({ text: txbxText.trim(), type: "textbox" });
      }
    }

    // Look for wps:txbx (Word Processing Shape textbox) elements
    const wpsMatches = xml.matchAll(/<wps:txbx[^>]*>([\s\S]*?)<\/wps:txbx>/gi);
    for (const match of wpsMatches) {
      const innerContent = match[1];
      const textMatches = innerContent.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/gi);
      let wpsText = "";
      for (const textMatch of textMatches) {
        wpsText += decodeXmlEntities(textMatch[1]) + " ";
      }
      // Also check for w:t elements
      const wtMatches = innerContent.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
      for (const wtMatch of wtMatches) {
        wpsText += decodeXmlEntities(wtMatch[1]) + " ";
      }
      if (wpsText.trim()) {
        elements.push({ text: wpsText.trim(), type: "shape" });
      }
    }
  } catch (error) {
    console.warn("[VML Extractor] Failed to parse VML XML:", error);
  }

  return elements;
}

/**
 * Extract text from DrawingML content
 */
function extractDrawingMlText(xml: string): VmlTextElement[] {
  const elements: VmlTextElement[] = [];

  try {
    // Look for a:t (DrawingML text) elements
    const textMatches = xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/gi);
    let drawingText = "";
    for (const match of textMatches) {
      drawingText += decodeXmlEntities(match[1]) + " ";
    }
    if (drawingText.trim()) {
      elements.push({ text: drawingText.trim(), type: "shape" });
    }

    // Look for dgm:t (Diagram text) elements
    const dgmMatches = xml.matchAll(/<dgm:t[^>]*>([^<]*)<\/dgm:t>/gi);
    for (const match of dgmMatches) {
      const text = decodeXmlEntities(match[1]);
      if (text.trim()) {
        elements.push({ text: text.trim(), type: "shape" });
      }
    }
  } catch (error) {
    console.warn("[VML Extractor] Failed to parse DrawingML:", error);
  }

  return elements;
}

/**
 * Decode XML entities in text
 */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Check if a DOCX contains VML/decorative text that mammoth might miss
 */
export async function hasVmlContent(
  arrayBuffer: ArrayBuffer
): Promise<boolean> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Check for VML drawing files
    const hasVmlFiles = Object.keys(zip.files).some((name) =>
      name.match(/word\/vmlDrawing\d*\.xml/i)
    );

    if (hasVmlFiles) return true;

    // Check main document for VML namespace or elements
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (documentXml) {
      // Check for VML elements
      if (/<v:/.test(documentXml) || /<w:pict>/.test(documentXml)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get a summary of VML text found in a document
 */
export async function getVmlTextSummary(
  arrayBuffer: ArrayBuffer
): Promise<string | null> {
  const elements = await extractVmlText(arrayBuffer);

  if (elements.length === 0) return null;

  const summary = elements.map((el) => `[${el.type}] ${el.text}`).join("\n");

  return summary;
}
