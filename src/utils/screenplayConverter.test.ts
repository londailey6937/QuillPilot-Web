import { describe, expect, it } from "vitest";
import { convertScreenplayToHtml, isScreenplay } from "./screenplayConverter";

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

const sampleProse = `
The office was quiet that morning. John sat at his desk, feeling frustrated about the project that seemed to be taking forever. The deadline was tomorrow, and he couldn't afford to take a break.

Mary entered the room and noticed his distress. "Maybe you need a break?" she suggested gently.

"I can't," John replied without looking up. "The deadline is tomorrow."

She walked over and looked at his screen, then offered, "Let me help."
`;

describe("screenplayConverter", () => {
  it("identifies screenplay formatted text", () => {
    expect(isScreenplay(sampleScreenplay)).toBe(true);
  });

  it("rejects prose formatted text", () => {
    expect(isScreenplay(sampleProse)).toBe(false);
  });

  it("converts screenplay text to structured HTML", () => {
    const converted = convertScreenplayToHtml(sampleScreenplay);
    expect(converted).toContain('data-block="scene-heading"');
    expect(converted).toContain('data-block="character"');
    expect(converted).toContain('data-block="dialogue"');
    expect(converted.split("scene-heading").length - 1).toBeGreaterThanOrEqual(
      1
    );
  });
});
