import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionTab } from "../components/ui/accordion";

describe("Accordion", () => {
  it("solo pinta el panel abierto por defecto — el resto queda colapsado", () => {
    render(
      <Accordion defaultValue={["uno"]}>
        <AccordionTab value="uno" header="Primero">
          Contenido uno
        </AccordionTab>
        <AccordionTab value="dos" header="Segundo">
          Contenido dos
        </AccordionTab>
      </Accordion>,
    );

    const primerBoton = screen.getByRole("button", { name: "Primero" });
    const segundoBoton = screen.getByRole("button", { name: "Segundo" });
    expect(primerBoton).toHaveAttribute("aria-expanded", "true");
    expect(segundoBoton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Contenido uno")).toBeVisible();
  });

  it("hacer click en el header expande el panel y avisa por onValueChange", async () => {
    let valorActual: string[] = [];
    render(
      <Accordion value={valorActual} onValueChange={(value) => (valorActual = value)}>
        <AccordionTab value="uno" header="Primero">
          Contenido uno
        </AccordionTab>
      </Accordion>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Primero" }));
    expect(valorActual).toEqual(["uno"]);
  });

  it("collapsible=false impide cerrar el único panel abierto con otro click", async () => {
    let valorActual = ["uno"];
    render(
      <Accordion value={valorActual} onValueChange={(value) => (valorActual = value)} collapsible={false}>
        <AccordionTab value="uno" header="Primero">
          Contenido uno
        </AccordionTab>
      </Accordion>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Primero" }));
    expect(valorActual).toEqual(["uno"]);
  });

  it("multiple=true permite tener más de un panel abierto a la vez", async () => {
    let valorActual: string[] = ["uno"];
    render(
      <Accordion value={valorActual} onValueChange={(value) => (valorActual = value)} multiple>
        <AccordionTab value="uno" header="Primero">
          Contenido uno
        </AccordionTab>
        <AccordionTab value="dos" header="Segundo">
          Contenido dos
        </AccordionTab>
      </Accordion>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Segundo" }));
    expect(valorActual.sort()).toEqual(["dos", "uno"]);
  });

  it("un AccordionTab disabled no responde a click", async () => {
    let valorActual: string[] = [];
    render(
      <Accordion value={valorActual} onValueChange={(value) => (valorActual = value)}>
        <AccordionTab value="uno" header="Primero" disabled>
          Contenido uno
        </AccordionTab>
      </Accordion>,
    );

    const boton = screen.getByRole("button", { name: "Primero" });
    expect(boton).toBeDisabled();
    await userEvent.click(boton);
    expect(valorActual).toEqual([]);
  });
});
