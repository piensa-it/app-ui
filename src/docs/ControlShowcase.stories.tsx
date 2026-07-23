import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { DatePicker } from "../components/ui/date-picker";
import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { InputGroup, InputGroupAddon } from "../components/ui/input-group";
import { MultiSelect } from "../components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";

const meta = {
  title: "Guías/Composición de controles",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Prueba de composición responsive para revisar alineación, densidad, estados y ritmo vertical de los controles.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ProfessionalForm({ compact = false }: { compact?: boolean }) {
  const [country, setCountry] = React.useState<string | number | null>("co");
  const [areas, setAreas] = React.useState<Array<string | number>>(["finance"]);
  const [notifications, setNotifications] = React.useState(true);
  const [terms, setTerms] = React.useState(false);
  const [plan, setPlan] = React.useState("professional");
  const [date, setDate] = React.useState<Date | null>(new Date());

  return (
    <main className={compact ? "min-h-screen bg-muted p-4" : "min-h-screen bg-muted p-4 sm:p-8 lg:p-12"}>
      <form className={compact ? "mx-auto grid max-w-[375px] gap-8 rounded-xl border border-surface-border bg-card p-5 shadow-sm" : "mx-auto grid max-w-3xl gap-8 rounded-xl border border-surface-border bg-card p-5 shadow-sm sm:p-8"}>
        <header className="border-l-2 border-primary pl-4">
          <h1 className="font-heading text-xl font-semibold sm:text-2xl">Configura tu espacio de trabajo</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Esta composición permite evaluar los controles en un formulario real y responsive.
          </p>
        </header>

        <section className={compact ? "grid gap-5" : "grid gap-5 sm:grid-cols-2"}>
          <Field label="Nombre del equipo" required>
            <Input placeholder="Ej. Finanzas Colombia" />
          </Field>
          <Field label="País" required>
            <Select
              options={[{ label: "Colombia", value: "co" }, { label: "México", value: "mx" }, { label: "Perú", value: "pe" }]}
              value={country}
              onChange={setCountry}
            />
          </Field>
          <Field label="Fecha de inicio">
            <DatePicker value={date} onChange={setDate} />
          </Field>
          <Field label="Áreas involucradas">
            <MultiSelect
              options={[{ label: "Finanzas", value: "finance" }, { label: "Operaciones", value: "operations" }, { label: "Tecnología", value: "technology" }]}
              value={areas}
              onChange={setAreas}
            />
          </Field>
          <Field label="Buscar responsable" description="Busca por nombre o correo." className="sm:col-span-2">
            <InputGroup>
              <InputGroupAddon><Search aria-hidden="true" className="size-4" /></InputGroupAddon>
              <Input placeholder="Buscar persona..." />
            </InputGroup>
          </Field>
          <Field label="Descripción" className="sm:col-span-2">
            <Textarea placeholder="Explica brevemente el objetivo del espacio..." />
          </Field>
        </section>

        <section className="grid gap-4 border-t border-border pt-6">
          <RadioGroup value={plan} onValueChange={setPlan}>
            <RadioGroupItem value="basic" label="Básico" description="Para equipos pequeños que están comenzando." />
            <RadioGroupItem value="professional" label="Profesional" description="Controles avanzados, reportes y automatización." />
          </RadioGroup>
          <Switch checked={notifications} onCheckedChange={setNotifications} label="Notificaciones importantes" description="Recibe alertas sobre cambios y tareas pendientes." />
          <Checkbox checked={terms} onCheckedChange={setTerms} label="Acepto los términos del servicio" />
        </section>

        <footer className={compact ? "flex flex-col-reverse gap-3 border-t border-border pt-6 [&>button]:w-full" : "flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end"}>
          <Button type="button" variant="plain">Cancelar</Button>
          <Button type="submit">Guardar configuración</Button>
        </footer>
      </form>
    </main>
  );
}

export const FormularioProfesional: Story = { render: () => <ProfessionalForm /> };

export const AnchoMovil: Story = {
  name: "Ancho móvil",
  render: () => <ProfessionalForm compact />,
};
