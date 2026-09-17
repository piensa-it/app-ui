import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LanguageSwitcher } from "../components/marketing/language-switcher";
import { ProductSignature } from "../components/marketing/product-signature";
import { PublicHeader } from "../components/marketing/public-header";
import { ThemeToggle, themeScript } from "../components/ui/theme-toggle";

function mockSystemDark(dark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: dark,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn().mockReturnValue(media) as unknown as typeof window.matchMedia;
  return {
    change(next: boolean) {
      media.matches = next;
      listeners.forEach((fn) => fn());
    },
  };
}

describe("ThemeToggle (#200)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });
  afterEach(() => vi.restoreAllMocks());

  it("no controlado: guarda la elección y aplica la clase dark en <html>", async () => {
    mockSystemDark(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "Oscuro" }));
    expect(screen.getByRole("button", { name: "Oscuro" })).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("lee la preferencia guardada al montar", async () => {
    mockSystemDark(false);
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: "Claro", pressed: true })).toBeInTheDocument();
  });

  it("en «Sistema» sigue los cambios del sistema operativo en vivo", async () => {
    const sistema = mockSystemDark(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "Sistema" }));
    expect(document.documentElement).not.toHaveClass("dark");
    sistema.change(true);
    expect(document.documentElement).toHaveClass("dark");
  });

  it("controlado: solo avisa, no toca <html> ni el almacenamiento", async () => {
    mockSystemDark(false);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle value="light" onChange={onChange} labels={{ dark: "Dark" }} />);
    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(onChange).toHaveBeenCalledWith("dark");
    expect(localStorage.getItem("theme")).toBeNull();
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("themeScript aplica el tema guardado y no deja cerrar la etiqueta <script>", () => {
    mockSystemDark(false);
    localStorage.setItem("theme", "dark");
    new Function(themeScript())();
    expect(document.documentElement).toHaveClass("dark");
    expect(themeScript({ storageKey: "</script>" })).not.toContain("</script>");
  });
});

describe("LanguageSwitcher (#207)", () => {
  const languages = [
    { code: "en", label: "English", href: "/" },
    { code: "es", label: "Español", href: "/es/" },
  ];

  it("cada idioma es un enlace real con hreflang, y marca el actual", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LanguageSwitcher value="en" languages={languages} onChange={onChange} label="Language" />);
    const nav = screen.getByRole("navigation", { name: "Language" });
    const es = within(nav).getByRole("link", { name: /Español/ });
    expect(es).toHaveAttribute("href", "/es/");
    expect(es).toHaveAttribute("hreflang", "es");
    expect(within(nav).getByRole("link", { name: /English/ })).toHaveAttribute("aria-current", "true");
    es.addEventListener("click", (event) => event.preventDefault());
    await user.click(es);
    expect(onChange).toHaveBeenCalledWith("es");
  });

  it("variante menu usa <details> nativo, sin JavaScript para abrir", () => {
    const { container } = render(<LanguageSwitcher value="es" variant="menu" languages={languages} />);
    expect(container.querySelector("details summary")).toHaveTextContent("Español");
    expect(container.querySelectorAll("details a")).toHaveLength(2);
  });
});

describe("Firma de producto (#184)", () => {
  it("el enlace de inicio se nombra «<Producto> by Piensa IT» y el isotipo es decorativo", () => {
    render(<PublicHeader brandName="Deliver" signature />);
    expect(screen.getByRole("link", { name: "Deliver by Piensa IT" })).toBeInTheDocument();
  });

  it("acepta texto e isotipo propios", () => {
    const { container } = render(<ProductSignature label="por Piensa IT" logoSrc="/iso.png" />);
    expect(container).toHaveTextContent("por Piensa IT");
    expect(container.querySelector("img")).toHaveAttribute("src", "/iso.png");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
