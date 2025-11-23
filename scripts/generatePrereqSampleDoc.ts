import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const markdownPath = path.join(
  projectRoot,
  "docs",
  "prerequisite-violation-sample.md"
);
const outputPath = path.join(
  projectRoot,
  "docs",
  "prerequisite-violation-sample.docx"
);
type HeadingLevelValue = (typeof HeadingLevel)[keyof typeof HeadingLevel];

const markdown = readFileSync(markdownPath, "utf8");
const lines = markdown.split(/\r?\n/);

const paragraphs: Paragraph[] = [];

const pushHeading = (text: string, level: HeadingLevelValue) => {
  paragraphs.push(
    new Paragraph({
      text,
      heading: level,
    })
  );
};

lines.forEach((line) => {
  if (!line.trim()) {
    paragraphs.push(new Paragraph(""));
    return;
  }

  if (line.startsWith("### ")) {
    pushHeading(line.replace(/^###\s+/, ""), HeadingLevel.HEADING_3);
    return;
  }

  if (line.startsWith("## ")) {
    pushHeading(line.replace(/^##\s+/, ""), HeadingLevel.HEADING_2);
    return;
  }

  if (line.startsWith("# ")) {
    pushHeading(line.replace(/^#\s+/, ""), HeadingLevel.HEADING_1);
    return;
  }

  if (line.startsWith("> ")) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line.replace(/^>\s+/, ""),
            italics: true,
          }),
        ],
      })
    );
    return;
  }

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: line })],
    })
  );
});

const doc = new Document({
  sections: [
    {
      properties: {},
      children: paragraphs,
    },
  ],
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);
  console.log(`DOCX written to ${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to generate DOCX sample", error);
  process.exit(1);
});
