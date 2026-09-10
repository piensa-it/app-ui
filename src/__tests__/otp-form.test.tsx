import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OtpForm } from "../components/ui/otp-form";
import { PasswordResetForm } from "../components/ui/password-reset-form";

const casillas = () => screen.getAllByRole("textbox") as HTMLInputElement[];

const OtpControlado = (props: Partial<React.ComponentProps<typeof OtpForm>> = {}) => {
  const [value, setValue] = React.useState("");
  return <OtpForm value={value} onChange={setValue} onSubmit={() => {}} {...props} />;
};

/**
 * El segundo factor (#131). Lo que se prueba es lo que la HU decidió y
 * podría deshacerse sin que nada más se queje: que la cuenta atrás del
 * reenvío la lleve la aplicación, que el destino llegue ya enmascarado, y
 * que completar el código envíe.
 */
describe("OtpForm", () => {
  it("se envía solo al completarse el código", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OtpControlado length={4} onSubmit={onSubmit} />);

    await user.click(casillas()[0]);
    await user.keyboard("482");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard("9");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("también se envía con el botón", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OtpControlado onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Verificar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("con `loading` descarta el envío, y el completar tampoco lo fuerza", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OtpControlado length={4} onSubmit={onSubmit} loading />);

    const boton = screen.getByRole("button", { name: "Verificando…" });
    expect(boton).toHaveAttribute("aria-disabled", "true");
    expect(boton).not.toBeDisabled();

    await user.click(casillas()[0]);
    await user.keyboard("4829");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("mientras falta tiempo el reenvío queda deshabilitado y dice cuánto falta", async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();
    const { rerender } = render(
      <OtpForm value="" onChange={() => {}} onSubmit={() => {}} onResend={onResend} resendAvailableIn={32} />,
    );

    const boton = screen.getByRole("button", { name: "Podés reenviar el código en 32 s" });
    // `aria-disabled` y no `disabled`: el control sigue en el recorrido del
    // teclado, así que quien lo alcanza oye por qué no puede usarlo todavía.
    expect(boton).toHaveAttribute("aria-disabled", "true");
    expect(boton).not.toBeDisabled();

    await user.click(boton);
    expect(onResend).not.toHaveBeenCalled();

    // La cuenta atrás la lleva la aplicación (#131, decisión 4): la librería
    // no monta temporizadores, solo refleja el número que le llega.
    rerender(<OtpForm value="" onChange={() => {}} onSubmit={() => {}} onResend={onResend} resendAvailableIn={0} />);
    await user.click(screen.getByRole("button", { name: "Reenviar código" }));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it("no ofrece reenviar si no llega `onResend`", () => {
    render(<OtpControlado resendAvailableIn={0} />);
    expect(screen.queryByRole("button", { name: /Reenviar/ })).toBeNull();
  });

  it("dice a dónde se envió, con el texto que la aplicación ya enmascaró", () => {
    render(<OtpControlado sentTo="•••@piensait.com" />);
    expect(screen.getByText(/Escribí el código que enviamos a/)).toHaveTextContent("•••@piensait.com");
  });

  it("sin `sentTo` no promete un destino", () => {
    render(<OtpControlado />);
    expect(screen.queryByText(/Escribí el código que enviamos a/)).toBeNull();
  });

  it("el error se anuncia y su hueco existe desde antes de aparecer", () => {
    const { container, rerender } = render(<OtpForm value="" onChange={() => {}} onSubmit={() => {}} />);

    const region = container.querySelector("[aria-live]");
    expect(region).toBeEmptyDOMElement();

    rerender(<OtpForm value="" onChange={() => {}} onSubmit={() => {}} error="El código no es válido" />);
    expect(screen.getByRole("alert")).toHaveTextContent("El código no es válido");
    expect(container.querySelector("[aria-live]")).toBe(region);
  });

  it("todos los textos se pueden sustituir", () => {
    render(
      <OtpControlado
        onResend={() => {}}
        resendAvailableIn={5}
        labels={{ code: "Clave temporal", submit: "Continuar", resendIn: (s) => `Faltan ${s}` }}
      />,
    );

    expect(screen.getByRole("group", { name: "Clave temporal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Faltan 5" })).toBeInTheDocument();
  });
});

/**
 * Recuperar el acceso (#131). Lo que se prueba es que el paso lo mande la
 * aplicación y que el formulario no invente nada: ni el destino, ni el
 * momento de cambiar de paso.
 */
describe("PasswordResetForm", () => {
  const montar = (props: Partial<React.ComponentProps<typeof PasswordResetForm>> = {}) => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    const utils = render(
      <PasswordResetForm step="request" value="" onChange={onChange} onSubmit={onSubmit} {...props} />,
    );
    return { onSubmit, onChange, ...utils };
  };

  it("en el paso `request` pide el identificador y lo declara para el autorrelleno", () => {
    montar();
    const campo = screen.getByLabelText("Usuario o correo");
    expect(campo).toHaveAttribute("autocomplete", "username");
  });

  it("envía con Enter desde el campo", async () => {
    const user = userEvent.setup();
    const { onSubmit } = montar();

    await user.click(screen.getByLabelText("Usuario o correo"));
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("el paso lo manda la aplicación: `request` no se convierte solo en `sent` al enviar", async () => {
    const user = userEvent.setup();
    montar();

    await user.click(screen.getByRole("button", { name: "Enviar instrucciones" }));

    // Sigue en `request`, porque el paso llega por prop: el cambio ocurre
    // cuando el backend responde, y un estado interno se quedaría en
    // «enviado» aunque la petición hubiera fallado.
    await waitFor(() => expect(screen.getByLabelText("Usuario o correo")).toBeInTheDocument());
    expect(screen.queryByText("Revisa tu correo")).toBeNull();
  });

  it("el paso `sent` dice a dónde se envió, con el texto ya enmascarado por la aplicación", () => {
    montar({ step: "sent", sentTo: "•••@piensait.com" });

    expect(screen.getByRole("status")).toHaveTextContent("•••@piensait.com");
    // Ya no hay nada que enviar: un formulario vacío ofrecería un envío que
    // no existe.
    expect(screen.queryByRole("button", { name: "Enviar instrucciones" })).toBeNull();
  });

  it("sin `sentTo`, el paso `sent` no promete un destino", () => {
    montar({ step: "sent" });
    expect(screen.getByRole("status")).toHaveTextContent("Si la cuenta existe, ya enviamos las instrucciones.");
  });

  it("el enlace de volver solo existe si llega su manejador, y funciona en los dos pasos", async () => {
    const user = userEvent.setup();
    const { unmount } = montar();
    expect(screen.queryByRole("button", { name: "Volver a entrar" })).toBeNull();
    unmount();

    const onBack = vi.fn();
    const { unmount: cerrar } = montar({ onBack });
    await user.click(screen.getByRole("button", { name: "Volver a entrar" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    cerrar();

    montar({ step: "sent", onBack });
    await user.click(screen.getByRole("button", { name: "Volver a entrar" }));
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it("con `loading` descarta el segundo envío sin quitarle el foco al botón", async () => {
    const user = userEvent.setup();
    const { onSubmit } = montar({ loading: true });

    const boton = screen.getByRole("button", { name: "Enviando…" });
    expect(boton).toHaveAttribute("aria-disabled", "true");
    boton.focus();
    await user.keyboard("{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(boton).toHaveFocus();
  });

  it("el error se anuncia en los dos pasos", () => {
    const { unmount } = montar({ error: "No pudimos enviar el correo" });
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos enviar el correo");
    unmount();

    montar({ step: "sent", error: "No pudimos enviar el correo" });
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos enviar el correo");
  });
});
