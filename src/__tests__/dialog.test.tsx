import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dialog, DialogTitle } from "../components/ui/dialog";

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
