import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginForm, type LoginFormValue } from "../components/ui/login-form";

const vacio: LoginFormValue = { username: "", password: "", remember: false };

const montar = (props: Partial<React.ComponentProps<typeof LoginForm>> = {}) => {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const utils = render(<LoginForm value={vacio} onChange={onChange} onSubmit={onSubmit} {...props} />);
  return { onChange, onSubmit, ...utils };
};

/**
 * El formulario de entrada estándar (#130). Casi todo lo que se prueba aquí
 * es una decisión de la HU que se podría deshacer sin que nada más se
 * queje: que Enter envíe, que el botón *no* se deshabilite con los campos
 * vacíos, y que `autoComplete` esté puesto.
 */
describe("LoginForm", () => {
  it("envía con Enter desde cualquiera de los dos campos", async () => {
    const user = userEvent.setup();
    const { onSubmit } = montar();

    await user.click(screen.getByLabelText("Usuario"));
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText("Contraseña"));
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("es un <form> de verdad y no deja que el navegador navegue al enviar", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = montar();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();

    // El evento se guarda y se revisa *después* de que termine de
    // propagarse: el manejador de React vive en la raíz, así que dentro de
    // un listener puesto en el propio `<form>` todavía no llamó a
    // `preventDefault`. Comprobarlo ahí adentro, además, se tragaría su
    // propio fallo —el error saldría por consola y el test pasaría igual.
    let enviado: SubmitEvent | undefined;
    form!.addEventListener("submit", (event) => {
      enviado = event as SubmitEvent;
    });

    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(enviado).toBeDefined();
    expect(enviado!.defaultPrevented).toBe(true);
  });

  it("los campos declaran su propósito para el autorrelleno (WCAG 2.1 SC 1.3.5)", () => {
    montar();
    expect(screen.getByLabelText("Usuario")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("autocomplete", "current-password");
  });

  it("avisa cada cambio con el objeto completo", async () => {
    const user = userEvent.setup();
    const { onChange } = montar();

    await user.type(screen.getByLabelText("Usuario"), "a");
    expect(onChange).toHaveBeenLastCalledWith({ username: "a", password: "", remember: false });

    await user.type(screen.getByLabelText("Contraseña"), "x");
    expect(onChange).toHaveBeenLastCalledWith({ username: "", password: "x", remember: false });

    await user.click(screen.getByRole("checkbox", { name: "Recordar mi usuario" }));
    expect(onChange).toHaveBeenLastCalledWith({ username: "", password: "", remember: true });
  });

  it("el botón de entrar NO se deshabilita con los campos vacíos", async () => {
    // Decisión 7 de la HU: deshabilitarlo esconde el motivo. Se deja enviar
    // y que la aplicación conteste con `error`.
    const user = userEvent.setup();
    const { onSubmit } = montar();

    const boton = screen.getByRole("button", { name: "Entrar" });
    expect(boton).not.toBeDisabled();
    expect(boton).not.toHaveAttribute("aria-disabled");

    await user.click(boton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("con `loading` descarta el segundo envío sin quitarle el foco al botón", async () => {
    const user = userEvent.setup();
    const { onSubmit } = montar({ loading: true });

    const boton = screen.getByRole("button", { name: "Entrando…" });
    // `aria-disabled`, no `disabled`: con el nativo el navegador le quita el
    // foco y el lector de pantalla no anuncia el cambio de nombre.
    expect(boton).toHaveAttribute("aria-disabled", "true");
    expect(boton).toHaveAttribute("aria-busy", "true");
    expect(boton).not.toBeDisabled();

    boton.focus();
    expect(boton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(boton).toHaveFocus();
  });

  it("el error se anuncia y su hueco existe desde antes de que aparezca", () => {
    const { container, rerender } = montar();

    // El contenedor vivo tiene que estar en el primer render: si naciera
    // junto con el mensaje, el lector de pantalla no anunciaría nada.
    const region = container.querySelector("[aria-live]");
    expect(region).not.toBeNull();
    expect(region).toBeEmptyDOMElement();

    rerender(<LoginForm value={vacio} onChange={vi.fn()} onSubmit={vi.fn()} error="Usuario o contraseña incorrectos" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Usuario o contraseña incorrectos");
    // Y sigue siendo el mismo nodo: no se reemplazó la región al aparecer.
    expect(container.querySelector("[aria-live]")).toBe(region);
  });

  it("los enlaces solo existen si llega su manejador", async () => {
    const user = userEvent.setup();
    const { unmount } = montar();
    expect(screen.queryByRole("button", { name: /Olvidaste/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Activa/ })).toBeNull();
    unmount();

    const onForgot = vi.fn();
    const onActivate = vi.fn();
    montar({ onForgot, onActivate });

    await user.click(screen.getByRole("button", { name: "¿Olvidaste tu usuario o contraseña?" }));
    await user.click(screen.getByRole("button", { name: "Activa tu usuario" }));
    expect(onForgot).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("no envía el formulario al pulsar los enlaces", async () => {
    const user = userEvent.setup();
    const { onSubmit } = montar({ onForgot: vi.fn(), onActivate: vi.fn() });

    await user.click(screen.getByRole("button", { name: "¿Olvidaste tu usuario o contraseña?" }));
    await user.click(screen.getByRole("button", { name: "Activa tu usuario" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("todos los textos se pueden sustituir", () => {
    montar({
      labels: { username: "Cédula", password: "Clave", remember: "No cerrar sesión", submit: "Ingresar" },
    });

    expect(screen.getByLabelText("Cédula")).toBeInTheDocument();
    expect(screen.getByLabelText("Clave")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "No cerrar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("el contenido propio entra entre los campos y el botón", () => {
    montar({ children: <p>Sede: Medellín</p> });
    expect(screen.getByText("Sede: Medellín")).toBeInTheDocument();
  });
});
