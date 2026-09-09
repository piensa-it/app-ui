import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoginForm, type LoginFormValue } from "./login-form";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Field } from "./field";
import { Select } from "./select";

const meta = {
  title: "UI/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "El formulario de entrada estándar (#130): usuario, contraseña, recordarme, los dos enlaces y el botón. Pinta un `<form>` de verdad —Enter envía desde cualquiera de los dos campos, y los gestores de contraseñas necesitan un formulario real para ofrecer guardar—, y los campos declaran su propósito con `autoComplete` (WCAG 2.1 SC 1.3.5). El botón **no** se deshabilita con los campos vacíos: deshabilitarlo esconde el motivo; se deja enviar y la aplicación contesta con `error`. Controlado y sin negocio: ni fetch, ni router, ni sesión. Va dentro de `AuthLayout`.",
      },
    },
  },
  args: {
    value: { username: "", password: "", remember: false },
    onChange: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const inicial: LoginFormValue = { username: "", password: "", remember: false };

const Demo = ({
  initial = inicial,
  ...props
}: Partial<React.ComponentProps<typeof LoginForm>> & { initial?: LoginFormValue }) => {
  const [value, setValue] = React.useState(initial);
  return (
    <div className="max-w-sm">
      <LoginForm value={value} onChange={setValue} onSubmit={() => {}} {...props} />
    </div>
  );
};

export const Basico: Story = {
  name: "Básico",
  render: () => <Demo onForgot={() => {}} onActivate={() => {}} />,
};

export const SinEnlaces: Story = {
  name: "Sin enlaces",
  parameters: {
    docs: {
      description: {
        story:
          "Los enlaces solo se pintan si llegan `onForgot`/`onActivate`. Una aplicación interna que no ofrece autoservicio no tiene que esconderlos con CSS: no existen.",
      },
    },
  },
  render: () => <Demo />,
};

export const ConError: Story = {
  name: "Con error",
  parameters: {
    docs: {
      description: {
        story:
          "El hueco del mensaje existe desde el primer render (una región `aria-live` vacía), así que al aparecer el error se anuncia al lector de pantalla y el formulario no da un salto bajo el cursor.",
      },
    },
  },
  render: () => <Demo error="Usuario o contraseña incorrectos." onForgot={() => {}} />,
};

export const Enviando: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con `loading` el botón anuncia «Entrando…» y descarta un segundo envío, pero sigue enfocable: usa `aria-disabled`, no `disabled`, para no perder el foco del teclado ni el anuncio del cambio de texto.",
      },
    },
  },
  render: () => <Demo initial={{ username: "amontoya", password: "secreta", remember: true }} loading />,
};

export const ConCampoPropio: Story = {
  name: "Con un campo propio",
  parameters: {
    docs: {
      description: {
        story: "`children` entra entre los campos estándar y el botón: una sede, un aviso legal, lo que la aplicación necesite.",
      },
    },
  },
  render: () => (
    <Demo onForgot={() => {}}>
      <Field label="Sede">
        <Select
          value="medellin"
          onChange={() => {}}
          options={[
            { value: "medellin", label: "Medellín" },
            { value: "bogota", label: "Bogotá" },
          ]}
        />
      </Field>
    </Demo>
  ),
};

export const SesionCaducada: Story = {
  name: "Sesión caducada",
  parameters: {
    docs: {
      description: {
        story:
          "Volver a entrar **sí** es un caso de ventana modal: conserva la pantalla de detrás, que es justo lo que se quiere al recuperar una sesión caída a mitad de un trabajo. No estrena componente —es el `LoginForm` de siempre dentro del `Dialog` que ya existe, con el usuario ya puesto y sin el enlace de activar—. Entrar *por primera vez* es al revés: pantalla completa (`AuthLayout`), por lo enlazable y por los gestores de contraseñas.",
      },
    },
  },
  render: function SesionCaducadaDemo() {
    const [value, setValue] = React.useState<LoginFormValue>({
      username: "amontoya",
      password: "",
      remember: true,
    });
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogHeader>
          <DialogTitle>Tu sesión caducó</DialogTitle>
          <DialogDescription>Vuelve a entrar para seguir donde ibas.</DialogDescription>
        </DialogHeader>
        <LoginForm value={value} onChange={setValue} onSubmit={() => {}} onForgot={() => {}} />
      </Dialog>
    );
  },
};
