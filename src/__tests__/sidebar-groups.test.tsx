import { beforeAll, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import path from "node:path";
import { readFileSync } from "node:fs";

import { AppShell } from "../components/layout/app-shell";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "../components/layout/sidebar-nav";

/**
 * Compila el CSS real de Tailwind y lo inyecta en jsdom. Hace falta porque lo
 * que se comprueba aquí es una distancia: qué separa un grupo del siguiente
 * frente a lo que separa dos enlaces del mismo grupo. Mirar la lista de clases
 * no diría si el resultado agrupa o no.
 */
beforeAll(async () => {
  const preset = (await import(path.resolve(process.cwd(), "tailwind-preset.js"))).default;
  const result = await postcss([
    tailwindcss({
      presets: [preset],
      content: [path.resolve(process.cwd(), "src/components/**/*.tsx")],
    }),
  ]).process("@tailwind base; @tailwind utilities;", { from: undefined });
  const style = document.createElement("style");
  style.textContent = result.css;
  document.head.appendChild(style);
  // La separación entre secciones vive en la hoja del componente.
  const propia = document.createElement("style");
  propia.textContent = readFileSync(
    path.resolve(process.cwd(), "src/components/layout/sidebar.css"),
    "utf8",
  );
  document.head.appendChild(propia);

  const tokens = document.createElement("style");
  tokens.textContent = `:root {
    --space-2xs: 0.25rem; --space-xs: 0.5rem; --space-sm: 0.75rem;
    --space-md: 1rem; --space-lg: 1.5rem; --space-xl: 2rem; --space-2xl: 3rem;
  }`;
  document.head.appendChild(tokens);
});

/** La escala de espaciado, en rem, para traducir lo que devuelve jsdom. */
const ESCALA: Record<string, number> = {
  "--space-2xs": 0.25,
  "--space-xs": 0.5,
  "--space-sm": 0.75,
  "--space-md": 1,
  "--space-lg": 1.5,
  "--space-xl": 2,
  "--space-2xl": 3,
};

/**
 * jsdom no resuelve `var()` al calcular estilos: devuelve la referencia tal
 * cual. Se traduce al paso de la escala, que es justo lo que hay que comparar.
 */
function separacion(valor: string | null | undefined): number {
  // jsdom reporta el atajo `gap`, no `rowGap`, y sin resolver la variable.
  if (!valor || valor === "normal") return 0;
  const variable = /var\((--space-[a-z0-9]+)\)/.exec(valor);
  if (variable) return ESCALA[variable[1]] ?? 0;
  const numero = Number.parseFloat(valor);
  return Number.isNaN(numero) ? 0 : numero;
}

/**
 * Con el CSS real, el menú fijo está oculto al ancho por defecto de jsdom, así
 * que no aparece en el árbol accesible. Se consulta el nodo directamente: lo
 * que se mide son distancias, no lo que anuncia un lector de pantalla.
 */
const navegacionDeEscritorio = () => document.querySelector("aside nav") as HTMLElement;

function menu(props: { collapsed?: boolean } = {}) {
  return render(
    <AppShell defaultCollapsed={props.collapsed} brand={<SidebarBrand name="Acme" />} sidebar={
      <SidebarNav>
        <SidebarNavGroup label="Operación">
          <SidebarNavItem icon={<span />}>Movimientos</SidebarNavItem>
          <SidebarNavItem icon={<span />}>Clientes</SidebarNavItem>
        </SidebarNavGroup>
        <SidebarNavGroup label="Administración">
          <SidebarNavItem icon={<span />}>Usuarios</SidebarNavItem>
        </SidebarNavGroup>
      </SidebarNav>
    }>
      <p>Contenido</p>
    </AppShell>,
  );
}

describe("el menú separa las secciones de sus enlaces", () => {
  it("entre un grupo y el siguiente hay más aire que entre dos enlaces", () => {
    menu();
    const grupos = [...navegacionDeEscritorio().querySelectorAll("[data-ui-sidebar-group]")] as HTMLElement[];
    expect(grupos).toHaveLength(2);

    const entreEnlaces = separacion(getComputedStyle(grupos[0]).gap);
    // Lo que separa un grupo del siguiente lo declara el propio grupo, no su
    // contenedor: así funciona igual estén dentro de `SidebarNav` o sueltos.
    const entreGrupos = separacion(getComputedStyle(grupos[1]).marginTop);

    // Agrupación por proximidad: si lo de dentro y lo de fuera están a la
    // misma distancia, no hay grupos, hay una lista larga.
    expect(entreGrupos, `entre grupos ${entreGrupos}rem vs entre enlaces ${entreEnlaces}rem`).toBeGreaterThan(
      entreEnlaces * 2,
    );
  });

  it("funciona también con los grupos sueltos, sin `SidebarNav` alrededor", () => {
    render(
      <AppShell brand={<SidebarBrand name="Acme" />} sidebar={
        <>
          <SidebarNavGroup label="Operación">
            <SidebarNavItem icon={<span />}>Movimientos</SidebarNavItem>
          </SidebarNavGroup>
          <SidebarNavGroup label="Administración">
            <SidebarNavItem icon={<span />}>Usuarios</SidebarNavItem>
          </SidebarNavGroup>
        </>
      }>
        <p>Contenido</p>
      </AppShell>,
    );
    const grupos = [...navegacionDeEscritorio().querySelectorAll("[data-ui-sidebar-group]")] as HTMLElement[];
    expect(separacion(getComputedStyle(grupos[1]).marginTop)).toBeGreaterThan(0.5);
  });

  it("el primer grupo no se despega del borde superior", () => {
    menu();
    const grupos = [...navegacionDeEscritorio().querySelectorAll("[data-ui-sidebar-group]")] as HTMLElement[];
    // La separación va entre hermanos, nunca antes del primero.
    expect(separacion(getComputedStyle(grupos[0]).marginTop)).toBe(0);
  });

  it("con el menú plegado la raya ya separa, y no se suma el hueco entero", () => {
    const { container } = menu({ collapsed: true });
    const grupos = [...container.querySelectorAll("aside [data-ui-sidebar-group]")] as HTMLElement[];
    // Plegado hay una raya entre grupos: sumarle el hueco entero desperdicia
    // la altura que el menú en iconos justamente quiere ahorrar.
    expect(container.querySelector("aside hr")).not.toBeNull();
    expect(separacion(getComputedStyle(grupos[1]).marginTop)).toBeLessThan(1);
  });

  it("un menú sin grupos no gana huecos por el cambio", () => {
    render(
      <AppShell brand={<SidebarBrand name="Acme" />} sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<span />}>Inicio</SidebarNavItem>
          <SidebarNavItem icon={<span />}>Movimientos</SidebarNavItem>
        </SidebarNav>
      }>
        <p>Contenido</p>
      </AppShell>,
    );
    const lista = navegacionDeEscritorio().firstElementChild as HTMLElement;
    // La lista sigue separando sus enlaces con el paso pequeño de siempre.
    expect(separacion(getComputedStyle(lista).gap)).toBeLessThan(0.5);
    expect(navegacionDeEscritorio().querySelector("[data-ui-sidebar-group]")).toBeNull();
  });
});
