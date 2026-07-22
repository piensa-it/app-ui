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
} from "./index";

/**
 * Playground de desarrollo local — NO se publica (el build de librería usa
 * src/index.ts como entrypoint, no este archivo). Sirve para previsualizar
 * visualmente los componentes mientras se construyen con `npm run dev`.
 */
const App = () => (
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
            <Button className="w-full">Continuar</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  </Layout>
);

export default App;
