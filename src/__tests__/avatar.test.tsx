import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "../components/ui/avatar";

describe("Avatar", () => {
  it("sin src muestra las iniciales (label) como respaldo", () => {
    render(<Avatar label="AM" data-testid="avatar" />);
    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toHaveClass("rounded-full");
  });

  it("shape=square cambia el radio a rounded-xl", () => {
    render(<Avatar label="AM" shape="square" data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("rounded-xl");
    expect(avatar).not.toHaveClass("rounded-full");
  });

  it("cada tamaño mapea a una clase de alto/ancho distinta", () => {
    const { rerender } = render(<Avatar label="AM" size="xs" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toHaveClass("h-6", "w-6");

    rerender(<Avatar label="AM" size="xl" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toHaveClass("h-16", "w-16");
  });

  it("reenvía className", () => {
    render(<Avatar label="AM" className="mi-clase" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toHaveClass("mi-clase");
  });
});
