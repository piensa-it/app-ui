import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotificationsMenu, type NotificationItem } from "../components/layout/notifications-menu";

const avisos: NotificationItem[] = [
  { id: "a", title: "Conciliación pendiente", description: "3 diferencias en agosto", time: "Hace 5 min", unread: true },
  { id: "b", title: "Pago aprobado", description: "Servicios Andinos", time: "Ayer", unread: true },
  { id: "c", title: "Extracto descargado", time: "Hace 3 días" },
];

/**
 * La campana estándar de la barra superior. Lo que se fija: el número de
 * pendientes en el botón y en su nombre accesible, el panel con las
 * notificaciones y qué se anuncia como no leído, y que elegir una avisa a
 * la aplicación.
 */
describe("NotificationsMenu", () => {
  it("cuenta las no leídas en el botón y en su nombre accesible", () => {
    render(<NotificationsMenu items={avisos} />);
    const boton = screen.getByRole("button", { name: "Notificaciones, 2 sin leer" });
    expect(boton).toHaveTextContent("2");
  });

  it("sin pendientes no hay número y el nombre es solo «Notificaciones»", () => {
    render(<NotificationsMenu items={[{ id: "c", title: "Leída" }]} />);
    expect(screen.getByRole("button", { name: "Notificaciones" })).not.toHaveTextContent(/\d/);
  });

  it("abre el panel con las notificaciones, marca las no leídas y avisa al elegir una", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onViewAll = vi.fn();
    render(<NotificationsMenu items={avisos} onSelect={onSelect} onViewAll={onViewAll} onMarkAllRead={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Notificaciones/ }));
    const panel = await screen.findByRole("dialog");
    expect(within(panel).getByText("Conciliación pendiente")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Sin leer:.*Conciliación pendiente/ })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Extracto descargado/ })).not.toHaveTextContent("Sin leer");
    expect(within(panel).getByRole("button", { name: "Marcar todo como leído" })).toBeInTheDocument();
    await user.click(within(panel).getByRole("button", { name: /Pago aprobado/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
    await user.click(within(panel).getByRole("button", { name: "Ver todas" }));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it("sin notificaciones lo dice, y sin `onViewAll` no hay pie", () => {
    render(<NotificationsMenu items={[]} open />);
    const panel = screen.getByRole("dialog");
    expect(within(panel).getByText("No hay notificaciones.")).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: "Ver todas" })).not.toBeInTheDocument();
  });
});
