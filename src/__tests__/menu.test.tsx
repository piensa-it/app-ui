import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../components/ui/menu";
import { Button } from "../components/ui/button";

describe("Menu", () => {
  it("no muestra las opciones hasta que se abre", () => {
    render(
      <Menu>
        <MenuTrigger>
          <Button>Acciones</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="edit">Editar</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.queryByRole("menuitem", { name: "Editar" })).not.toBeInTheDocument();
  });

  it("abre el menú al hacer click en el trigger y muestra las opciones", async () => {
    render(
      <Menu>
        <MenuTrigger>
          <Button>Acciones</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="edit">Editar</MenuItem>
          <MenuItem value="delete" variant="destructive">
            Eliminar
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    expect(await screen.findByRole("menuitem", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("llama a onSelect al elegir una opción", async () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>
          <Button>Acciones</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="edit" onSelect={onSelect}>
            Editar
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));
    const item = await screen.findByRole("menuitem", { name: "Editar" });
    // Ark UI (zag-js) solo dispara onSelect si el ítem quedó "highlighted"
    // antes del click — eso lo hace el propio pointerdown real en un browser.
    // `pointerType: "mouse"` replica el evento real (zag-js sí distingue
    // mouse/touch/pen en otros handlers del ítem, aunque no en éste).
    // La máquina de estados de zag-js procesa el `send()` del pointerdown de
    // forma asíncrona (no en el mismo tick síncrono en que se despacha el
    // evento) — por eso hay que esperar a que `data-highlighted` aparezca en
    // el DOM antes de disparar el click. Si se encadenan pointerdown+click
    // sin ese `await`, el click siempre llega con `highlightedValue` en
    // `null` (la actualización aún no se aplicó) y Ark descarta la selección
    // en silencio, sin lanzar error.
    fireEvent.pointerDown(item, { pointerType: "mouse" });
    await waitFor(() => expect(item).toHaveAttribute("data-highlighted"));
    fireEvent.click(item);

    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
  });

  it("no dispara onSelect en un ítem deshabilitado", async () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>
          <Button>Acciones</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="edit" onSelect={onSelect} disabled>
            Editar
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Editar" }));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
