import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("Pagination — tamaño de página fuera de las opciones", () => {
  it("muestra el tamaño actual aunque no esté en la lista de opciones", () => {
    render(
      <Pagination
        pageIndex={0}
        pageCount={2}
        pageSize={8}
        totalItems={14}
        pageSizeOptions={[10, 25, 50]}
        onPageIndexChange={() => {}}
        onPageSizeChange={() => {}}
      />,
    );
    // Sin esto el selector queda mostrando el placeholder, como si no hubiera
    // ningún tamaño elegido.
    const selector = screen.getByRole("combobox", { name: "Filas por página" });
    expect(selector).toHaveTextContent("8");
    expect(selector).not.toHaveTextContent(/Selecciona/i);
  });

  it("no duplica el tamaño cuando ya está entre las opciones", async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        pageIndex={0}
        pageCount={2}
        pageSize={25}
        totalItems={40}
        pageSizeOptions={[10, 25, 50]}
        onPageIndexChange={() => {}}
        onPageSizeChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("combobox", { name: "Filas por página" }));
    expect(await screen.findAllByRole("option", { name: "25" })).toHaveLength(1);
  });

  it("mantiene las opciones ordenadas al insertar el tamaño actual", async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        pageIndex={0}
        pageCount={2}
        pageSize={8}
        totalItems={14}
        pageSizeOptions={[10, 25, 50]}
        onPageIndexChange={() => {}}
        onPageSizeChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("combobox", { name: "Filas por página" }));
    const opciones = (await screen.findAllByRole("option")).map((o) => o.textContent);
    expect(opciones).toEqual(["8", "10", "25", "50"]);
  });
});
