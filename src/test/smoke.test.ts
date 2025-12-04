import { describe, expect, it } from "vitest";

// Simple smoke test to verify Vitest wiring works end-to-end.
describe("testing harness", () => {
  it("runs a basic assertion", () => {
    expect(2 + 2).toBe(4);
  });
});
