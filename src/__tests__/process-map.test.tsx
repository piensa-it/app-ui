import ELK from "elkjs/lib/elk.bundled.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { C4Diagram, ProcessMap, cargarMotorElk, distribucionASvg, distribuirNivel, medirNodo, resolverColores, type ElementoC4 } from "../diagramas";
import { cicloCoreLink, gruposCoreLink } from "../components/diagramas/ejemplos/mapa-corelink";
import { etapasDeNivel } from "../components/diagramas/etapas";
import { MARGEN_LIENZO, ZOOM_LEGIBLE, calcularEncuadre } from "../components/diagramas/encuadre";

const motor = new ELK();

function simularAncho(movil: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((consulta: string) => ({
      matches: movil,
      media: consulta,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProcessMap", () => {
  it("pinta el nivel con cada proceso como botón y describe el diagrama", async () => {
    render(<ProcessMap raiz={cicloCoreLink} grupos={gruposCoreLink} motor={motor} />);
    expect(screen.getByRole("heading", { name: "Ciclo de la empresa" })).toBeInTheDocument();
    const logistica = await screen.findByRole("button", { name: /Logística/ });
    expect(logistica).toHaveAttribute("tabindex", "0");
    expect(screen.getAllByRole("button", { name: /Inventario|Obligaciones|Cartera|Nómina|Cierre/ }).length).toBeGreaterThanOrEqual(5);
    const diagrama = screen.getByRole("group", { name: "Ciclo de la empresa" });
    expect(diagrama).toHaveAccessibleDescription(/13 procesos y 17 flujos.*Gestión documental hacia Cuentas por pagar \(radicado\)/);
    expect(diagrama).toHaveAttribute("aria-busy", "false");
  });

  it("baja a un proceso con hijos, mueve el foco a su título y sube con la miga de pan", async () => {
    const onNivelChange = vi.fn();
    render(<ProcessMap raiz={cicloCoreLink} grupos={gruposCoreLink} motor={motor} onNivelChange={onNivelChange} />);
    await userEvent.click(await screen.findByRole("button", { name: /^Compras/ }));

    const titulo = screen.getByRole("heading", { name: "Compras", level: 2 });
    expect(titulo).toHaveFocus();
    expect(onNivelChange).toHaveBeenLastCalledWith([cicloCoreLink, cicloCoreLink.hijos![1]]);
    expect(await screen.findByRole("button", { name: /Requisición/ })).toBeInTheDocument();
    // El proceso en el que se está muestra su detalle y sus enlaces.
    expect(screen.getByRole("complementary", { name: "Compras" })).toHaveTextContent("Cruce de 3 vías");

    const miga = screen.getByRole("navigation", { name: "Niveles del mapa" });
    await userEvent.click(within(miga).getByRole("button", { name: "Ciclo de la empresa" }));
    expect(screen.getByRole("heading", { name: "Ciclo de la empresa" })).toHaveFocus();
    expect(onNivelChange).toHaveBeenLastCalledWith([cicloCoreLink]);
  });

  it("con teclado abre el detalle de un proceso y sus enlaces llaman a onEnlace", async () => {
    const onEnlace = vi.fn();
    render(<ProcessMap raiz={cicloCoreLink} grupos={gruposCoreLink} motor={motor} onEnlace={onEnlace} />);
    const cxp = await screen.findByRole("button", { name: /^Cuentas por pagar/ });
    cxp.focus();
    fireEvent.keyDown(cxp, { key: "Enter" });
    expect(cxp).toHaveAttribute("aria-pressed", "true");

    const panel = screen.getByRole("complementary", { name: "Cuentas por pagar" });
    await userEvent.click(within(panel).getByRole("button", { name: "Abrir Cuentas por pagar" }));
    expect(onEnlace).toHaveBeenCalledWith("/cxp");

    fireEvent.keyDown(screen.getByRole("button", { name: /^Cuentas por pagar/ }), { key: " " });
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("sin onEnlace, los enlaces son links de verdad", async () => {
    render(<ProcessMap raiz={cicloCoreLink} motor={motor} vista="etapas" />);
    await userEvent.click(screen.getByRole("button", { name: /Ventas/ }));
    expect(screen.getByRole("link", { name: "Abrir Ventas" })).toHaveAttribute("href", "/ventas");
  });

  it("en móvil muestra la lista de etapas y no carga ELK", async () => {
    simularAncho(true);
    const espia = { layout: vi.fn(motor.layout.bind(motor)) };
    render(<ProcessMap raiz={cicloCoreLink} motor={espia} />);
    const lista = screen.getByRole("list", { name: "Etapas de Ciclo de la empresa" });
    expect(within(lista).getByRole("heading", { name: "Etapa 1" })).toBeInTheDocument();
    expect(within(lista).getByRole("heading", { name: "Transversal" })).toBeInTheDocument();
    expect(within(lista).getByRole("heading", { name: "Base" })).toBeInTheDocument();
    expect(within(lista).getByText(/→ Cuentas por pagar \(radicado\)/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Exportar SVG" })).not.toBeInTheDocument();
    expect(espia.layout).not.toHaveBeenCalled();
  });

  it("en escritorio pinta el lienzo", async () => {
    simularAncho(false);
    render(<ProcessMap raiz={cicloCoreLink} motor={motor} />);
    expect(await screen.findByRole("button", { name: /Logística/ })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /Etapas/ })).not.toBeInTheDocument();
  });

  it("exporta el nivel como SVG", async () => {
    const crear = vi.fn(() => "blob:svg");
    vi.stubGlobal("URL", Object.assign(Object.create(URL), { createObjectURL: crear, revokeObjectURL: vi.fn() }));
    const clic = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<ProcessMap raiz={cicloCoreLink} grupos={gruposCoreLink} motor={motor} />);
    const boton = screen.getByRole("button", { name: "Exportar SVG" });
    await waitFor(() => expect(boton).toBeEnabled());
    await userEvent.click(boton);
    expect(crear).toHaveBeenCalledTimes(1);
    expect(clic).toHaveBeenCalledTimes(1);
    clic.mockRestore();
  });

  it("avisa si la distribución falla", async () => {
    render(<ProcessMap raiz={cicloCoreLink} motor={{ layout: () => Promise.reject(new Error("sin ELK")) }} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo distribuir el diagrama.");
  });
});

describe("distribucionASvg", () => {
  it("es un SVG autónomo con carriles, bandas, aristas y etiquetas", async () => {
    const d = await distribuirNivel(cicloCoreLink, motor, { grupos: gruposCoreLink });
    const svg = distribucionASvg(d, cicloCoreLink, { grupos: gruposCoreLink, colores: resolverColores(null) });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("Venta y recaudo");
    expect(svg).toContain("TRANSVERSAL");
    expect(svg).toContain("recompra ×N");
    expect(svg.match(/marker-end/g)).toHaveLength(17);
    expect(svg).toContain("hsl(var(--primary))");
    expect(new DOMParser().parseFromString(svg, "image/svg+xml").querySelector("parsererror")).toBeNull();
  });
});

describe("etapasDeNivel", () => {
  it("ordena por el camino más largo y rompe los ciclos en su vuelta", () => {
    const { etapas } = etapasDeNivel({
      hijos: [{ id: "a", etiqueta: "A" }, { id: "b", etiqueta: "B" }, { id: "c", etiqueta: "C" }],
      aristas: [
        { desde: "a", hasta: "b" },
        { desde: "b", hasta: "c" },
        { desde: "c", hasta: "a" },
        { desde: "a", hasta: "c" },
      ],
    });
    expect(etapas.map((e) => e.map((n) => n.id))).toEqual([["a"], ["b"], ["c"]]);
  });
});

describe("cargarMotorElk", () => {
  it("carga ELK una sola vez y distribuye", async () => {
    const primero = cargarMotorElk();
    expect(cargarMotorElk()).toBe(primero);
    const d = await distribuirNivel({ hijos: [{ id: "a", etiqueta: "A" }, { id: "b", etiqueta: "B" }], aristas: [{ desde: "a", hasta: "b" }] }, await primero);
    expect(d.aristas).toHaveLength(1);
    expect(medirNodo({ etiqueta: "A" }).ancho).toBeGreaterThan(0);
  });
});

const banca: ElementoC4 = {
  id: "banca",
  nombre: "Banca en línea",
  tipo: "sistema",
  limites: [{ id: "empresa", etiqueta: "Banco Ejemplo" }],
  hijos: [
    { id: "cliente", nombre: "Cliente", tipo: "persona", descripcion: "Titular de cuentas" },
    {
      id: "app",
      nombre: "Banca en línea",
      tipo: "sistema",
      limite: "empresa",
      hijos: [
        { id: "spa", nombre: "Aplicación web", tipo: "contenedor", tecnologia: "React" },
        { id: "api", nombre: "API", tipo: "contenedor", tecnologia: "Node.js", hijos: [{ id: "auth", nombre: "Autenticación", tipo: "componente" }] },
      ],
      relaciones: [{ desde: "spa", hasta: "api", descripcion: "Consulta", tecnologia: "JSON/HTTPS" }],
    },
    { id: "correo", nombre: "Correo", tipo: "sistema", externo: true, limite: "empresa" },
  ],
  relaciones: [
    { desde: "cliente", hasta: "app", descripcion: "Usa" },
    { desde: "app", hasta: "correo", descripcion: "Envía avisos", asincrona: true },
  ],
};

describe("C4Diagram", () => {
  it("recorre contexto, contenedores y componentes", async () => {
    render(<C4Diagram raiz={banca} motor={motor} />);
    expect(screen.getByText("Contexto")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Correo/ })).toHaveTextContent("Sistema externo");

    await userEvent.click(screen.getByRole("button", { name: /^Sistema.*Banca en línea/ }));
    expect(screen.getByText("Contenedores")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /API/ })).toHaveTextContent("Contenedor · Node.js");

    await userEvent.click(screen.getByRole("button", { name: /API/ }));
    expect(screen.getByText("Componentes")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Autenticación/ })).toBeInTheDocument();
  });
});

describe("conexiones transversales", () => {
  const visibles = () => [...document.querySelectorAll("[data-arista]")].map((e) => e.getAttribute("data-arista"));

  it("en el nivel 1 se ocultan hasta resaltar un proceso, y el interruptor las muestra todas", async () => {
    render(<ProcessMap raiz={cicloCoreLink} grupos={gruposCoreLink} motor={motor} />);
    const tesoreria = await screen.findByRole("button", { name: /^Tesorería/ });
    expect(visibles()).toHaveLength(8); // solo el flujo principal

    fireEvent.mouseEnter(tesoreria);
    // cxp>tes, cxc>tes y tes>cont aparecen; los procesos que no son vecinos se atenúan.
    expect(visibles()).toHaveLength(11);
    expect(screen.getByRole("button", { name: /^Ventas/ })).toHaveAttribute("data-atenuado", "true");
    expect(screen.getByRole("button", { name: /^Cuentas por cobrar/ })).not.toHaveAttribute("data-atenuado");
    fireEvent.mouseLeave(tesoreria);
    expect(visibles()).toHaveLength(8);

    await userEvent.click(screen.getByRole("switch", { name: "Mostrar todas las conexiones" }));
    expect(visibles()).toHaveLength(17);
  });

  it("con conexionesTransversales=\"siempre\" se ven todas y no hay interruptor", async () => {
    render(<ProcessMap raiz={cicloCoreLink} grupos={gruposCoreLink} motor={motor} conexionesTransversales="siempre" />);
    await screen.findByRole("button", { name: /^Tesorería/ });
    expect(visibles()).toHaveLength(17);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });
});

describe("calcularEncuadre", () => {
  it("si cabe, encuadra entero hasta zoom 1 y centrado", () => {
    const e = calcularEncuadre(400, 200, { ancho: 1000, alto: 400 });
    expect(e).toMatchObject({ zoom: 1, desborda: false, x: 300 });
  });

  it("si no cabe a lo ancho, nunca baja del zoom legible y alinea al principio", () => {
    const e = calcularEncuadre(3000, 600, { ancho: 1200, alto: 700 });
    expect(e.zoom).toBeCloseTo(ZOOM_LEGIBLE);
    expect(14 * e.zoom).toBeGreaterThanOrEqual(12 - 1e-9);
    expect(e).toMatchObject({ desborda: true, x: MARGEN_LIENZO });
  });
});
