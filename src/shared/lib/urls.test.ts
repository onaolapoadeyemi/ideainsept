import { describe, expect, it } from "vitest";
import { normalizePublicUrl } from "./urls";

describe("normalizePublicUrl", () => {
  it("allows https and rejects unsafe schemes", () => {
    expect(normalizePublicUrl("https://example.com")).toBe("https://example.com");
    expect(() => normalizePublicUrl("javascript:alert(1)")).toThrow();
    expect(() => normalizePublicUrl("data:text/html,hello")).toThrow();
  });
});
