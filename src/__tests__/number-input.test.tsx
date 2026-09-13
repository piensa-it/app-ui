import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
  describe("máscara en vivo", () => {
    const plain = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");
    // Zag escribe el campo en el siguiente frame; una persona siempre deja pasar
    // uno entre teclas, `userEvent` sin `delay` no — y en jsdom se pisarían.
    const user = () => userEvent.setup({ delay: 40 });

    function Controlado(props: { initial?: number; onChange?: (value: number | undefined) => void }) {
      const [value, setValue] = useState<number | undefined>(props.initial);
      return (
        <>
          <NumberInput
            value={value}
            onChange={(next) => {
              setValue(next);
              props.onChange?.(next);
            }}
            currency="COP"
            locale="es-CO"
            aria-label="Monto"
          />
          <button type="button" onClick={() => setValue(undefined)}>
            Limpiar
          </button>
        </>
      );
    }

    it("pone los separadores de miles mientras se escribe, sin esperar al blur", async () => {
      const onChange = vi.fn();
      render(<Controlado onChange={onChange} />);
      const input = screen.getByRole("spinbutton", { name: "Monto" }) as HTMLInputElement;

      await user().type(input, "1234567");
      await waitFor(() => expect(plain(input.value)).toBe("$ 1.234.567"));
      expect(onChange).toHaveBeenLastCalledWith(1234567);
    });

    it("deja escribir el decimal de la locale y avisa el número con punto", async () => {
      const onChange = vi.fn();
      render(<Controlado onChange={onChange} />);
      const input = screen.getByRole("spinbutton", { name: "Monto" }) as HTMLInputElement;

      await user().type(input, "1234,5");
      await waitFor(() => expect(plain(input.value)).toBe("$ 1.234,5"));
      expect(onChange).toHaveBeenLastCalledWith(1234.5);
    });

    it("muestra un valor con decimales sin confundir el punto con el separador de miles de es-CO", () => {
      render(<Controlado initial={1234.5} />);
      const input = screen.getByRole("spinbutton", { name: "Monto" }) as HTMLInputElement;
      const esperado = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 }).format(1234.5);
      expect(input.value).toBe(esperado);
      expect(plain(input.value)).toContain("1.234,5");
    });

    it("un value que cambia desde fuera reemplaza el texto", async () => {
      render(<Controlado initial={500} />);
      await userEvent.click(screen.getByRole("button", { name: "Limpiar" }));
      await waitFor(() => expect((screen.getByRole("spinbutton", { name: "Monto" }) as HTMLInputElement).value).toBe(""));
    });

    it("con mask={false} vuelve a formatear solo al salir del campo", async () => {
      render(<NumberInput currency="COP" locale="es-CO" mask={false} aria-label="Monto" />);
      const input = screen.getByRole("spinbutton", { name: "Monto" }) as HTMLInputElement;
      await user().type(input, "1234");
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(input.value).toBe("1234");
    });
  });

  it("hideControls quita los botones de aumentar y disminuir", () => {
    render(<NumberInput value={1} hideControls aria-label="Cantidad" />);
    expect(screen.queryByRole("button", { name: "Aumentar" })).not.toBeInTheDocument();
  });
});
