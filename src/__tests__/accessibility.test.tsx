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
import { AuthLayout } from "../components/layout/auth-layout";
import { LoginForm } from "../components/ui/login-form";
import { OtpForm } from "../components/ui/otp-form";
import { PasswordResetForm } from "../components/ui/password-reset-form";

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

  // La pantalla de entrada es la primera que ve alguien, y la que más
  // depende de que el teclado y el lector de pantalla funcionen (#130). Se
  // revisa con el error visible, que es el estado que estrena una región
  // viva y un `role="alert"`.
  it("no detecta violaciones en la pantalla de entrada, ni con el error visible", async () => {
    const { container } = render(
      <AuthLayout brand={<span>Piensa IT</span>} footer={<span>© 2026</span>}>
        <LoginForm
          value={{ username: "", password: "", remember: false }}
          onChange={() => {}}
          onSubmit={() => {}}
          error="Usuario o contraseña incorrectos."
          onForgot={() => {}}
          onActivate={() => {}}
        />
      </AuthLayout>,
    );

    await expectNoA11yViolations(container);
  });

  // Las otras dos ramas del flujo de entrada (#131), las dos con el error
  // visible: es el estado que estrena la región viva y el `role="alert"`.
  it("no detecta violaciones en el segundo factor ni en la recuperación", async () => {
    const { container, unmount } = render(
      <AuthLayout brand={<span>Piensa IT</span>}>
        <OtpForm
          value="4829"
          onChange={() => {}}
          onSubmit={() => {}}
          sentTo="•••@piensait.com"
          error="El código no es válido."
          onResend={() => {}}
          resendAvailableIn={30}
          onBack={() => {}}
        />
      </AuthLayout>,
    );
    await expectNoA11yViolations(container);
    unmount();

    const recuperacion = render(
      <AuthLayout brand={<span>Piensa IT</span>}>
        <PasswordResetForm
          step="sent"
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          sentTo="•••@piensait.com"
          onBack={() => {}}
        />
      </AuthLayout>,
    );
    await expectNoA11yViolations(recuperacion.container);
  });
});
