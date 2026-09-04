import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppShell } from "../components/layout/app-shell";
import { AppVersion } from "../components/layout/app-version";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";
import { UI_LIBRARY_VERSION } from "../version";

const grupos = [
  {
    id: "empresa",
    label: "Empresa",
    value: "acme",
    options: [{ value: "acme", label: "Acme S.A." }],
  },
];

function menu(props: { conGrupos?: boolean } = {}) {
  return render(
    <AppShell
      defaultCollapsed
      brand={<SidebarBrand name="Distribuidora El Poblado S.A.S." groups={props.conGrupos ? grupos : undefined} />}
      sidebarFooter={<AppVersion version="4.2.0" buildDate="2026-09-03" />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<span />}>Movimientos</SidebarNavItem>
        </SidebarNav>
      }
    >
      <p>Contenido</p>
    </AppShell>,
  );
}

/** Lo que de verdad centra: el eje horizontal de la caja dentro de su fila. */
const centra = (elemento: Element | null | undefined) =>
  Boolean(elemento && /\bjustify-center\b/.test(elemento.className));

describe("menú plegado — la marca de la organización", () => {
  it("se centra como los iconos del menú, sin grupos", () => {
    const { container } = menu();
    const marca = container.querySelector("aside span.grid") as HTMLElement;
    // Sin centrar, la marca queda pegada a la izquierda y su eje no coincide
    // con el de los iconos de abajo: se ve torcida en cuanto hay dos filas.
    expect(centra(marca.parentElement)).toBe(true);
  });

  it("se centra también cuando la fila es un control con menú", () => {
    const { container } = menu({ conGrupos: true });
    const trigger = container.querySelector("aside button") as HTMLElement;
    expect(centra(trigger)).toBe(true);
  });

  it("no reserva el hueco del texto ni el de la flecha", () => {
    const { container } = menu({ conGrupos: true });
    const trigger = container.querySelector("aside button") as HTMLElement;
    // El nombre y la flecha no se pintan plegado: si además se reservara su
    // espacio, la marca quedaría descentrada aunque la fila esté centrada.
    expect(trigger.textContent).not.toContain("Distribuidora");
    expect(trigger.querySelector("svg")).toBeNull();
  });

  it("desplegado vuelve a alinearse a la izquierda", () => {
    const { container } = render(
      <AppShell brand={<SidebarBrand name="Acme S.A." />} sidebar={<a href="/x">Inicio</a>}>
        <p>Contenido</p>
      </AppShell>,
    );
    const marca = container.querySelector("aside span.grid") as HTMLElement;
    expect(centra(marca.parentElement)).toBe(false);
  });
});

describe("menú plegado — la línea de versión", () => {
  it("muestra solo la versión de la aplicación, que es lo que cabe", () => {
    const { container } = menu();
    const pie = container.querySelector("aside div.border-t") as HTMLElement;
    // En 72 px de menú no caben tres datos: se partía en cuatro líneas y se
    // salía del componente.
    expect(pie.textContent?.trim()).toBe("v4.2.0");
  });

  it("el detalle completo sigue estando, para copiarlo en un reporte", () => {
    const { container } = menu();
    const version = container.querySelector("aside div.border-t > div") as HTMLElement;
    const detalle = version.getAttribute("title") ?? "";
    expect(detalle).toContain("4.2.0");
    expect(detalle).toContain(UI_LIBRARY_VERSION);
    expect(detalle).toContain("2026");
  });

  it("no parte la versión en varias líneas", () => {
    const { container } = menu();
    const version = container.querySelector("aside div.border-t > div") as HTMLElement;
    expect(version.className).toMatch(/truncate|whitespace-nowrap/);
  });

  it("desplegado sigue mostrando las tres partes", () => {
    render(
      <AppShell brand={<SidebarBrand name="Acme" />} sidebarFooter={<AppVersion version="4.2.0" buildDate="2026-09-03" />} sidebar={<a href="/x">Inicio</a>}>
        <p>Contenido</p>
      </AppShell>,
    );
    expect(screen.getByText("v4.2.0")).toBeInTheDocument();
    expect(screen.getByText(`UI ${UI_LIBRARY_VERSION}`)).toBeInTheDocument();
  });

  it("fuera del menú no se acorta nunca", () => {
    render(<AppVersion version="4.2.0" buildDate="2026-09-03" />);
    expect(screen.getByText(`UI ${UI_LIBRARY_VERSION}`)).toBeInTheDocument();
  });
});
