import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput } from "../components/ui/number-input";

describe("NumberInput", () => {
  it("expone el input con el nombre accesible dado", () => {
    render(<NumberInput value={10} aria-label="Cantidad" />);
    expect(screen.getByRole("spinbutton", { name: "Cantidad" })).toBeInTheDocument();
  });

  it("incrementa con el botón y avisa con el número, no el string de Ark", async () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} aria-label="Cantidad" />);

    await userEvent.click(screen.getByRole("button", { name: "Aumentar" }));
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it("decrementa con el botón", async () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} aria-label="Cantidad" />);

    await userEvent.click(screen.getByRole("button", { name: "Disminuir" }));
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it("avisa undefined (no NaN ni 0) cuando el campo queda vacío", async () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} aria-label="Cantidad" />);

    const input = screen.getByRole("spinbutton", { name: "Cantidad" });
    await userEvent.clear(input);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("formatea con separador de miles y símbolo de moneda cuando se da `currency`", () => {
    render(<NumberInput value={1250000} currency="COP" locale="es-CO" aria-label="Salario" readOnly />);
    const input = screen.getByRole("spinbutton", { name: "Salario" }) as HTMLInputElement;
    expect(input.value).toContain("1.250.000");
  });

  it("marca aria-invalid en el control cuando `invalid` es true", () => {
    render(<NumberInput value={-1} invalid aria-label="Cantidad" />);
    expect(screen.getByRole("spinbutton", { name: "Cantidad" })).toHaveAttribute("aria-invalid", "true");
  });
});
