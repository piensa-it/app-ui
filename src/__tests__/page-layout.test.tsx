import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageContainer } from "../components/layout/page-container";
import { PageHeader } from "../components/layout/page-header";
import { AppVersion } from "../components/layout/app-version";
import { UI_LIBRARY_VERSION } from "../version";

describe("PageContainer", () => {
  it("aplica el ritmo vertical de la escala entre bloques de primer nivel", () => {
    const { container } = render(
      <PageContainer>
        <section>Uno</section>
        <section>Dos</section>
      </PageContainer>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/space-y-stack|gap-stack/);
  });

  it("escalona la entrada de los bloques de primer nivel", () => {
    const { container } = render(
      <PageContainer>
        <section>Uno</section>
        <section>Dos</section>
      </PageContainer>,
    );
    // La entrada viene del contenedor: si dependiera de cada pantalla, solo
    // unas pocas se animarían.
    expect(container.querySelector("[data-ui-stagger]")).not.toBeNull();
    expect(container.querySelectorAll("[data-ui-stagger-item]")).toHaveLength(2);
  });

  it("`animate={false}` deja el contenido sin escalonar", () => {
    const { container } = render(
      <PageContainer animate={false}>
        <section>Uno</section>
      </PageContainer>,
    );
    expect(container.querySelector("[data-ui-stagger]")).toBeNull();
    expect(screen.getByText("Uno")).toBeInTheDocument();
  });

  it("limita el ancho de lectura y admite ancho completo", () => {
    const { container, rerender } = render(<PageContainer><p>x</p></PageContainer>);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/max-w-/);
    rerender(<PageContainer width="full"><p>x</p></PageContainer>);
    expect((container.firstElementChild as HTMLElement).className).not.toMatch(/max-w-screen|max-w-7xl/);
  });
});

describe("PageHeader", () => {
  it("expone el título como encabezado de nivel 1", () => {
    render(<PageHeader title="Arqueo de caja" />);
    expect(screen.getByRole("heading", { level: 1, name: "Arqueo de caja" })).toBeInTheDocument();
  });

  it("muestra descripción y acciones", () => {
    render(
      <PageHeader
        title="Arqueo"
        description="Cierre del turno de la mañana"
        actions={<button type="button">Exportar</button>}
      />,
    );
    expect(screen.getByText("Cierre del turno de la mañana")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exportar" })).toBeInTheDocument();
  });

  it("permite bajar el nivel del encabezado cuando no es el título de la página", () => {
    render(<PageHeader title="Sección" as="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "Sección" })).toBeInTheDocument();
  });
});

describe("AppVersion", () => {
  it("muestra la versión de la aplicación y la de la librería", () => {
    render(<AppVersion version="1.4.2" />);
    expect(screen.getByText(/1\.4\.2/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(UI_LIBRARY_VERSION.replace(/\./g, "\\.")))).toBeInTheDocument();
  });

  it("muestra la fecha de compilación cuando se le pasa", () => {
    render(<AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("deja el detalle completo accesible para pegar en un reporte", () => {
    const { container } = render(<AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" />);
    const root = container.firstElementChild as HTMLElement;
    const detalle = root.getAttribute("title") ?? root.textContent ?? "";
    expect(detalle).toContain("1.4.2");
    expect(detalle).toContain(UI_LIBRARY_VERSION);
  });

  it("funciona sin fecha de compilación", () => {
    render(<AppVersion version="1.4.2" />);
    expect(screen.getByText(/1\.4\.2/)).toBeInTheDocument();
  });
});
