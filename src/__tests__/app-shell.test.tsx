import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../components/layout/app-shell";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";

beforeEach(() => {
  window.localStorage.clear();
});

const grupos = [
  {
    id: "empresa",
    label: "Empresa",
    value: "acme",
    options: [
      { value: "acme", label: "Acme S.A." },
      { value: "globex", label: "Globex Ltda." },
    ],
  },
  {
    id: "entorno",
    label: "Entorno",
    value: "prd",
    options: [
      { value: "prd", label: "Producción", description: "Datos reales de la operación" },
      { value: "uat", label: "Pruebas (UAT)", description: "Datos de ensayo, sin efecto real" },
    ],
  },
];

describe("SidebarBrand", () => {
  it("muestra el nombre de la organización y sus iniciales cuando no hay logo", () => {
    render(<SidebarBrand name="Acme S.A." />);
    expect(screen.getByText("Acme S.A.")).toBeInTheDocument();
    // "S.A." es forma societaria, no parte del nombre: las iniciales salen de
    // "Acme", y con una sola palabra se toman dos letras.
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("con varias palabras usa la inicial de cada una", () => {
    render(<SidebarBrand name="Banco Popular" />);
    expect(screen.getByText("BP")).toBeInTheDocument();
  });

  it("usa el logo cuando se le pasa uno, en vez de las iniciales", () => {
    render(<SidebarBrand name="Acme S.A." logo={<img alt="Acme" src="/logo.svg" />} />);
    expect(screen.getByRole("img", { name: "Acme" })).toBeInTheDocument();
    expect(screen.queryByText("AS")).not.toBeInTheDocument();
  });

  it("muestra el distintivo de entorno", () => {
    render(<SidebarBrand name="Acme" environment={{ label: "UAT" }} />);
    expect(screen.getByText("UAT")).toBeInTheDocument();
  });

  it("sin grupos no hay ningún control: es solo una etiqueta", () => {
    render(<SidebarBrand name="Acme S.A." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("con grupos, la fila entera es UN solo control que abre el menú", async () => {
    const user = userEvent.setup();
    render(<SidebarBrand name="Acme S.A." groups={grupos} />);

    // Un único control en la fila: dos controles juntos se activan sin querer.
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);

    await user.click(buttons[0]);
    expect(await screen.findByText("Empresa")).toBeInTheDocument();
    expect(screen.getByText("Entorno")).toBeInTheDocument();
  });

  it("cada opción se marca como seleccionable y dice qué hace", async () => {
    const user = userEvent.setup();
    render(<SidebarBrand name="Acme S.A." groups={grupos} />);
    await user.click(screen.getByRole("button"));

    const produccion = await screen.findByRole("menuitemradio", { name: /Producción/ });
    expect(produccion).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: /Pruebas \(UAT\)/ })).toHaveAttribute("aria-checked", "false");
    // La opción explica su efecto en vez de ser un interruptor mudo.
    expect(screen.getByText("Datos de ensayo, sin efecto real")).toBeInTheDocument();
  });

  it("notifica el cambio con el grupo al que pertenece la opción", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SidebarBrand
        name="Acme S.A."
        groups={[{ ...grupos[1], onChange }]}
      />,
    );
    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("menuitemradio", { name: /Pruebas \(UAT\)/ }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("uat"));
  });

  it("plegado deja solo el distintivo, con el nombre accesible", () => {
    render(<SidebarBrand name="Acme S.A." groups={grupos} collapsed />);
    const trigger = screen.getByRole("button", { name: /Acme S\.A\./ });
    // El nombre desaparece de la vista pero no del nombre accesible.
    expect(trigger.textContent).not.toContain("Acme S.A.");
    expect(trigger).toHaveAttribute("aria-label", "Acme S.A.");
  });
});

describe("AppShell", () => {
  const shell = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => (
    <AppShell brand={<SidebarBrand name="Acme" />} sidebar={<a href="/inicio">Inicio</a>} {...props}>
      <p>Contenido</p>
    </AppShell>
  );

  it("compone barra lateral, barra superior y contenido", () => {
    render(shell({ topbar: <button type="button">Perfil</button> }));
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Contenido");
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
  });

  it("pliega y despliega el menú, informando el estado", async () => {
    const user = userEvent.setup();
    render(shell());
    const toggle = screen.getByRole("button", { name: /Plegar el menú/ });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    const expand = screen.getByRole("button", { name: /Desplegar el menú/ });
    expect(expand).toHaveAttribute("aria-expanded", "false");
  });

  it("recuerda la preferencia de plegado en este dispositivo", async () => {
    const user = userEvent.setup();
    const { unmount } = render(shell({ storageKey: "acme" }));
    await user.click(screen.getByRole("button", { name: /Plegar el menú/ }));
    await waitFor(() => expect(window.localStorage.getItem("ui-shell:acme:collapsed")).toBe("true"));
    unmount();

    render(shell({ storageKey: "acme" }));
    expect(screen.getByRole("button", { name: /Desplegar el menú/ })).toBeInTheDocument();
  });

  it("no comparte la preferencia entre aplicaciones distintas", async () => {
    const user = userEvent.setup();
    const { unmount } = render(shell({ storageKey: "acme" }));
    await user.click(screen.getByRole("button", { name: /Plegar el menú/ }));
    unmount();
    render(shell({ storageKey: "otra-app" }));
    expect(screen.getByRole("button", { name: /Plegar el menú/ })).toBeInTheDocument();
  });

  it("sigue funcionando cuando el navegador bloquea el almacenamiento", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    render(shell({ storageKey: "acme" }));
    await user.click(screen.getByRole("button", { name: /Plegar el menú/ }));
    expect(screen.getByRole("button", { name: /Desplegar el menú/ })).toBeInTheDocument();
    setItem.mockRestore();
  });

  it("el panel móvil es un mismo menú, sin superficie propia que tape el tema", async () => {
    const user = userEvent.setup();
    render(shell());
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    const panel = await screen.findByRole("dialog");
    expect(within(panel).getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    // Sin superficie propia: el carácter del menú lo ponen los tokens.
    expect(panel.className).not.toMatch(/\bbg-raised\b/);
    expect(panel.className).toMatch(/\bbg-sidebar\b/);
  });

  it("el carácter del menú se elige con una variante y viaja en un atributo", () => {
    const { container, rerender } = render(shell());
    expect(container.querySelector("[data-sidebar]")).toHaveAttribute("data-sidebar", "graphite");
    rerender(shell({ variant: "ink" }));
    expect(container.querySelector("[data-sidebar]")).toHaveAttribute("data-sidebar", "ink");
  });

  it("acepta un pie de menú, para la línea de versión", () => {
    render(shell({ sidebarFooter: <span>v1.4.2</span> }));
    expect(screen.getByText("v1.4.2")).toBeInTheDocument();
  });
});

describe("AppShell — el menú conoce su propio estado", () => {
  function Navegacion() {
    return (
      <SidebarNav>
        <SidebarNavItem icon={<span data-testid="icono" />} active>
          Inicio
        </SidebarNavItem>
        <SidebarNavItem icon={<span />}>Movimientos</SidebarNavItem>
      </SidebarNav>
    );
  }

  it("los enlaces saben si el menú está plegado, sin levantar el estado a la aplicación", async () => {
    const user = userEvent.setup();
    render(
      <AppShell storageKey="acme" brand={<SidebarBrand name="Acme" />} sidebar={<Navegacion />}>
        <p>Contenido</p>
      </AppShell>,
    );

    // Desplegado: se ve el texto del enlace.
    expect(screen.getAllByRole("link", { name: "Inicio" })[0]).toHaveTextContent("Inicio");

    await user.click(screen.getByRole("button", { name: /Plegar el menú/ }));
    // Plegado: el texto deja de verse pero el nombre accesible se mantiene.
    const link = screen.getAllByRole("link", { name: "Inicio" })[0];
    expect(link.querySelector(".sr-only")).not.toBeNull();
    // Y la preferencia se sigue recordando: plegar no obliga a controlar el estado.
    await waitFor(() => expect(window.localStorage.getItem("ui-shell:acme:collapsed")).toBe("true"));
  });

  it("marca el enlace activo para lectores de pantalla", () => {
    render(
      <AppShell brand={<SidebarBrand name="Acme" />} sidebar={<Navegacion />}>
        <p>Contenido</p>
      </AppShell>,
    );
    expect(screen.getAllByRole("link", { name: "Inicio" })[0]).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: "Movimientos" })[0]).not.toHaveAttribute("aria-current");
  });

  it("al navegar desde el panel móvil, el panel se cierra", async () => {
    const user = userEvent.setup();
    render(
      <AppShell brand={<SidebarBrand name="Acme" />} sidebar={<Navegacion />}>
        <p>Contenido</p>
      </AppShell>,
    );
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    const panel = await screen.findByRole("dialog");
    await user.click(within(panel).getByRole("link", { name: "Movimientos" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("los dos menús no se anuncian como el mismo punto de navegación", () => {
    render(
      <AppShell brand={<SidebarBrand name="Acme" />} sidebar={<Navegacion />}>
        <p>Contenido</p>
      </AppShell>,
    );
    const nombres = screen.getAllByRole("navigation").map((nav) => nav.getAttribute("aria-label"));
    expect(new Set(nombres).size).toBe(nombres.length);
  });
});

describe("SidebarBrand — el distintivo sale de la opción elegida", () => {
  it("deriva el distintivo del grupo, sin declararlo dos veces", () => {
    render(
      <SidebarBrand
        name="Acme"
        groups={[
          {
            id: "entorno",
            label: "Entorno",
            value: "uat",
            options: [
              { value: "prd", label: "Producción" },
              { value: "uat", label: "Pruebas (UAT)", badge: { label: "UAT", tone: "warning" } },
            ],
          },
        ]}
      />,
    );
    expect(screen.getAllByText("UAT").length).toBeGreaterThan(0);
  });

  it("no muestra distintivo cuando la opción elegida no lo declara", () => {
    render(
      <SidebarBrand
        name="Acme"
        groups={[
          {
            id: "entorno",
            label: "Entorno",
            value: "prd",
            options: [
              { value: "prd", label: "Producción" },
              { value: "uat", label: "Pruebas (UAT)", badge: { label: "UAT", tone: "warning" } },
            ],
          },
        ]}
      />,
    );
    expect(screen.queryByText("UAT")).not.toBeInTheDocument();
  });

  it("un `environment` explícito manda sobre el derivado", () => {
    render(
      <SidebarBrand
        name="Acme"
        environment={{ label: "LOCAL" }}
        groups={[
          {
            id: "entorno",
            label: "Entorno",
            value: "uat",
            options: [{ value: "uat", label: "Pruebas", badge: { label: "UAT" } }],
          },
        ]}
      />,
    );
    expect(screen.getByText("LOCAL")).toBeInTheDocument();
  });
});
