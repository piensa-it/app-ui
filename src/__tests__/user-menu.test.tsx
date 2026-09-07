import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UiProvider } from "../components/providers/UiProvider";
import { UserMenu } from "../components/layout/user-menu";

const usuario = { name: "Andrés Montoya", email: "andres@piensait.com", role: "Cajera", avatarColor: "350 75% 45%" };

const montar = (props: Partial<React.ComponentProps<typeof UserMenu>> = {}) => {
  const onProfile = vi.fn();
  const onSettings = vi.fn();
  const onSignOut = vi.fn();
  render(
    <UiProvider>
      <UserMenu user={usuario} onProfile={onProfile} onSettings={onSettings} onSignOut={onSignOut} {...props} />
    </UiProvider>,
  );
  return { onProfile, onSettings, onSignOut };
};

// Una sola instancia de userEvent por prueba, con `findByRole` antes de cada
// clic: Ark monta el menú en el siguiente tick y pinta los items después.
const user = userEvent.setup();

const abrir = async () => {
  await user.click(screen.getByRole("button", { name: "Andrés Montoya" }));
  const menu = await screen.findByRole("menu");
  // El nodo existe antes de que la máquina de Ark esté en «abierto», y un
  // clic en ese intervalo se ignora: se espera al estado, no al DOM.
  await waitFor(() => expect(menu).toHaveAttribute("data-state", "open"));
  return menu;
};

// Zag solo dispara `onSelect` si el ítem quedó resaltado ANTES del clic, y el
// resaltado del pointerdown se aplica en el siguiente tick: hay que esperarlo.
// Es el mismo patrón de menu.test.tsx; un `user.click` de userEvent encadena
// los dos eventos sin esa espera y Ark descarta la selección en silencio.
const elegir = async (nombre: string) => {
  const item = await screen.findByRole("menuitem", { name: nombre });
  fireEvent.pointerDown(item, { pointerType: "mouse" });
  await waitFor(() => expect(item).toHaveAttribute("data-highlighted"));
  fireEvent.click(item);
};

/**
 * Cada aplicación se escribía su desplegable de usuario y cada uno se desviaba
 * de los otros en orden, iconos y comportamiento (#97). Lo que se fija aquí es
 * justo eso: quién es, qué hay dentro y en qué orden.
 */
describe("UserMenu · el disparador", () => {
  it("es la persona: iniciales sobre su color, nombre y rol", () => {
    montar();
    const boton = screen.getByRole("button", { name: "Andrés Montoya" });
    expect(boton).toHaveTextContent("AM");
    expect(boton).toHaveTextContent("Cajera");
    const avatar = boton.querySelector("[data-scope='avatar']") as HTMLElement;
    expect(avatar.style.backgroundColor).not.toBe("");
  });

  it("sin color propio, las iniciales van sobre el color de marca", () => {
    montar({ user: { name: "Andrés Montoya" } });
    const avatar = screen.getByRole("button", { name: "Andrés Montoya" }).querySelector("[data-scope='avatar']") as HTMLElement;
    expect(avatar.className).toMatch(/bg-primary/);
  });

  it("con foto, la muestra en vez de las iniciales", () => {
    montar({ user: { ...usuario, avatarSrc: "https://example.test/foto.png" } });
    const boton = screen.getByRole("button", { name: "Andrés Montoya" });
    expect(boton.querySelector("img")).toHaveAttribute("src", "https://example.test/foto.png");
  });

  it("el nombre está en el nombre accesible aunque no se vea", () => {
    // En pantallas estrechas solo queda el avatar; el botón sigue diciendo
    // quién es.
    montar();
    expect(screen.getByRole("button", { name: "Andrés Montoya" })).toHaveAttribute("aria-label", "Andrés Montoya");
  });
});

describe("UserMenu · lo que hay dentro, y en qué orden", () => {
  it("cabecera con nombre y correo, y las tres acciones en orden", async () => {
    montar();
    const menu = await abrir();
    expect(menu).toHaveTextContent("andres@piensait.com");
    const items = within(menu).getAllByRole("menuitem").map((i) => i.textContent?.trim());
    expect(items).toEqual(["Mi perfil", "Configuración", "Cerrar sesión"]);
  });

  it("las acciones propias de la aplicación van entre configuración y cerrar sesión", async () => {
    montar({ items: [{ id: "ayuda", label: "Ayuda", onSelect: vi.fn() }] });
    const menu = await abrir();
    const items = within(menu).getAllByRole("menuitem").map((i) => i.textContent?.trim());
    expect(items).toEqual(["Mi perfil", "Configuración", "Ayuda", "Cerrar sesión"]);
  });

  it("sin `onProfile` ni `onSettings` no pinta esas entradas", async () => {
    montar({ onProfile: undefined, onSettings: undefined });
    const menu = await abrir();
    expect(within(menu).getAllByRole("menuitem").map((i) => i.textContent?.trim())).toEqual(["Cerrar sesión"]);
  });

  it("cada entrada llama a lo suyo", async () => {
    const { onProfile, onSettings } = montar();
    await abrir();
    // Ark dispara `onSelect` en el siguiente tick, no en el mismo clic.
    await elegir("Mi perfil");
    await waitFor(() => expect(onProfile).toHaveBeenCalledTimes(1));
    await abrir();
    await elegir("Configuración");
    await waitFor(() => expect(onSettings).toHaveBeenCalledTimes(1));
  });

  it("los textos se pueden sustituir", async () => {
    montar({ labels: { profile: "My profile", signOut: "Sign out" } });
    const menu = await abrir();
    expect(within(menu).getByRole("menuitem", { name: "My profile" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
  });
});

describe("UserMenu · cerrar sesión", () => {
  it("sin confirmación, cierra al primer clic", async () => {
    const { onSignOut } = montar();
    await abrir();
    await elegir("Cerrar sesión");
    await waitFor(() => expect(onSignOut).toHaveBeenCalledTimes(1));
  });

  it("con `confirmSignOut`, pide confirmación y solo cierra al confirmar", async () => {
    const { onSignOut } = montar({ confirmSignOut: true });
    await abrir();
    await elegir("Cerrar sesión");
    expect(onSignOut).not.toHaveBeenCalled();
    const dialogo = await screen.findByRole("alertdialog");
    expect(dialogo).toHaveTextContent("¿Cerrar la sesión?");
    // Es el AlertDialogHost de UiProvider, no una capa propia.
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    await user.click(within(dialogo).getByRole("button", { name: "Cerrar sesión" }));
    await waitFor(() => expect(onSignOut).toHaveBeenCalledTimes(1));
  });

  it("cancelar la confirmación no cierra la sesión", async () => {
    const { onSignOut } = montar({ confirmSignOut: true });
    await abrir();
    await elegir("Cerrar sesión");
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(onSignOut).not.toHaveBeenCalled();
  });
});
