import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
  it("en el menú muestra solo la versión de la aplicación", () => {
    // Texto exacto en vez de expresión regular: la versión lleva puntos y
    // construir el patrón escapándolos a mano es una fuente de errores.
    render(<AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" />);
    expect(screen.getByText("v1.4.2")).toBeInTheDocument();
    // Ni la versión de la librería ni la fecha, aunque se le pase la fecha:
    // en el pie del menú compiten con lo único que se consulta a diario.
    expect(screen.queryByText(`UI ${UI_LIBRARY_VERSION}`)).not.toBeInTheDocument();
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it("con `details` añade la versión de la librería y la fecha", () => {
    render(<AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" details />);
    expect(screen.getByText("v1.4.2")).toBeInTheDocument();
    expect(screen.getByText(`UI ${UI_LIBRARY_VERSION}`)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("el detalle se puede leer del texto, no de un atributo", () => {
    // La versión anterior lo dejaba en `title`, con la idea de copiarlo al
    // reportar algo. Un `title` no se selecciona ni se copia: si el detalle
    // existe, tiene que estar en el texto.
    const { container } = render(
      <AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" details />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain("1.4.2");
    expect(root.textContent).toContain(UI_LIBRARY_VERSION);
    expect(root.getAttribute("title")).toBeNull();
  });

  it("funciona sin fecha de compilación", () => {
    render(<AppVersion version="1.4.2" details />);
    expect(screen.getByText(/1\.4\.2/)).toBeInTheDocument();
  });
});

describe("AppVersion — fecha de compilación", () => {
  // `new Date("2026-09-03")` es medianoche UTC. Al formatear en una zona al
  // oeste retrocede un día, y ese formato es justo el que produce
  // `new Date().toISOString().slice(0, 10)`, que es lo que se inyecta en el
  // build.
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  it.each(["America/Bogota", "UTC", "Pacific/Honolulu"])(
    "una fecha ISO sin hora se ve igual en %s",
    (timeZone) => {
      process.env.TZ = timeZone;
      render(<AppVersion version="0.1.0" buildDate="2026-09-03" details />);
      expect(screen.getByText(/3\/09\/2026/)).toBeInTheDocument();
      cleanup();
    },
  );

  it("una marca de tiempo completa se sigue interpretando como instante", () => {
    process.env.TZ = "UTC";
    render(<AppVersion version="0.1.0" buildDate="2026-09-03T10:15:00Z" details />);
    expect(screen.getByText(/3\/09\/2026/)).toBeInTheDocument();
  });

  it("acepta un objeto Date y un número", () => {
    const { rerender } = render(<AppVersion version="0.1.0" buildDate={new Date(2026, 8, 3)} details />);
    expect(screen.getByText(/3\/09\/2026/)).toBeInTheDocument();
    rerender(<AppVersion version="0.1.0" buildDate={new Date(2026, 8, 3).getTime()} details />);
    expect(screen.getByText(/3\/09\/2026/)).toBeInTheDocument();
  });

  it("una fecha ilegible no rompe la línea de versión", () => {
    render(<AppVersion version="0.1.0" buildDate="no es una fecha" details />);
    expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument();
  });
});

describe("PageContainer — la entrada se repite en cada pantalla", () => {
  function Pantalla({ vista }: { vista: string }) {
    // Dos rutas que comparten componente: React lo reutiliza en vez de
    // montarlo de nuevo, así que sin `animateKey` la segunda entra sin animar
    // y la aplicación se siente irregular.
    return (
      <PageContainer animateKey={vista}>
        <section>{vista}</section>
      </PageContainer>
    );
  }

  it("cambiar de pantalla vuelve a montar los bloques, para que la entrada se repita", () => {
    const { container, rerender } = render(<Pantalla vista="Conciliación" />);
    const primero = container.querySelector("[data-ui-stagger-item]");

    rerender(<Pantalla vista="Reportes" />);
    const segundo = container.querySelector("[data-ui-stagger-item]");

    expect(segundo).not.toBeNull();
    // Nodo distinto: se volvió a montar y la animación de entrada arranca.
    expect(segundo).not.toBe(primero);
    expect(segundo).toHaveTextContent("Reportes");
  });

  it("sin cambiar la clave, los bloques no se remontan al repintar", () => {
    const { container, rerender } = render(<Pantalla vista="Reportes" />);
    const primero = container.querySelector("[data-ui-stagger-item]");
    rerender(<Pantalla vista="Reportes" />);
    expect(container.querySelector("[data-ui-stagger-item]")).toBe(primero);
  });

  it("sin `animateKey` se comporta como antes", () => {
    const { container, rerender } = render(
      <PageContainer>
        <section>Uno</section>
      </PageContainer>,
    );
    const primero = container.querySelector("[data-ui-stagger-item]");
    rerender(
      <PageContainer>
        <section>Dos</section>
      </PageContainer>,
    );
    expect(container.querySelector("[data-ui-stagger-item]")).toBe(primero);
  });
});
