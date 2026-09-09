import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../components/ui/file-upload";

function crearArchivo(nombre: string, contenido = "contenido") {
  return new File([contenido], nombre, { type: "text/plain" });
}

describe("FileUpload", () => {
  it("pinta el dropzone con su etiqueta y el botón para elegir archivos", () => {
    render(<FileUpload dropzoneLabel="Suelta tus archivos aquí" />);
    expect(screen.getByText("Suelta tus archivos aquí")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Elegir archivos" })).toBeInTheDocument();
  });

  it("seleccionar un archivo lo agrega a la lista e invoca onFilesChange", async () => {
    const user = userEvent.setup();
    let archivosRecibidos: File[] = [];
    render(<FileUpload onFilesChange={(files) => (archivosRecibidos = files)} />);

    const archivo = crearArchivo("reporte.txt");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, archivo);

    await waitFor(() => expect(screen.getByText("reporte.txt")).toBeInTheDocument());
    expect(archivosRecibidos.map((f) => f.name)).toEqual(["reporte.txt"]);
  });

  it("borrar un archivo lo quita de la lista y vuelve a invocar onFilesChange", async () => {
    const user = userEvent.setup();
    let archivosRecibidos: File[] = [];
    render(<FileUpload onFilesChange={(files) => (archivosRecibidos = files)} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, crearArchivo("borrame.txt"));
    await waitFor(() => expect(screen.getByText("borrame.txt")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /borrame\.txt/i }));

    await waitFor(() => expect(screen.queryByText("borrame.txt")).not.toBeInTheDocument());
    expect(archivosRecibidos).toEqual([]);
  });

  it("accept se reenvía al input nativo", () => {
    render(<FileUpload accept="image/*" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("accept", "image/*");
  });
});
