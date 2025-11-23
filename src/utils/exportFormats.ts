/**
 * Advanced Export Formats Utility
 * Export documents to various formats: EPUB, Screenplay, Submission Format
 */

export class ExportFormats {
  /**
   * Export to EPUB (ebook format)
   */
  static async exportToEPUB(
    title: string,
    author: string,
    content: string,
    coverImage?: string
  ): Promise<Blob> {
    // Basic EPUB structure
    const mimeType = "application/epub+zip";

    // Container.xml
    const containerXml = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

    // Content.opf
    const contentOpf = `<?xml version="1.0"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${this.escapeXml(title)}</dc:title>
    <dc:creator opf:role="aut">${this.escapeXml(author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">${Date.now()}</dc:identifier>
    <dc:date>${new Date().toISOString().split("T")[0]}</dc:date>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
  </spine>
</package>`;

    // Chapter content
    const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${this.escapeXml(title)}</title>
  <style type="text/css">
    body { font-family: Georgia, serif; line-height: 1.6; margin: 2em; }
    p { text-indent: 1.5em; margin: 0; }
    h1, h2, h3 { text-align: center; margin: 2em 0 1em; }
  </style>
</head>
<body>
  <h1>${this.escapeXml(title)}</h1>
  ${this.convertToXhtml(content)}
</body>
</html>`;

    // TOC.ncx
    const tocNcx = `<?xml version="1.0"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle>
    <text>${this.escapeXml(title)}</text>
  </docTitle>
  <navMap>
    <navPoint id="chapter1" playOrder="1">
      <navLabel><text>Chapter 1</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;

    // Create a simple text representation (in a real implementation, use JSZip)
    const epubContent = `
EPUB Structure:
- mimetype: ${mimeType}
- META-INF/container.xml
- OEBPS/content.opf
- OEBPS/chapter1.xhtml
- OEBPS/toc.ncx

Note: This is a simplified EPUB export. For production use, integrate JSZip library.
Download the content below and use an EPUB creation tool.

=== CHAPTER CONTENT ===
${content}
    `;

    return new Blob([epubContent], { type: "text/plain" });
  }

  /**
   * Export to Screenplay format (Final Draft style)
   */
  static exportToScreenplay(
    title: string,
    author: string,
    content: string
  ): Blob {
    const screenplay = `
${this.centerText(title.toUpperCase())}

${this.centerText("by")}

${this.centerText(author)}





${this.centerText("Copyright (c) " + new Date().getFullYear())}
${this.centerText("All Rights Reserved")}






FADE IN:

${this.formatScreenplay(content)}

FADE OUT.

THE END
    `;

    return new Blob([screenplay], { type: "text/plain" });
  }

  /**
   * Export to Industry Standard Submission Format (Shunn Manuscript Format)
   */
  static exportToSubmissionFormat(
    title: string,
    author: string,
    authorAddress: string,
    authorContact: string,
    content: string,
    wordCount: number
  ): Blob {
    const lines = content.split("\n");
    const formattedLines = lines.map((line) => {
      if (line.trim().length === 0) return "";
      return "     " + line; // 5 space indent for paragraphs
    });

    const manuscript = `${author}
${authorAddress}
${authorContact}






Approximately ${wordCount} words






${this.rightAlign(author)}




${this.centerText(title.toUpperCase())}

${this.centerText("by")}

${this.centerText(author)}




${formattedLines.join("\n")}




# # #
    `;

    return new Blob([manuscript], { type: "text/plain" });
  }

  /**
   * Export to Novel Manuscript Format (Standard manuscript format for novels)
   */
  static exportToNovelManuscript(
    title: string,
    author: string,
    content: string,
    wordCount: number,
    chapterTitle?: string
  ): Blob {
    const header = `${author} / ${title.toUpperCase()} / ${Math.ceil(
      wordCount / 250
    )}`;

    const lines = content.split("\n\n");
    const formattedContent = lines.map((para) => "     " + para).join("\n\n");

    const manuscript = `${header}




${this.centerText(chapterTitle || "Chapter 1")}




${formattedContent}




# # #
    `;

    return new Blob([manuscript], { type: "text/plain" });
  }

  /**
   * Export to Rich Text Format (RTF)
   */
  static exportToRTF(title: string, author: string, content: string): Blob {
    const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;}
\\viewkind4\\uc1\\pard\\cf1\\f0\\fs24
{\\qc\\b\\fs28 ${title}\\par}
{\\qc\\fs24 by\\par}
{\\qc\\fs24 ${author}\\par}
\\par\\par
${this.convertToRTF(content)}
}`;

    return new Blob([rtfContent], { type: "application/rtf" });
  }

  // Helper methods

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private static convertToXhtml(content: string): string {
    return content
      .split("\n\n")
      .map((para) => `  <p>${this.escapeXml(para.trim())}</p>`)
      .join("\n");
  }

  private static formatScreenplay(content: string): string {
    // Basic screenplay formatting
    const lines = content.split("\n");
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";

        // Action lines (normal text)
        if (trimmed.match(/^[A-Z][a-z]/)) {
          return trimmed;
        }

        // Character names (ALL CAPS)
        if (trimmed === trimmed.toUpperCase() && trimmed.length < 30) {
          return this.indent(trimmed, 37);
        }

        // Dialogue (indented)
        return this.indent(trimmed, 25);
      })
      .join("\n");
  }

  private static convertToRTF(content: string): string {
    return content
      .split("\n\n")
      .map((para) => `\\par ${para.replace(/\n/g, "\\par ")}`)
      .join("\\par\\par ");
  }

  private static centerText(text: string, width: number = 60): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(padding) + text;
  }

  private static rightAlign(text: string, width: number = 60): string {
    const padding = Math.max(0, width - text.length);
    return " ".repeat(padding) + text;
  }

  private static indent(text: string, spaces: number): string {
    return " ".repeat(spaces) + text;
  }

  /**
   * Download blob as file
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
