import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../components/ui/checkbox";

describe("Checkbox", () => {
  it("invoca onCheckedChange al hacer click", async () => {
    let checked = false;
    render(<Checkbox checked={checked} onCheckedChange={(value) => (checked = value)} />);

    await userEvent.click(screen.getByRole("checkbox"));
    expect(checked).toBe(true);
  });

  it("refleja el estado checked", () => {
    render(<Checkbox checked readOnly />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});

describe("Checkbox — estado indeterminado", () => {
  it("con checked=\"indeterminate\" el input nativo queda .indeterminate === true", async () => {
    render(<Checkbox checked="indeterminate" readOnly aria-label="Seleccionar todo" />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    // Ark aplica `el.indeterminate` desde un efecto (microtask) del machine,
    // no de forma síncrona al montar — hay que esperar a que corra.
    await waitFor(() => expect(input.indeterminate).toBe(true));
    expect(input.checked).toBe(false);
  });

  it("con checked=\"indeterminate\" el control expone data-state=indeterminate", async () => {
    render(<Checkbox checked="indeterminate" readOnly aria-label="Seleccionar todo" />);
    const input = screen.getByRole("checkbox");
    const control = input.closest("label")?.querySelector('[data-part="control"]');
    await waitFor(() => expect(control).toHaveAttribute("data-state", "indeterminate"));
  });

  it("un click sobre un checkbox indeterminado lo resuelve a checked=true, no a \"indeterminate\"", async () => {
    let received: boolean | undefined;
    render(
      <Checkbox
        checked="indeterminate"
        onCheckedChange={(value) => {
          received = value;
        }}
        aria-label="Seleccionar todo"
      />,
    );

    await userEvent.click(screen.getByRole("checkbox"));
    expect(received).toBe(true);
  });

  it("checked=false (no indeterminate) deja .indeterminate en false", async () => {
    render(<Checkbox checked={false} readOnly aria-label="Seleccionar todo" />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    await waitFor(() => expect(input).toBeInTheDocument());
    expect(input.indeterminate).toBe(false);
  });
});

describe("Checkbox — input oculto utilizable por herramientas de automatización", () => {
  it("el input cubre todo el control y sigue siendo type=checkbox", () => {
    render(<Checkbox aria-label="Acepto" />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input.style.clip).toBe("auto");
    expect(input.style.width).toBe("100%");
    expect(input.style.height).toBe("100%");
    expect(input.style.position).toBe("absolute");
    expect(input).toHaveClass("opacity-0", "cursor-pointer");
    expect(input.closest("label")).toHaveClass("relative");
  });

  it("aria-label da nombre al input, no al <label> raíz", () => {
    render(<Checkbox aria-label="Acepto los términos" />);
    const input = screen.getByRole("checkbox", { name: "Acepto los términos" });
    expect(input).not.toHaveAttribute("aria-labelledby");
    expect(input.closest("label")).not.toHaveAttribute("aria-label");
  });

  it("con `label` conserva el nombre vía aria-labelledby", () => {
    render(<Checkbox label="Recordarme" />);
    expect(screen.getByRole("checkbox", { name: "Recordarme" })).toHaveAttribute("aria-labelledby");
  });

  it("`id` va al input para que un <label htmlFor> externo lo asocie", () => {
    render(
      <>
        <label htmlFor="acepta">Acepto</label>
        <Checkbox id="acepta" />
      </>,
    );
    const input = screen.getByLabelText("Acepto");
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input).toHaveAttribute("id", "acepta");
  });
});
