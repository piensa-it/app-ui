import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../components/ui/field";
import { PinInput } from "../components/ui/pin-input";

const casillas = () => screen.getAllByRole("textbox") as HTMLInputElement[];

const Controlado = ({
  onComplete,
  ...props
}: Partial<React.ComponentProps<typeof PinInput>> = {}) => {
  const [value, setValue] = React.useState("");
  return <PinInput value={value} onChange={setValue} onComplete={onComplete} aria-label="Código" {...props} />;
};

/**
 * El control de código de un solo uso (#131). Se construye aparte del login
 * a propósito: sirve igual para confirmar una transferencia o autorizar una
 * anulación, y por eso vive en `ui/`.
 */
describe("PinInput", () => {
  it("pinta una casilla por carácter, seis por defecto", () => {
    render(<Controlado />);
    expect(casillas()).toHaveLength(6);
  });

  it("mueve el foco solo al teclear y avisa el valor completo", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Controlado length={4} onComplete={onComplete} />);

    await user.click(casillas()[0]);
    await user.keyboard("1234");

    expect(casillas().map((input) => input.value)).toEqual(["1", "2", "3", "4"]);
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("borrar hacia atrás vacía y retrocede", async () => {
    const user = userEvent.setup();
    render(<Controlado length={4} />);

    await user.click(casillas()[0]);
    await user.keyboard("12");
    await user.keyboard("{Backspace}");
    expect(casillas()[1]).toHaveValue("");
    await user.keyboard("{Backspace}");
    expect(casillas()[0]).toHaveValue("");
  });

  it("pegar el código entero lo reparte entre todas las casillas", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Controlado length={6} onComplete={onComplete} />);

    await user.click(casillas()[0]);
    await user.paste("482913");

    // Zag reparte lo pegado dentro de un `requestAnimationFrame`, así que el
    // reparto no está hecho todavía cuando `paste` devuelve.
    await waitFor(() => expect(casillas().map((input) => input.value)).toEqual(["4", "8", "2", "9", "1", "3"]));
    expect(onComplete).toHaveBeenCalledWith("482913");
  });

  it("declara el código como de un solo uso y pide teclado numérico", () => {
    // Sin `one-time-code` el teléfono no ofrece el código que acaba de
    // llegar por SMS, que es la mitad del valor de esta pieza (#131,
    // decisión 3).
    render(<Controlado />);
    for (const casilla of casillas()) {
      expect(casilla).toHaveAttribute("autocomplete", "one-time-code");
      expect(casilla).toHaveAttribute("inputmode", "numeric");
    }
  });

  it("con `otp` apagado no ofrece el código de un solo uso", () => {
    render(<Controlado otp={false} />);
    expect(casillas()[0]).toHaveAttribute("autocomplete", "off");
  });

  it("en modo `mask` las casillas son de contraseña, así que no se pueden copiar", () => {
    // El navegador no deja copiar de un `type=password`; es lo que cumple
    // «no expone el valor al portapapeles» sin inventarse nada.
    const { container } = render(<Controlado mask />);
    const inputs = container.querySelectorAll("input:not([aria-hidden])");
    const visibles = [...inputs].filter((input) => input.getAttribute("type") === "password");
    expect(visibles).toHaveLength(6);
  });

  it("cada casilla dice cuál es de cuántas, en español y sustituible", () => {
    const { unmount } = render(<Controlado length={4} />);
    expect(screen.getByLabelText("dígito 1 de 4")).toBeInTheDocument();
    expect(screen.getByLabelText("dígito 4 de 4")).toBeInTheDocument();
    unmount();

    render(<Controlado length={4} labels={{ input: (i, total) => `casilla ${i + 1}/${total}` }} />);
    expect(screen.getByLabelText("casilla 1/4")).toBeInTheDocument();
  });

  it("el grupo tiene nombre accesible cuando se le da uno", () => {
    render(<Controlado aria-label="Código de verificación" />);
    expect(screen.getByRole("group", { name: "Código de verificación" })).toBeInTheDocument();
  });

  it("dentro de un Field compuesto no declara un segundo grupo: el rótulo lo pone el Field", () => {
    render(
      <Field label="Código" compositeControl>
        <PinInput value="" onChange={() => {}} />
      </Field>,
    );

    // Uno solo, y es el del `Field`. Dos grupos anidados con el mismo
    // contenido son ruido para quien escucha —y filtrar por nombre no
    // bastaría para verlo: el segundo grupo no tendría nombre, así que un
    // `{ name: "Código" }` lo dejaría pasar (comprobado por mutación).
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(screen.getByRole("group")).toHaveAccessibleName("Código");
  });

  it("refleja un valor más corto que las casillas sin romperse", () => {
    render(<PinInput value="12" onChange={() => {}} length={6} aria-label="Código" />);
    expect(casillas().map((input) => input.value)).toEqual(["1", "2", "", "", "", ""]);
  });

  it("marca las casillas como inválidas cuando el Field trae error", () => {
    render(
      <Field label="Código" compositeControl error="El código no coincide">
        <PinInput value="" onChange={() => {}} aria-invalid />
      </Field>,
    );
    expect(casillas()[0]).toHaveAttribute("aria-invalid", "true");
  });
});
