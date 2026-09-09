import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dialog, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "../components/ui/dialog";

describe("Dialog", () => {
  it("no renderiza contenido cuando open=false", () => {
    render(
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogTitle>Título</DialogTitle>
      </Dialog>,
    );
    expect(screen.queryByText("Título")).not.toBeInTheDocument();
  });

  it("renderiza el contenido cuando open=true", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogTitle>Título</DialogTitle>
      </Dialog>,
    );
    expect(screen.getByText("Título")).toBeInTheDocument();
  });
});

describe("Dialog — subpartes de composición", () => {
  it("DialogHeader, DialogDescription y DialogFooter componen dentro del diálogo abierto", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogHeader data-testid="header">
          <DialogTitle>Confirmar</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
        </DialogHeader>
        <DialogFooter data-testid="footer">
          <button type="button">Cancelar</button>
        </DialogFooter>
      </Dialog>,
    );

    const dialogo = screen.getByRole("dialog");
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
    // DialogDescription usa Ark UI Description: el diálogo debe quedar descrito por él.
    const descripcion = screen.getByText("Esta acción no se puede deshacer.");
    expect(dialogo).toHaveAttribute("aria-describedby", descripcion.id);
    expect(screen.getByTestId("header")).toHaveClass("flex", "flex-col");
    expect(screen.getByTestId("footer")).toContainElement(screen.getByRole("button", { name: "Cancelar" }));
  });

  it("DialogHeader y DialogFooter reenvían className", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogHeader data-testid="header" className="mi-header" />
        <DialogFooter data-testid="footer" className="mi-footer" />
      </Dialog>,
    );
    expect(screen.getByTestId("header")).toHaveClass("mi-header");
    expect(screen.getByTestId("footer")).toHaveClass("mi-footer");
  });
});
