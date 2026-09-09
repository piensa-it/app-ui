import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthLayout } from "./auth-layout";
import { LoginForm, type LoginFormValue } from "@/components/ui/login-form";
import { ImageCarouselBackdrop } from "@/components/marketing/image-carousel-backdrop";

// Placeholder de color sólido, como en la story del propio carrusel: en un
// producto real son fotos que pasa la aplicación. Aquí va **una sola** a
// propósito: lo que documenta esta story es el armazón, no el carrusel —que
// tiene su propia story y sus propias capturas—, y con una imagen la captura
// comparada de esta pantalla no depende de en qué momento del ciclo se tomó.
const fotos = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'%3E%3Crect width='800' height='1000' fill='%230f172a'/%3E%3C/svg%3E",
];

const Marca = () => (
  <div className="flex items-center gap-ui-sm">
    <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
      P
    </span>
    <span className="text-ui-title-sm font-semibold">Piensa IT</span>
  </div>
);

const Pie = () => (
  <p className="text-ui-caption text-muted-foreground">© 2026 Piensa IT · Términos y privacidad</p>
);

const meta = {
  title: "Layout/AuthLayout",
  component: AuthLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "La pantalla de entrada partida (#130): marca, formulario y pie a la izquierda; el panel de imagen a la derecha. Es una **pantalla completa, no una ventana modal**, y esa es la decisión de fondo: la ruta queda enlazable, el navegador autocompleta y ofrece guardar la contraseña sin pelearse con una capa, el foco no queda atrapado y el teclado de móvil no compite con un diálogo. El modal se reserva para *volver* a entrar con la sesión caducada —ver la story «Sesión caducada» de `LoginForm`—. El panel derecho es un hueco, no una variante: recibe lo que sea, y por debajo de `md` simplemente no se pinta.",
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (props: Partial<React.ComponentProps<typeof AuthLayout>>) => {
  const [value, setValue] = React.useState<LoginFormValue>({ username: "", password: "", remember: false });
  return (
    <AuthLayout
      brand={<Marca />}
      aside={<ImageCarouselBackdrop images={fotos} />}
      footer={<Pie />}
      {...props}
    >
      <div className="flex flex-col gap-ui-lg">
        <div className="flex flex-col gap-ui-2xs">
          <h1 className="text-ui-title font-semibold">Entrar</h1>
          <p className="text-sm text-muted-foreground">Usa el usuario de tu empresa.</p>
        </div>
        <LoginForm
          value={value}
          onChange={setValue}
          onSubmit={() => {}}
          onForgot={() => {}}
          onActivate={() => {}}
        />
      </div>
    </AuthLayout>
  );
};

export const Basico: Story = {
  name: "Pantalla de entrada",
  render: () => <Demo />,
};

export const SinPanel: Story = {
  name: "Sin panel",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `aside` no se pinta la segunda columna —no queda media pantalla en blanco— y el formulario ocupa el ancho. Es también lo que se ve por debajo de `md` en la story de arriba.",
      },
    },
  },
  render: () => <Demo aside={undefined} />,
};

export const Estrecho: Story = {
  name: "Pantalla estrecha",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story: "Por debajo de `md` el panel desaparece y el formulario ocupa el ancho.",
      },
    },
  },
  render: () => <Demo />,
};
