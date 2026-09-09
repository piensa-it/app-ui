import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlobalErrorBoundary } from "../components/layout/global-error-boundary";

/**
 * `GlobalErrorBoundary` es el componente que atrapa fallos no controlados en
 * producción (#50) — es la última línea de defensa antes de una pantalla en
 * blanco, así que estas pruebas verifican tanto el camino feliz (no
 * interfiere con hijos que no fallan) como la ruta de error real: que
 * captura, pinta el respaldo, y que título/descripción/acción se pueden
 * sobreescribir sin tocar código de negocio.
 */
function Bomba(): never {
  throw new Error("fallo simulado");
}

describe("GlobalErrorBoundary", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React (y el propio componentDidCatch) escriben en console.error al
    // capturar — se silencia para no ensuciar la salida de la prueba, no
    // porque el error no importe.
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("sin error, renderiza los hijos normalmente", () => {
    render(
      <GlobalErrorBoundary>
        <p>Contenido normal</p>
      </GlobalErrorBoundary>,
    );
    expect(screen.getByText("Contenido normal")).toBeInTheDocument();
  });

  it("captura un error del árbol y pinta el respaldo con el título por defecto", () => {
    render(
      <GlobalErrorBoundary>
        <Bomba />
      </GlobalErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: "Ups, algo salió mal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver al inicio" })).toBeInTheDocument();
  });

  it("acepta título, descripción y texto de acción personalizados", () => {
    render(
      <GlobalErrorBoundary
        title="Este dashboard no está disponible"
        description="Vuelve a intentar en unos minutos."
        actionLabel="Reintentar"
      >
        <Bomba />
      </GlobalErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: "Este dashboard no está disponible" })).toBeInTheDocument();
    expect(screen.getByText("Vuelve a intentar en unos minutos.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("invoca onError con el error capturado", () => {
    const onError = vi.fn();
    render(
      <GlobalErrorBoundary onError={onError}>
        <Bomba />
      </GlobalErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    const [error] = onError.mock.calls[0]!;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("fallo simulado");
  });

  it("hacer click en la acción invoca onAction (no navega a / por defecto)", async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(
      <GlobalErrorBoundary onAction={onAction}>
        <Bomba />
      </GlobalErrorBoundary>,
    );
    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("por defecto el mensaje técnico del error queda oculto", () => {
    render(
      <GlobalErrorBoundary>
        <Bomba />
      </GlobalErrorBoundary>,
    );
    expect(screen.queryByText("fallo simulado")).not.toBeInTheDocument();
  });

  it("showErrorDetails=true muestra el mensaje técnico del error", () => {
    render(
      <GlobalErrorBoundary showErrorDetails>
        <Bomba />
      </GlobalErrorBoundary>,
    );
    expect(screen.getByText("fallo simulado")).toBeInTheDocument();
  });
});
