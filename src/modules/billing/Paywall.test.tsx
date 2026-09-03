import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Paywall } from "./Paywall";

describe("Paywall", () => {
  it("explains benefit before price link", () => {
    const view = render(<Paywall feature="Export sprint report" benefit="Create a clean report from your daily progress." />);
    expect(view.getByText("Create a clean report from your daily progress.")).toBeInTheDocument();
    expect(view.getByRole("link", { name: /See Sprint Pass/i })).toBeInTheDocument();
  });
});
