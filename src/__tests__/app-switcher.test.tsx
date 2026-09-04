import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppSwitcher, type AppSwitcherGroup } from "../components/ui/app-switcher";

const Icono = ({ className }: { className?: string }) => <svg className={className} data-testid="icono" />;

/** Quince opciones en cuatro grupos, como los módulos de CoreLink. */
const grupos: AppSwitcherGroup[] = [
  {
    id: "dian",
    label: "Electrónico · DIAN",
    items: [
      { id: "ventas", label: "Ventas", description: "Cotizar, vender y facturar electrónicamente.", icon: Icono },
      { id: "compras", label: "Compras", description: "Órdenes, recepción y facturas de proveedor.", icon: Icono },
      { id: "nomina", label: "Nómina", description: "Liquidación y nómina electrónica.", icon: Icono },
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    items: [
      { id: "tesoreria", label: "Tesorería", description: "Caja, bancos y conciliación.", icon: Icono },
      { id: "cxc", label: "Cuentas por cobrar", description: "Cartera, recaudo y mora.", icon: Icono },
      { id: "cxp", label: "Cuentas por pagar", description: "Obligaciones y pagos programados.", icon: Icono },
      { id: "contabilidad", label: "Contabilidad", description: "Asientos, cierres y estados financieros.", icon: Icono },
    ],
  },
  {
    id: "operacion",
    label: "Operación",
    items: [
      { id: "inventario", label: "Inventario", description: "Existencias, bodegas y traslados.", icon: Icono },
      { id: "produccion", label: "Producción", description: "Órdenes de fabricación y consumos.", icon: Icono },
      { id: "logistica", label: "Logística", description: "Despachos y rutas.", icon: Icono },
      { id: "activos", label: "Activos fijos", description: "Depreciación y control de activos.", icon: Icono },
    ],
  },
  {
    id: "gestion",
    label: "Gestión",
    items: [
      { id: "crm", label: "CRM", description: "Clientes, oportunidades y seguimiento.", icon: Icono },
      { id: "proyectos", label: "Proyectos", description: "Tareas, horas y rentabilidad.", icon: Icono },
      { id: "reportes", label: "Reportes", description: "Tableros e informes.", icon: Icono },
      { id: "ajustes", label: "Ajustes", description: "Configuración y usuarios.", icon: Icono },
    ],
  },
];

const montar = (props: Partial<React.ComponentProps<typeof AppSwitcher>> = {}) => {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <AppSwitcher
      open
      onOpenChange={onOpenChange}
      title="Cambiar de módulo"
      groups={grupos}
      onSelect={onSelect}
      {...props}
    />,
  );
  return { onSelect, onOpenChange };
};

/**
 * Un desplegable no sirve para elegir entre quince cosas: en CoreLink medía
 * 921 px en una ventana de 800, sobresalía 239 y su contenedor recortaba sin
 * dejar desplazarse. Y no tenía sitio para decir de qué va cada opción (#77).
 * Cada decisión de abajo costó una iteración allá.
 */
describe("AppSwitcher · lo que se ve", () => {
  it("enseña las quince opciones con su descripción", () => {
    montar();
    expect(screen.getAllByRole("option")).toHaveLength(15);
    expect(screen.getByText("Cartera, recaudo y mora.")).toBeInTheDocument();
  });

  it("usa listbox y option, no menuitem", () => {
    montar();
    expect(screen.getByRole("listbox", { name: "Cambiar de módulo" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("los iconos van en el color de marca, todos iguales", () => {
    // Una opción no es una noticia: teñirla de verde o ámbar le presta un
    // significado que no tiene y gasta los tonos con los que un tablero avisa.
    montar();
    const cajas = screen.getAllByTestId("icono").map((svg) => svg.parentElement as HTMLElement);
    expect(cajas.every((caja) => caja.className.includes("text-primary"))).toBe(true);
  });

  it("la ventana no crece con el contenido: la lista se desplaza dentro", () => {
    montar();
    expect(screen.getByRole("listbox").className).toMatch(/overflow-y-auto/);
    expect(screen.getByRole("dialog").className).toMatch(/max-h-\[min\(/);
  });
});

describe("AppSwitcher · recientes", () => {
  it("salen primero y no incluyen la activa", () => {
    montar({ recent: ["tesoreria", "compras"], activeId: "tesoreria" });
    const recientes = screen.getByRole("region", { name: "Recientes" });
    const nombres = within(recientes).getAllByRole("option").map((o) => o.textContent);
    expect(nombres.some((n) => n?.includes("Compras"))).toBe(true);
    expect(nombres.some((n) => n?.includes("Tesorería"))).toBe(false);
    // Y es la primera sección de la lista.
    expect(screen.getByRole("listbox").firstElementChild).toBe(recientes);
  });

  it("una opción puede salir dos veces: en recientes y en su grupo", () => {
    // Quitarla del grupo deja huecos en la cuadrícula. Quien la busque en una
    // prueba tiene que desambiguar con `.first()`.
    montar({ recent: ["compras"] });
    expect(screen.getAllByRole("option", { name: /Compras/ })).toHaveLength(2);
  });

  it("la activa se marca como «aquí estás» y elegirla no cambia nada", async () => {
    const { onSelect, onOpenChange } = montar({ activeId: "ventas" });
    const activa = screen.getByRole("option", { name: /Ventas/ });
    expect(activa).toHaveAttribute("aria-current", "true");
    await userEvent.click(activa);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("AppSwitcher · buscador", () => {
  it("filtra por nombre sin distinguir tildes", async () => {
    montar();
    await userEvent.type(screen.getByRole("combobox"), "nomina");
    const opciones = screen.getAllByRole("option");
    expect(opciones).toHaveLength(1);
    expect(opciones[0]).toHaveTextContent("Nómina");
  });

  it("filtra por descripción: «cartera» encuentra Cuentas por cobrar", async () => {
    montar();
    await userEvent.type(screen.getByRole("combobox"), "cartera");
    expect(screen.getByRole("option", { name: /Cuentas por cobrar/ })).toBeInTheDocument();
  });

  it("buscando no hay recientes ni grupos, solo resultados", async () => {
    montar({ recent: ["compras"] });
    await userEvent.type(screen.getByRole("combobox"), "c");
    expect(screen.queryByRole("region", { name: "Recientes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Finanzas" })).not.toBeInTheDocument();
    // Y la que estaba repetida sale una sola vez.
    expect(screen.getAllByRole("option", { name: /Compras/ })).toHaveLength(1);
  });

  it("sin coincidencias lo dice", async () => {
    montar();
    await userEvent.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No hay nada que coincida.")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});

describe("AppSwitcher · teclado en patrón de combobox", () => {
  it("se escribe, se mueve con las flechas y se confirma con Enter sin soltar el buscador", async () => {
    const { onSelect } = montar();
    const buscador = screen.getByRole("combobox");
    await userEvent.type(buscador, "cuentas");
    await userEvent.keyboard("{ArrowDown}");
    // Con foco itinerante habría que salir de la caja para moverse; aquí el
    // foco sigue en ella y el resaltado viaja por `aria-activedescendant`.
    expect(document.activeElement).toBe(buscador);
    const resaltada = document.getElementById(buscador.getAttribute("aria-activedescendant") ?? "");
    expect(resaltada).toHaveTextContent("Cuentas por pagar");
    expect(resaltada).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("cxp", expect.objectContaining({ id: "cxp" }));
  });

  it("las flechas dan la vuelta por los extremos", async () => {
    montar();
    const buscador = screen.getByRole("combobox");
    await userEvent.type(buscador, "cuentas");
    await userEvent.keyboard("{ArrowUp}");
    const resaltada = document.getElementById(buscador.getAttribute("aria-activedescendant") ?? "");
    expect(resaltada).toHaveTextContent("Cuentas por pagar");
  });

  // Que el foco EMPIECE en el buscador lo enfoca la trampa de foco de Ark,
  // que no corre en jsdom: se comprueba en el navegador
  // (tests/browser/storybook.spec.ts).
});

describe("AppSwitcher · pie", () => {
  it("lleva el recordatorio de la paleta de comandos cuando la aplicación lo pasa", () => {
    montar({ hint: <>Para buscar pantallas, <kbd>Ctrl</kbd> <kbd>K</kbd>.</> });
    expect(screen.getByText(/Para buscar pantallas/)).toBeInTheDocument();
  });
});

/** Pocas opciones importantes: cambiar de empresa cambia el mundo (#78). */
const empresas: AppSwitcherGroup[] = [
  {
    id: "empresas",
    label: "Empresas",
    items: [
      {
        id: "acme",
        label: "Acme S.A.",
        icon: Icono,
        details: [
          { label: "NIT", value: "900000000-1" },
          { label: "Entras como", value: "Administrador" },
        ],
      },
      {
        id: "beta",
        label: "Beta S.A.S.",
        icon: Icono,
        badge: { label: "Pruebas", tone: "warning" },
        details: [
          { label: "NIT", value: "800000000-2" },
          { label: "Entras como", value: "Contador" },
        ],
      },
    ],
  },
];

const confirmar = {
  title: (item: { label: string }) => `Cambiar a ${item.label}`,
  description: "Cambia todo: los datos que ves, los permisos con los que entras y la empresa que emite lo que factures.",
  confirmLabel: "Cambiar de empresa",
};

describe("AppSwitcher · detalles por opción", () => {
  it("cada opción enseña sus detalles en filas, no en una línea", () => {
    montar({ groups: empresas, title: "Cambiar de empresa" });
    const beta = screen.getByRole("option", { name: /Beta/ });
    const filas = within(beta).getAllByRole("term");
    expect(filas.map((f) => f.textContent)).toEqual(["NIT", "Entras como"]);
    expect(within(beta).getByText("800000000-2")).toBeInTheDocument();
    expect(within(beta).getByText("Pruebas")).toBeInTheDocument();
  });
});

describe("AppSwitcher · confirmación en dos pasos", () => {
  it("elegir lleva a un segundo paso que dice qué cambia y repite los detalles", async () => {
    const { onSelect } = montar({ groups: empresas, title: "Cambiar de empresa", confirm: confirmar });
    await userEvent.click(screen.getByRole("option", { name: /Beta/ }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Cambiar a Beta S.A.S." })).toBeInTheDocument();
    expect(screen.getByText(/Cambia todo/)).toBeInTheDocument();
    // Quien confirma tiene que ver el NIT y el rol otra vez.
    expect(screen.getByText("800000000-2")).toBeInTheDocument();
    expect(screen.getByText("Contador")).toBeInTheDocument();
  });

  it("no monta una segunda capa modal", async () => {
    montar({ groups: empresas, title: "Cambiar de empresa", confirm: confirmar });
    await userEvent.click(screen.getByRole("option", { name: /Beta/ }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    // Y la lista ya no está: es el mismo panel en su segundo paso.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("desde el segundo paso se vuelve a la lista sin elegir", async () => {
    const { onSelect, onOpenChange } = montar({ groups: empresas, title: "Cambiar de empresa", confirm: confirmar });
    await userEvent.click(screen.getByRole("option", { name: /Beta/ }));
    await userEvent.click(screen.getByRole("button", { name: /Volver/ }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("confirmar elige y cierra", async () => {
    const { onSelect, onOpenChange } = montar({ groups: empresas, title: "Cambiar de empresa", confirm: confirmar });
    await userEvent.click(screen.getByRole("option", { name: /Beta/ }));
    await userEvent.click(screen.getByRole("button", { name: "Cambiar de empresa" }));
    expect(onSelect).toHaveBeenCalledWith("beta", expect.objectContaining({ id: "beta" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("la activa no dispara confirmación", async () => {
    const { onSelect, onOpenChange } = montar({ groups: empresas, title: "Cambiar de empresa", confirm: confirmar, activeId: "acme" });
    await userEvent.click(screen.getByRole("option", { name: /Acme/ }));
    expect(screen.queryByRole("heading", { name: /Cambiar a/ })).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("con Enter desde el buscador también se llega al segundo paso", async () => {
    montar({ groups: empresas, title: "Cambiar de empresa", confirm: confirmar });
    await userEvent.type(screen.getByRole("combobox"), "beta");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Cambiar a Beta S.A.S." })).toBeInTheDocument();
  });

  it("sin `confirm` se elige al primer clic, como antes", async () => {
    const { onSelect } = montar({ groups: empresas, title: "Cambiar de empresa" });
    await userEvent.click(screen.getByRole("option", { name: /Beta/ }));
    expect(onSelect).toHaveBeenCalledWith("beta", expect.anything());
  });
});
