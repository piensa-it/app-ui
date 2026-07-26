import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "../components/ui/pagination";

describe("Pagination", () => {
  it("muestra el rango de elementos cuando se provee totalItems", () => {
    render(
      <Pagination pageIndex={0} pageCount={5} pageSize={10} totalItems={42} onPageIndexChange={vi.fn()} />,
    );
    expect(screen.getByText("1-10 de 42")).toBeInTheDocument();
  });

  it("muestra 'Página X / Y' cuando no se provee totalItems", () => {
    render(<Pagination pageIndex={2} pageCount={5} pageSize={10} onPageIndexChange={vi.fn()} />);
    expect(screen.getByText("Página 3 / 5")).toBeInTheDocument();
  });

  it("deshabilita 'anterior' en la primera página y 'siguiente' en la última", () => {
    const { rerender } = render(
      <Pagination pageIndex={0} pageCount={3} pageSize={10} onPageIndexChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeEnabled();

    rerender(<Pagination pageIndex={2} pageCount={3} pageSize={10} onPageIndexChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeDisabled();
  });

  it("llama a onPageIndexChange con la página siguiente/anterior", () => {
    const onPageIndexChange = vi.fn();
    render(<Pagination pageIndex={1} pageCount={5} pageSize={10} onPageIndexChange={onPageIndexChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));
    expect(onPageIndexChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: "Ir a la página anterior" }));
    expect(onPageIndexChange).toHaveBeenCalledWith(0);
  });

  it("no muestra el selector de tamaño de página sin onPageSizeChange", () => {
    render(<Pagination pageIndex={0} pageCount={3} pageSize={10} onPageIndexChange={vi.fn()} />);
    expect(screen.queryByLabelText("Filas por página")).not.toBeInTheDocument();
  });
});
