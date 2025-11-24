import mammoth from "mammoth";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = join(__dirname, "../public/sample-story.docx");

async function testExtraction() {
  try {
    const buffer = readFileSync(filePath);

    // Extract HTML
    const htmlResult = await mammoth.convertToHtml({ buffer });

    // Extract plain text
    const textResult = await mammoth.extractRawText({ buffer });

    console.log("=== HTML EXTRACTION (first 1000 chars) ===");
    console.log(htmlResult.value.substring(0, 1000));
    console.log("\n=== PLAIN TEXT EXTRACTION (first 500 chars) ===");
    console.log(textResult.value.substring(0, 500));

    // Check if "The FIRELIGHT" or "FIRELIGHT" appears
    const hasFirelight =
      htmlResult.value.includes("FIRELIGHT") ||
      htmlResult.value.includes("Firelight");
    const hasThe = htmlResult.value.substring(0, 200).includes("The");

    console.log("\n=== DETECTION ===");
    console.log('Contains "FIRELIGHT":', hasFirelight);
    console.log('First 200 chars contain "The":', hasThe);

    if (hasFirelight) {
      const firelightIndex = htmlResult.value.search(/FIRELIGHT|Firelight/i);
      console.log('\n=== CONTEXT AROUND "FIRELIGHT" ===');
      console.log(
        htmlResult.value.substring(
          Math.max(0, firelightIndex - 100),
          firelightIndex + 200
        )
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testExtraction();
