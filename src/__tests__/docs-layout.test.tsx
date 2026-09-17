import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { DocsLayout } from "../components/docs/docs-layout";
import { DocsProse } from "../components/docs/docs-prose";

const nav = [
  { title: "Getting started", items: [{ label: "Overview", href: "/developers/" }, { label: "Quickstart", href: "/developers/quickstart/", active: true }] },
  { title: "Guides", items: [{ label: "Webhooks", href: "/developers/webhooks/", badge: "New" }] },
];

describe("DocsLayout (#213)", () => {
  it("menú con la página activa, TOC, miga de pan y anterior/siguiente", () => {
    render(
      <DocsLayout
        nav={nav}
        toc={[{ id: "install", label: "Install" }, { id: "send", label: "Send a message", level: 3 }]}
        breadcrumbs={[{ label: "Developers", href: "/developers/" }, { label: "Quickstart" }]}
        prev={{ label: "Overview", href: "/developers/" }}
        next={{ label: "Authentication", href: "/developers/authentication/" }}
        labels={{ nav: "Documentation", toc: "On this page", previous: "Previous", next: "Next", menu: "Docs menu", breadcrumbs: "Breadcrumbs" }}
        header={<h1>Quickstart</h1>}
      >
        <DocsProse>
          <h2 id="install">Install</h2>
          <p>Hola</p>
        </DocsProse>
      </DocsLayout>,
    );

    const menu = screen.getByRole("navigation", { name: "Documentation" });
    const activos = within(menu).getAllByRole("link", { name: "Quickstart" });
    activos.forEach((link) => expect(link).toHaveAttribute("aria-current", "page"));
    expect(within(menu).getAllByText("New").length).toBeGreaterThan(0);

    const tocs = screen.getAllByRole("navigation", { name: "On this page" });
    expect(within(tocs[0]).getByRole("link", { name: "Send a message" })).toHaveAttribute("href", "#send");

    expect(screen.getByRole("navigation", { name: "Breadcrumbs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Quickstart" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Previous\s*Overview/ })).toHaveAttribute("href", "/developers/");
    expect(screen.getByRole("link", { name: /Next\s*Authentication/ })).toHaveAttribute("href", "/developers/authentication/");
    expect(screen.getByRole("article")).toHaveTextContent("Hola");
  });

  it("sin TOC ni anterior/siguiente no pinta columnas ni navegación vacías; en móvil el menú es un <details>", () => {
    const { container } = render(
      <DocsLayout nav={nav}>
        <p>Contenido</p>
      </DocsLayout>,
    );
    expect(screen.queryByRole("navigation", { name: "En esta página" })).toBeNull();
    expect(screen.queryByRole("navigation", { name: /Anterior/ })).toBeNull();
    expect(container.querySelector("details summary")).toHaveTextContent("Menú de la documentación");
  });

  it("DocsProse marca el contenido para sus estilos y acepta clases", () => {
    const { container } = render(<DocsProse className="mx-auto">Texto</DocsProse>);
    expect(container.firstChild).toHaveAttribute("data-docs-prose");
    expect(container.firstChild).toHaveClass("mx-auto");
  });
});
