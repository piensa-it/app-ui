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
    fireEvent.click(await screen.findByRole("menuitem", { name: "Editar" }));

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
