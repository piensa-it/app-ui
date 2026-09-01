import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stagger } from "@/components/ui/stagger";

describe("Stagger", () => {
  it("asigna retrasos incrementales a cada hijo", () => {
    render(
      <Stagger gap={80} data-testid="grupo">
        <span>Uno</span>
        <span>Dos</span>
        <span>Tres</span>
      </Stagger>,
    );

    const items = screen.getByTestId("grupo").querySelectorAll("[data-ui-stagger-item]");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveStyle({ "--ui-stagger-delay": "0ms" });
    expect(items[1]).toHaveStyle({ "--ui-stagger-delay": "80ms" });
    expect(items[2]).toHaveStyle({ "--ui-stagger-delay": "160ms" });
  });

  it("aplica itemClassName al envoltorio y omite hijos nulos", () => {
    render(
      <Stagger data-testid="grupo" itemClassName="h-full">
        <span>Uno</span>
        {null}
        {false}
        <span>Dos</span>
      </Stagger>,
    );

    const items = screen.getByTestId("grupo").querySelectorAll("[data-ui-stagger-item]");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("h-full");
    expect(items[1]).toHaveStyle({ "--ui-stagger-delay": "60ms" });
  });
});
