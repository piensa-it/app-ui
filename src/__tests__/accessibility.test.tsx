import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";

import { Button } from "../components/ui/button";
import { DataTable, Column } from "../components/ui/data-table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Field } from "../components/ui/field";
import { MultiSelect } from "../components/ui/multi-select";
import { Select } from "../components/ui/select";
import { AnimatedBanner } from "../components/ui/animated-banner";
import { Illustration } from "../components/ui/illustration";

async function expectNoA11yViolations(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: {
      // jsdom no calcula estilos finales con suficiente fidelidad para medir
      // contraste; esa regla se valida en Storybook/regresión visual.
      "color-contrast": { enabled: false },
    },
  });
  expect(result.violations).toEqual([]);
}

describe("accesibilidad base", () => {
  it("no detecta violaciones en controles de formulario", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="correo">Correo</Label>
        <Input id="correo" type="email" />
        <Button>Guardar cambios</Button>
      </div>,
    );

    await expectNoA11yViolations(container);
  });

  it("no detecta violaciones en una tabla ordenable", async () => {
    const { container } = render(
      <DataTable value={[{ nombre: "Ana" }]} aria-label="Usuarios">
        <Column field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    await expectNoA11yViolations(container);
  });

  it("conecta labels con selectores simples y múltiples", async () => {
    const options = [{ label: "Colombia", value: "co" }, { label: "México", value: "mx" }];
    const { container } = render(
      <div>
        <Field label="País"><Select options={options} value="co" /></Field>
        <Field label="Mercados"><MultiSelect options={options} value={["co"]} /></Field>
      </div>,
    );

    await expectNoA11yViolations(container);
  });

  it("no detecta violaciones en contenedores con ilustración", async () => {
    const { container } = render(
      <AnimatedBanner
        title="Proceso terminado"
        illustration={
          <Illustration motion="none">
            <svg role="img" aria-label="Persona celebrando" />
          </Illustration>
        }
        action={<Button>Continuar</Button>}
      >
        Los cambios están disponibles.
      </AnimatedBanner>,
    );

    await expectNoA11yViolations(container);
  });
});
