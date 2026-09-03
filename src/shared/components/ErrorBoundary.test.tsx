import { render } from "@testing-library/react";
import { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppErrorBoundary } from "./ErrorBoundary";

function Broken(): ReactElement {
  throw new Error("Feature failed");
}

describe("AppErrorBoundary", () => {
  it("shows a recoverable fallback", () => {
    const view = render(
      <MemoryRouter>
        <AppErrorBoundary>
          <Broken />
        </AppErrorBoundary>
      </MemoryRouter>,
    );
    expect(view.getByRole("alert")).toHaveTextContent("Feature failed");
  });

  it("isolates a crashed feature without removing sibling navigation", () => {
    const view = render(
      <MemoryRouter>
        <nav aria-label="Primary"><a href="/sprint">Sprint Tracker</a><a href="/showcase">Showcase</a></nav>
        <AppErrorBoundary name="Idea Generator"><Broken /></AppErrorBoundary>
      </MemoryRouter>,
    );
    expect(view.getByRole("alert")).toHaveTextContent("Idea Generator stalled");
    expect(view.getByRole("navigation", { name: "Primary" })).toHaveTextContent("Sprint Tracker");
    expect(view.getByRole("navigation", { name: "Primary" })).toHaveTextContent("Showcase");
  });
});
