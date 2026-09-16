import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mailtoHref, whatsappHref } from "../components/marketing/contact-links";
import { ContactForm } from "../components/marketing/contact-form";
import { ContactSection } from "../components/marketing/contact-section";
import { PricingPlans, PricingTable } from "../components/marketing/pricing";
import { ProductCatalog } from "../components/marketing/product-catalog";
import { CodeBlock } from "../components/ui/code-block";

describe("CodeBlock (#193)", () => {
  it("todas las pestañas están en el HTML y copiar lo anuncia", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { container } = render(
      <CodeBlock
        title="POST /v1/messages"
        tabs={[
          { label: "curl", language: "bash", code: "curl https://api" },
          { label: "Node", language: "ts", code: "await fetch()" },
        ]}
      />,
    );
    expect(container).toHaveTextContent("curl https://api");
    expect(container.innerHTML).toContain("await fetch()");
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    expect(writeText).toHaveBeenCalledWith("curl https://api");
    expect(await screen.findByRole("status")).toHaveTextContent("Copiado");
  });

  it("numera las líneas y acepta un resaltador propio", () => {
    const { rerender, container } = render(<CodeBlock code={"a\nb"} lineNumbers copyable={false} />);
    expect(container).toHaveTextContent("1a2b");
    rerender(<CodeBlock code="x" highlight={(code) => <mark>{code}</mark>} copyable={false} />);
    expect(container.querySelector("mark")).toHaveTextContent("x");
  });
});

describe("ContactSection (#192)", () => {
  it("arma los enlaces de WhatsApp y correo con el mensaje codificado", () => {
    expect(whatsappHref("+57 300 123 4567", "Hola, quiero una demo")).toBe("https://wa.me/573001234567?text=Hola%2C%20quiero%20una%20demo");
    expect(mailtoHref("info@piensait.com", "Demo")).toBe("mailto:info@piensait.com?subject=Demo");
    render(
      <ContactSection
        title="Hablemos"
        channels={[
          { type: "whatsapp", phone: "+57 300 123 4567" },
          { type: "email", address: "info@piensait.com" },
          { type: "link", label: "Documentación", href: "/docs" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/573001234567");
    expect(screen.getByRole("link", { name: /info@piensait.com/ })).toHaveAttribute("href", "mailto:info@piensait.com");
    expect(screen.getByRole("link", { name: /Documentación/ })).toHaveAttribute("href", "/docs");
  });
});

describe("ContactForm (#203)", () => {
  it("valida, enfoca el primer error y no envía", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onSubmit={onSubmit} consent={{ label: "Acepto", required: true }} />);
    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: /Nombre/ })).toHaveFocus();
    expect(screen.getAllByText("Este campo es obligatorio.").length).toBeGreaterThan(0);
    expect(screen.getByText("Debes aceptar para continuar.")).toBeInTheDocument();
  });

  it("envía los valores, anuncia el éxito y limpia el formulario", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ContactForm fields={["name", "email", "message"]} onSubmit={onSubmit} labels={{ submit: "Send message", success: "Thanks!" }} />);
    await user.type(screen.getByRole("textbox", { name: /Nombre/ }), "Jane");
    await user.type(screen.getByRole("textbox", { name: /Correo/ }), "jane@company.com");
    await user.type(screen.getByRole("textbox", { name: /Mensaje/ }), "Hola");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "Jane", email: "jane@company.com", message: "Hola", consent: false }));
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks!");
    expect(screen.getByRole("textbox", { name: /Nombre/ })).toHaveValue("");
  });

  it("si onSubmit falla muestra el error; el honeypot lleno no envía", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("x"));
    const { container } = render(<ContactForm fields={["email"]} requiredFields={["email"]} onSubmit={onSubmit} honeypot="website" />);
    await user.type(screen.getByRole("textbox", { name: /Correo/ }), "a@b.co");
    await user.click(screen.getByRole("button", { name: /Enviar/ }));
    expect(await screen.findByText("No pudimos enviar el mensaje. Inténtalo de nuevo.")).toBeInTheDocument();

    onSubmit.mockClear();
    (container.querySelector('input[name="website"]') as HTMLInputElement).value = "bot";
    await user.click(screen.getByRole("button", { name: /Enviar/ }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ProductCatalog (#202)", () => {
  const products = [
    { name: "Deliver", tagline: "Mensajería por API", href: "https://deliver.piensait.com", category: "APIs", links: [{ label: "Docs", href: "https://deliver.piensait.com/docs" }] },
    { name: "Lynx", tagline: "Real Estate OS", href: "/lynx", category: "Plataformas", status: { label: "Nuevo", tone: "success" as const } },
  ];

  it("cada producto enlaza a su landing y sus enlaces secundarios, agrupados por categoría", () => {
    render(<ProductCatalog products={products} groupBy="category" />);
    expect(screen.getByRole("link", { name: "Deliver" })).toHaveAttribute("href", "https://deliver.piensait.com");
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "https://deliver.piensait.com/docs");
    expect(screen.getByText("Plataformas")).toBeInTheDocument();
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("compact es una fila de enlaces", () => {
    render(<ProductCatalog products={products} variant="compact" />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});

describe("PricingPlans y PricingTable (#196)", () => {
  it("formatea precios con el locale fijo, marca el plan destacado y pinta todas las categorías", () => {
    const { container } = render(
      <PricingPlans
        format={{ currency: "COP", locale: "es-CO" }}
        categories={[
          { label: "SMS", plans: [{ name: "Inicial", price: 50000, period: "al mes" }, { name: "Pro", price: 120000, highlighted: "Más elegido", details: [{ label: "Incluidos", value: "5.000" }] }] },
          { label: "Email", plans: [{ name: "Empresa", price: "A la medida" }] },
        ]}
        note="Precios sin IVA."
      />,
    );
    expect(screen.getByRole("tab", { name: "SMS" })).toBeInTheDocument();
    expect(container).toHaveTextContent(/\$\s?50\.000/);
    expect(screen.getByText("Más elegido")).toBeInTheDocument();
    expect(container.innerHTML).toContain("A la medida");
    expect(screen.getByText("Precios sin IVA.")).toBeInTheDocument();
  });

  it("la tabla por rangos es semántica, con cabeceras de fila y columna de ahorro", () => {
    render(
      <PricingTable
        format={{ currency: "COP" }}
        groups={[
          {
            title: "Emisión",
            columns: [
              { key: "plan", header: "Plan" },
              { key: "docs", header: "Documentos/año", kind: "number", mergeOnMobile: true },
              { key: "price", header: "Valor anual", kind: "price" },
              { key: "saving", header: "Ahorro", kind: "highlight" },
            ],
            rows: [{ plan: "Micro", docs: "60", price: 50000, saving: "—" }],
          },
        ]}
      />,
    );
    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Ahorro" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: /Micro/ })).toBeInTheDocument();
    expect(table).toHaveTextContent(/\$\s?50\.000/);
  });
});
