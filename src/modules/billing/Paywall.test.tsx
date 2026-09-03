import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Paywall } from "./Paywall";
import { AppProviders } from "../../app/providers";
import { MemoryRouter } from "react-router-dom";

describe("Paywall", () => {
  it("explains benefit before price link", () => {
    const view = render(<MemoryRouter><AppProviders><Paywall feature="Export sprint report" benefit="Create a clean report from your daily progress." /></AppProviders></MemoryRouter>);
    expect(view.getByText("Create a clean report from your daily progress.")).toBeInTheDocument();
    expect(view.getByRole("link", { name: /See Sprint Pass/i })).toBeInTheDocument();
  });
});
