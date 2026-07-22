import { useState } from "react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Separator,
  Layout,
  UiProvider,
  Select,
  Checkbox,
  Switch,
  Tabs,
  TabPanel,
  DataTable,
  Column,
  Avatar,
  Progress,
  toast,
} from "./index";

interface Usuario {
  nombre: string;
  rol: string;
}

const usuarios: Usuario[] = [
  { nombre: "Ana Gómez", rol: "Admin" },
  { nombre: "Luis Pérez", rol: "Editor" },
  { nombre: "Marta Ruiz", rol: "Lector" },
];

/**
 * Playground de desarrollo local — NO se publica (el build de librería usa
 * src/index.ts como entrypoint, no este archivo). Sirve para previsualizar
 * visualmente los componentes mientras se construyen con `npm run dev`.
 */
const App = () => {
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [notificaciones, setNotificaciones] = useState(true);

  return (
    <UiProvider>
      <Layout
        brand={<span className="text-lg font-bold">Piensa IT · UI Library</span>}
        footer="Playground de desarrollo — @piensa-it/ui-library"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-8 py-8">
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">Botones</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button onClick={() => toast.success({ summary: "Listo", detail: "Notificación de prueba." })}>
                Probar toast
              </Button>
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">Badges</h2>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">Card + Input</h2>
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>Ejemplo de formulario básico con los tokens del design system.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Input placeholder="Correo electrónico" type="email" />
                <Select
                  options={[
                    { label: "Colombia", value: "co" },
                    { label: "México", value: "mx" },
                    { label: "España", value: "es" },
                  ]}
                  placeholder="País"
                />
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={aceptaTerminos} onCheckedChange={setAceptaTerminos} />
                  Acepto los términos y condiciones
                </label>
                <label className="flex items-center justify-between text-sm">
                  Notificaciones por correo
                  <Switch checked={notificaciones} onCheckedChange={setNotificaciones} />
                </label>
                <Button className="w-full">Continuar</Button>
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">Componentes de datos (PrimeReact)</h2>
            <Tabs>
              <TabPanel header="Tabla">
                <DataTable value={usuarios} rows={5}>
                  <Column field="nombre" header="Nombre" sortable />
                  <Column field="rol" header="Rol" sortable />
                </DataTable>
              </TabPanel>
              <TabPanel header="Progreso">
                <div className="flex flex-col gap-3">
                  <Progress value={35} />
                  <Progress value={70} />
                </div>
              </TabPanel>
              <TabPanel header="Avatares">
                <div className="flex gap-2">
                  <Avatar label="AM" style={{ backgroundColor: "hsl(var(--primary))", color: "white" }} />
                  <Avatar icon="pi pi-user" />
                </div>
              </TabPanel>
            </Tabs>
          </section>
        </div>
      </Layout>
    </UiProvider>
  );
};

export default App;
