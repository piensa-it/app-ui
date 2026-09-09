import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sheet, SheetTitle, SheetHeader, SheetDescription, SheetFooter } from "../components/ui/sidebar";

describe("Sheet — props del panel", () => {
  it("style, data-* y className llegan al elemento role=dialog", async () => {
    render(
      <Sheet
        open
        onOpenChange={() => {}}
        className="sm:max-w-xl"
        style={{ "--ancho": "42rem" } as React.CSSProperties}
        data-testid="panel-orden"
        data-mobile="true"
      >
        <SheetTitle>Orden</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveClass("sm:max-w-xl");
    expect(panel.style.getPropertyValue("--ancho")).toBe("42rem");
    expect(panel).toHaveAttribute("data-testid", "panel-orden");
    expect(panel).toHaveAttribute("data-mobile", "true");
  });

  it("las props del Root de Ark siguen llegando al Root", async () => {
    render(
      <Sheet open onOpenChange={() => {}} position="left" closeOnEscape={false} ids={{ content: "panel-x" }}>
        <SheetTitle>Orden</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveAttribute("id", "panel-x");
    expect(panel).toHaveClass("left-0");
  });
});

describe("Sheet — superficie propia", () => {
  it("por defecto pinta su superficie (fondo, sombra y borde)", async () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetTitle>Panel</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveClass("bg-raised", "shadow-lg");
    expect(screen.getByRole("button", { name: "Cerrar" })).toHaveClass("text-muted-foreground");
  });

  it("surface={false} no pinta fondo, sombra ni anillo, y el botón de cerrar hereda el color", async () => {
    render(
      <Sheet open onOpenChange={() => {}} surface={false} className="bg-[#101418] text-white">
        <SheetTitle>Panel oscuro</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveClass("bg-[#101418]");
    expect(panel.className).not.toMatch(/\bbg-raised\b/);
    expect(panel.className).not.toMatch(/\bshadow-lg\b/);
    expect(panel.className).not.toMatch(/\bring-1\b/);
    // Sin superficie propia, el color del panel manda también en el cierre.
    const close = screen.getByRole("button", { name: "Cerrar" });
    expect(close).toHaveClass("text-current");
    expect(close.className).not.toMatch(/text-muted-foreground/);
  });

  it("mantiene el posicionamiento y la animación aunque no pinte superficie", async () => {
    render(
      <Sheet open onOpenChange={() => {}} surface={false} position="left">
        <SheetTitle>Panel</SheetTitle>
      </Sheet>,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveClass("fixed", "left-0");
  });
});

describe("Sheet — subpartes de composición", () => {
  it("SheetHeader, SheetDescription y SheetFooter componen dentro del panel, y el panel queda descrito", async () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetHeader data-testid="header">
          <SheetTitle>Orden #123</SheetTitle>
          <SheetDescription>Detalle completo del pedido.</SheetDescription>
        </SheetHeader>
        <SheetFooter data-testid="footer">
          <button type="button">Cerrar orden</button>
        </SheetFooter>
      </Sheet>,
    );

    const panel = await screen.findByRole("dialog");
    const descripcion = screen.getByText("Detalle completo del pedido.");
    expect(panel).toHaveAttribute("aria-describedby", descripcion.id);
    expect(screen.getByTestId("header")).toHaveClass("flex", "flex-col");
    expect(screen.getByTestId("footer")).toContainElement(screen.getByRole("button", { name: "Cerrar orden" }));
  });

  it("SheetHeader y SheetFooter reenvían className", async () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetHeader data-testid="header" className="mi-header" />
        <SheetFooter data-testid="footer" className="mi-footer" />
      </Sheet>,
    );
    await screen.findByRole("dialog");
    expect(screen.getByTestId("header")).toHaveClass("mi-header");
    expect(screen.getByTestId("footer")).toHaveClass("mi-footer");
  });
});
