import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../components/ui/field";
import { PasswordInput } from "../components/ui/password-input";

const campo = () => screen.getByLabelText("Contraseña") as HTMLInputElement;

const montar = (props: Partial<React.ComponentProps<typeof PasswordInput>> = {}) =>
  render(
    <Field label="Contraseña">
      <PasswordInput {...props} />
    </Field>,
  );

/**
 * El campo de contraseña de la pantalla de entrada (#130). Lo que se prueba
 * aquí es lo que la HU pide y lo que Ark UI *no* da de fábrica: que se pueda
 * alternar con el teclado, y que el `id` del `Field` llegue al input real y
 * no al `<div>` de la raíz.
 */
describe("PasswordInput", () => {
  it("empieza oculto y alterna a texto al pulsar el botón", async () => {
    const user = userEvent.setup();
    montar();

    expect(campo()).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(campo()).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(campo()).toHaveAttribute("type", "password");
  });

  it("conserva el valor al alternar: es el mismo input, solo cambia el type", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(campo(), "secreta");
    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));

    expect(campo()).toHaveValue("secreta");
    expect(campo()).toHaveAttribute("type", "text");
  });

  it("el botón se alcanza con Tab y se activa con Enter y con Espacio", async () => {
    // Ark lo pinta con `tabIndex={-1}` y solo escucha `onPointerDown`: sin la
    // corrección de este componente, un teclado no llega al botón ni podría
    // usarlo si llegara (WCAG 2.1 SC 2.1.1).
    const user = userEvent.setup();
    montar();

    await user.tab();
    expect(campo()).toHaveFocus();
    await user.tab();
    const boton = screen.getByRole("button", { name: "Mostrar contraseña" });
    expect(boton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(campo()).toHaveAttribute("type", "text");

    // Alternar devuelve el foco al input (Ark lo hace a propósito), así que
    // para el segundo golpe hay que volver al botón.
    screen.getByRole("button", { name: "Ocultar contraseña" }).focus();
    await user.keyboard("{ }");
    expect(campo()).toHaveAttribute("type", "password");
  });

  it("el nombre accesible del botón dice qué va a pasar, y se puede traducir", async () => {
    const user = userEvent.setup();
    montar({ labels: { show: "Ver clave", hide: "Esconder clave" } });

    const boton = screen.getByRole("button", { name: "Ver clave" });
    expect(boton).toHaveAttribute("aria-expanded", "false");

    await user.click(boton);
    expect(screen.getByRole("button", { name: "Esconder clave" })).toHaveAttribute("aria-expanded", "true");
  });

  it("el `id` del Field llega al input, no al div de la raíz", () => {
    montar();
    // `getByLabelText` ya fallaría si el `<label htmlFor>` apuntara al `<div>`
    // de la raíz; esto además fija que el elemento asociado es el input.
    expect(campo().tagName).toBe("INPUT");
  });

  it("lleva autoComplete `current-password` de fábrica, y admite `new-password`", () => {
    const { unmount } = montar();
    expect(campo()).toHaveAttribute("autocomplete", "current-password");
    unmount();

    montar({ autoComplete: "new-password" });
    expect(campo()).toHaveAttribute("autocomplete", "new-password");
  });

  it("no pide a los gestores de contraseñas que lo ignoren, salvo que se lo pidan", () => {
    // Es lo contrario de lo que quiere una pantalla de entrada: el campo
    // tiene que dejarse guardar. Ark lo trae apagado; esto lo fija.
    const { unmount } = montar();
    expect(campo()).not.toHaveAttribute("data-lpignore");
    unmount();

    montar({ ignorePasswordManagers: true });
    expect(campo()).toHaveAttribute("data-lpignore", "true");
  });

  it("avisa el cambio de visibilidad y admite ser controlado", async () => {
    const user = userEvent.setup();
    const onVisibilityChange = vi.fn();
    render(
      <Field label="Contraseña">
        <PasswordInput visible={false} onVisibilityChange={onVisibilityChange} />
      </Field>,
    );

    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));

    expect(onVisibilityChange).toHaveBeenCalledWith(true);
    // Controlado: sin que el consumidor mueva `visible`, sigue oculto.
    expect(campo()).toHaveAttribute("type", "password");
  });

  it("marca el campo como inválido cuando el Field trae error", () => {
    render(
      <Field label="Contraseña" error="No coincide">
        <PasswordInput />
      </Field>,
    );

    expect(campo()).toHaveAttribute("aria-invalid", "true");
    expect(campo()).toHaveAttribute("data-invalid");
  });
});
