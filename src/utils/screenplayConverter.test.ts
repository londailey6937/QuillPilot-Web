/**
 * Screenplay Converter Test
 * Quick test to verify screenplay detection and conversion
 */

import { isScreenplay, convertScreenplayToHtml } from "./screenplayConverter";

// Sample screenplay text (minimal)
const sampleScreenplay = `
INT. OFFICE - DAY

John sits at his desk, frustrated.

JOHN
This project is taking forever.

MARY
(entering)
Maybe you need a break?

JOHN
I can't. The deadline is tomorrow.

Mary walks over and looks at his screen.

MARY
Let me help.

FADE OUT.
`;

// Sample prose text (not a screenplay)
const sampleProse = `
The office was quiet that morning. John sat at his desk, feeling frustrated about the project that seemed to be taking forever. The deadline was tomorrow, and he couldn't afford to take a break.

Mary entered the room and noticed his distress. "Maybe you need a break?" she suggested gently.

"I can't," John replied without looking up. "The deadline is tomorrow."

She walked over and looked at his screen, then offered, "Let me help."
`;

console.log("🎬 Testing Screenplay Detection...\n");

console.log("Test 1: Screenplay Format");
console.log("Is Screenplay:", isScreenplay(sampleScreenplay));
console.log("Expected: true\n");

console.log("Test 2: Prose Format");
console.log("Is Screenplay:", isScreenplay(sampleProse));
console.log("Expected: false\n");

console.log("Test 3: Screenplay Conversion");
const converted = convertScreenplayToHtml(sampleScreenplay);
console.log("Converted HTML:");
console.log(converted.substring(0, 500));
console.log("\n✅ Tests complete!");
