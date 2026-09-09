import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion, AccordionTab } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Tabs, TabPanel } from "../components/ui/tabs";

const meta = {
  title: "Guías/Anillo de foco",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    // Composición de QA (sin `component`, cada control lleva su propio
    // estado) — no hay args que controlar ni interacciones grabadas.
    controls: { disable: true },
    actions: { disable: true },
    interactions: { disable: true },
    docs: {
      description: {
        component:
          "Reúne varios controles que dibujan `ring-2 ring-offset-2` — algunos vía `focus-visible:` directo (Button, Tabs, Pagination, Accordion), otros vía `peer-focus-visible:` (RadioGroup) o `data-[focus-visible]:` (Switch, estado propio de Ark UI) — para poder verificar de un vistazo, en tema oscuro, que ninguno deja el hueco del offset sin color (#139). La prueba de Playwright que la captura fuerza `:focus-visible` en cada uno (vía CDP `CSS.forcePseudoState`, o fijando `data-focus-visible` a mano en el caso del Switch) para poder mostrarlos todos enfocados a la vez en una sola captura — el foco real del documento solo puede estar en un elemento a la vez.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function FocusRingGallery() {
  const [tab, setTab] = useState("perfil");
  const [plan, setPlan] = useState("mensual");
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState([40]);
  const [pageIndex, setPageIndex] = useState(1);

  return (
    <div className="grid max-w-2xl gap-8 p-4">
      <section className="grid gap-2" data-testid="focus-ring-button">
        <p className="text-sm font-medium text-muted-foreground">Button</p>
        <Button>Guardar cambios</Button>
      </section>

      <section className="grid gap-2" data-testid="focus-ring-tabs">
        <p className="text-sm font-medium text-muted-foreground">Tabs</p>
        <Tabs value={tab} onValueChange={setTab}>
          <TabPanel value="perfil" header="Perfil">
            <p className="text-sm text-muted-foreground">Información del perfil del usuario.</p>
          </TabPanel>
          <TabPanel value="seguridad" header="Seguridad">
            <p className="text-sm text-muted-foreground">Preferencias de contraseña y sesión.</p>
          </TabPanel>
        </Tabs>
      </section>

      <section className="grid gap-2" data-testid="focus-ring-radio-group">
        <p className="text-sm font-medium text-muted-foreground">RadioGroup (peer-focus-visible)</p>
        <RadioGroup name="plan" value={plan} onChange={setPlan}>
          <RadioGroupItem value="mensual" label="Mensual" />
          <RadioGroupItem value="anual" label="Anual" />
        </RadioGroup>
      </section>

      <section className="grid gap-2" data-testid="focus-ring-switch">
        <p className="text-sm font-medium text-muted-foreground">Switch (data-[focus-visible])</p>
        <Switch checked={notifications} onCheckedChange={setNotifications} label="Notificaciones importantes" />
      </section>

      <section className="grid gap-2" data-testid="focus-ring-slider">
        <p className="text-sm font-medium text-muted-foreground">Slider</p>
        <Slider value={volume} onChange={setVolume} />
      </section>

      <section className="grid gap-2" data-testid="focus-ring-pagination">
        <p className="text-sm font-medium text-muted-foreground">Pagination</p>
        <Pagination pageIndex={pageIndex} pageCount={5} pageSize={10} totalItems={42} onPageIndexChange={setPageIndex} />
      </section>

      <section className="grid gap-2" data-testid="focus-ring-accordion">
        <p className="text-sm font-medium text-muted-foreground">Accordion</p>
        <Accordion>
          <AccordionTab header="¿Cómo instalo la librería?">
            <p className="text-sm">Con `npm install @piensa-it/ui-library` desde GitHub Packages.</p>
          </AccordionTab>
          <AccordionTab header="¿Cómo cambio el tema?">
            <p className="text-sm">Sobreescribiendo las CSS variables definidas en `globals.css`.</p>
          </AccordionTab>
        </Accordion>
      </section>
    </div>
  );
}

export const Galeria: Story = {
  name: "Galería",
  render: () => <FocusRingGallery />,
};
