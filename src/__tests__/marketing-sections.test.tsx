import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Layers, Mail } from "lucide-react";

import { FeatureGrid } from "../components/marketing/feature-grid";
import { Hero } from "../components/marketing/hero";
import { Checklist } from "../components/marketing/checklist";
import { CtaBanner } from "../components/marketing/cta-banner";
import { PageHero } from "../components/marketing/page-hero";
import { ProcessSteps } from "../components/marketing/process-steps";
import { SplitSection } from "../components/marketing/split-section";
import { StatRow } from "../components/marketing/stat-row";
import { Eyebrow, Highlight, Section, SectionHeading } from "../components/marketing/section";

describe("Section y SectionHeading (#189)", () => {
  it("la sección con id sirve de ancla, y inverted aplica los tokens oscuros solo dentro", () => {
    const { container } = render(
      <Section id="modulos" tone="inverted" background="grid">
        <SectionHeading eyebrow="Módulos" title="Tres módulos" description="Un protocolo." />
      </Section>,
    );
    const section = container.querySelector("section#modulos");
    expect(section).toHaveClass("dark");
    expect(section).toHaveAttribute("data-marketing-bg", "grid");
    expect(screen.getByRole("heading", { level: 2, name: "Tres módulos" })).toBeInTheDocument();
    expect(screen.getByText("Módulos")).toBeInTheDocument();
  });

  it("Highlight y Eyebrow no rompen el nombre accesible del título", () => {
    render(
      <SectionHeading
        eyebrow={<Eyebrow variant="pill" indicator="dot">Retail</Eyebrow>}
        title={<>Tell us what breaks at <Highlight variant="accent">7am</Highlight></>}
        as="h1"
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Tell us what breaks at 7am" })).toBeInTheDocument();
  });
});

describe("FeatureGrid (#189)", () => {
  it("pinta una lista con numeración, insignia, chip, viñetas, etiquetas y pie", () => {
    render(
      <FeatureGrid
        numbered
        items={[
          {
            title: "WhatsApp",
            description: <>Plantillas con <code>{"{{nombre}}"}</code></>,
            icon: Mail,
            badge: { label: "Fase 2", tone: "muted" },
            tag: "/invoices/v1",
            bullets: ["Idempotencia"],
            tags: ["EDI X12"],
            meta: { label: "Llega a:", value: "celulares" },
          },
          { title: "Correo", icon: Layers, dimmed: true },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3); // 2 celdas + 1 viñeta
    const primera = items[0];
    expect(within(primera).getByRole("heading", { name: "WhatsApp" })).toBeInTheDocument();
    expect(primera).toHaveTextContent("01");
    expect(primera).toHaveTextContent("Fase 2");
    expect(primera).toHaveTextContent("/invoices/v1");
    expect(primera).toHaveTextContent("EDI X12");
    expect(primera).toHaveTextContent("Llega a: celulares");
    expect(primera.querySelector("code")).toHaveTextContent("{{nombre}}");
  });

  it("con href la tarjeta es un enlace, y variant joined une las celdas", () => {
    render(<FeatureGrid variant="joined" items={[{ title: "Deliver", href: "https://deliver.piensait.com" }]} />);
    expect(screen.getByRole("link", { name: "Deliver" })).toHaveAttribute("href", "https://deliver.piensait.com");
  });
});

describe("Hero (#188)", () => {
  it("con aside va en dos columnas; el título es h1 y el eyebrow de texto es una pastilla", () => {
    render(
      <Hero
        eyebrow="Una plataforma · cuatro canales"
        title={<>Tus mensajes <Highlight>llegan</Highlight></>}
        description="SMS, WhatsApp, Email y Push."
        actions={<a href="/docs">Ver documentación</a>}
        note="Se entra con Google o Microsoft."
        aside={<pre>curl …</pre>}
        footer={<p>47 operaciones</p>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Tus mensajes llegan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver documentación" })).toBeInTheDocument();
    expect(screen.getByText("curl …")).toBeInTheDocument();
    expect(screen.getByText("47 operaciones")).toBeInTheDocument();
    expect(screen.getByText("Se entra con Google o Microsoft.")).toBeInTheDocument();
  });

  it("sin aside ni acciones queda centrado y sin contenedor de botones vacío", () => {
    const { container } = render(<Hero title="Real Estate Operating System" background="none" />);
    expect(container.querySelector("section")).not.toHaveAttribute("data-marketing-bg");
    expect(container.querySelector("h1")?.parentElement).toHaveClass("text-center");
  });
});

describe("StatRow (#195)", () => {
  it("pinta cada cifra con su rótulo como lista de definiciones y trae el valor final", () => {
    const { container } = render(
      <StatRow label="El portafolio" items={[{ value: "92 %", label: "Ocupación" }, { value: "18.2k m²", label: "Área" }]} />,
    );
    expect(screen.getByText("El portafolio")).toBeInTheDocument();
    expect(container.querySelectorAll("dd")).toHaveLength(2);
    expect(screen.getByText("92 %")).toBeInTheDocument();
    expect(screen.getByText("Área")).toBeInTheDocument();
  });
});

describe("ProcessSteps (#190)", () => {
  it("es una lista ordenada numerada 01, 02… con ícono opcional", () => {
    render(<ProcessSteps steps={[{ title: "Integra", icon: Mail }, { title: "Envía" }, { title: "Mide" }]} />);
    const pasos = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(pasos).toHaveLength(3);
    expect(pasos[1]).toHaveTextContent("02");
    expect(within(pasos[1]).getByRole("heading", { name: "Envía" })).toBeInTheDocument();
  });
});

describe("Checklist (#191)", () => {
  it("acepta textos sueltos o título con descripción", () => {
    render(<Checklist items={["Variables", { title: "Versiones", description: "Cada cambio queda publicado." }]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Cada cambio queda publicado.")).toBeInTheDocument();
  });
});

describe("SplitSection (#194)", () => {
  it("pone el texto y la maqueta; reverse solo cambia el orden en escritorio", () => {
    render(<SplitSection title="Plantillas" content={<p>Lista</p>} media={<div>Maqueta</div>} reverse />);
    expect(screen.getByRole("heading", { level: 2, name: "Plantillas" })).toBeInTheDocument();
    expect(screen.getByText("Maqueta").parentElement).toHaveClass("lg:order-1");
  });
});

describe("PageHero (#201)", () => {
  it("es un h1 centrado sin contenedor de acciones vacío", () => {
    const { container } = render(<PageHero eyebrow="Precios" title="Paga por lo que envías" />);
    expect(screen.getByRole("heading", { level: 1, name: "Paga por lo que envías" })).toBeInTheDocument();
    expect(container.querySelector(".flex-wrap")).toBeNull();
  });
});

describe("CtaBanner (#197)", () => {
  it("pinta título, descripción y acciones", () => {
    render(<CtaBanner title="¿Cuánto costaría?" description="Calcúlalo." actions={<a href="/estimar">Abrir el estimador</a>} />);
    expect(screen.getByRole("heading", { level: 2, name: "¿Cuánto costaría?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir el estimador" })).toBeInTheDocument();
  });
});
