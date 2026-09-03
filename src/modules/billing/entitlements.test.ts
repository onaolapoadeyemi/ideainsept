import { describe, expect, it } from "vitest";
import { canUseFeature, freeEntitlement, isGenerationAllowed, sprintPassEntitlement } from "./entitlements";

describe("entitlements", () => {
  it("gates paid features for free users", () => {
    expect(canUseFeature(freeEntitlement, "canExportReport")).toBe(false);
    expect(canUseFeature(sprintPassEntitlement, "canExportReport")).toBe(true);
  });

  it("checks generation allowances", () => {
    expect(isGenerationAllowed(freeEntitlement, 2)).toBe(true);
    expect(isGenerationAllowed(freeEntitlement, 3)).toBe(false);
  });
});
