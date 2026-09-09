import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea, textareaVariants } from "../components/ui/textarea";

describe("Textarea", () => {
  it("reenvía value y className al <textarea> nativo", () => {
    render(<Textarea defaultValue="Notas" className="mi-clase" data-testid="area" />);
    const area = screen.getByTestId("area");
    expect(area).toHaveValue("Notas");
    expect(area).toHaveClass("mi-clase");
    expect(area.tagName).toBe("TEXTAREA");
  });

  it("aria-invalid=true agrega las clases de estado inválido", () => {
    render(<Textarea aria-invalid="true" data-testid="area" />);
    expect(screen.getByTestId("area")).toHaveClass("aria-[invalid=true]:border-destructive");
  });
});

describe("textareaVariants", () => {
  it("variant=outline no comparte clase de fondo con subtle", () => {
    const outline = textareaVariants({ variant: "outline" });
    const subtle = textareaVariants({ variant: "subtle" });
    expect(outline).toContain("border-input");
    expect(subtle).not.toContain("border-input");
  });
});
