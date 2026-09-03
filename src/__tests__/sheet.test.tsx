import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sheet, SheetTitle } from "../components/ui/sidebar";

describe("Sheet — props del panel", () => {
  it("style, data-* y className llegan al elemento role=dialog", async () => {
    render(
      <Sheet
        open
        onOpenChange={() => {}}
        className="sm:max-w-xl"
        style={{ "--ancho": "42rem" } as React.CSSProperties}
        data-testid="panel-orden"
        data-mobile="true"
      >
        <SheetTitle>Orden</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveClass("sm:max-w-xl");
    expect(panel.style.getPropertyValue("--ancho")).toBe("42rem");
    expect(panel).toHaveAttribute("data-testid", "panel-orden");
    expect(panel).toHaveAttribute("data-mobile", "true");
  });

  it("las props del Root de Ark siguen llegando al Root", async () => {
    render(
      <Sheet open onOpenChange={() => {}} position="left" closeOnEscape={false} ids={{ content: "panel-x" }}>
        <SheetTitle>Orden</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveAttribute("id", "panel-x");
    expect(panel).toHaveClass("left-0");
  });
});
