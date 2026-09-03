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
});
