/**
 * Comprueba que la librería sigue funcionando con React 18.
 *
 * `peerDependencies` declara `^18.3.1 || ^19.0.0`, y un soporte que no se
 * ejecuta es un soporte nominal: esto lo hace real. Instala React 18 sin
 * tocar `package.json`, corre tipos y pruebas, compila un consumidor JSX real
 * contra el `dist` publicado con `@types/react` 18, y restaura lo que había.
 *
 * El paso del consumidor existe por #87: `tsc --noEmit -p tsconfig.app.json`
 * (el paso de "tipos" de arriba) compila la LIBRERÍA, con sus propias
 * versiones de React instaladas — nunca compila el `.d.ts` publicado como lo
 * vería un consumidor. Un componente de clase sin el tipo de retorno de
 * `render()` anotado explícitamente compila bien ahí, pero el `.d.ts` que
 * genera arrastra la unión inlineada del React del build (19), que
 * `@types/react` 18 rechaza como componente JSX. Solo compilar un `.tsx` de
 * verdad contra el `dist` ya construido, con React 18 activo, detecta eso.
 *
 * Uso: `node scripts/verify-react18.mjs`
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootUrl = new URL("../", import.meta.url);
const rootPath = fileURLToPath(rootUrl);

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", cwd: rootPath });

const paquetes18 = ["react@18.3.1", "react-dom@18.3.1", "@types/react@18", "@types/react-dom@18"];

/**
 * Componentes exportados que un consumidor monta como JSX. No es todo el
 * barrel: alcanza con que cada forma de componente que la librería puede
 * producir (función, `forwardRef`, y la única clase, `GlobalErrorBoundary`)
 * esté representada, que es donde el `.d.ts` puede divergir entre versiones
 * de React. Si se agrega un componente de clase nuevo, súmalo aquí.
 */
const CONSUMER_SOURCE = `import { Button, GlobalErrorBoundary } from "@piensa-it/ui-library";

export function Consumidor() {
  return (
    <GlobalErrorBoundary title="Ups" onAction={() => {}}>
      <Button>Continuar</Button>
    </GlobalErrorBoundary>
  );
}
`;

/**
 * Compila un `.tsx` de consumidor contra el `dist` ya construido, con
 * `@types/react` 18 como único React visible (el que este script acaba de
 * instalar). Lanza si `tsc` falla.
 */
function compileConsumer() {
  // Dentro del repo, no en el tmpdir del sistema: la resolución de módulos de
  // Node (para `react/jsx-runtime`, que el `jsx: "react-jsx"` necesita)
  // camina hacia arriba buscando `node_modules` desde donde vive el archivo.
  // Fuera del árbol del repo no encontraría el React 18 recién instalado.
  const dir = mkdtempSync(path.join(rootPath, ".tmp-react18-consumer-"));
  try {
    const entry = path.join(dir, "consumer.tsx");
    writeFileSync(entry, CONSUMER_SOURCE);

    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        esModuleInterop: true,
        paths: {
          "@piensa-it/ui-library": [path.join(rootPath, "dist/index.d.ts")],
        },
      },
      include: [entry],
    };
    const tsconfigPath = path.join(dir, "tsconfig.json");
    writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

    execFileSync(path.join(rootPath, "node_modules/.bin/tsc"), ["--noEmit", "-p", tsconfigPath], {
      stdio: "inherit",
      cwd: rootPath,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log("→ construyendo dist con las dependencias declaradas");
run("npm", ["run", "build"]);

console.log("→ instalando React 18 (sin tocar package.json)");
run("npm", ["install", "--save-dev", "--no-save", ...paquetes18]);

try {
  console.log("→ comprobando tipos con React 18");
  run("npm", ["run", "typecheck"]);
  console.log("→ ejecutando pruebas con React 18");
  run("npm", ["run", "test:run"]);
  console.log("→ compilando un consumidor JSX real contra dist/, con @types/react 18");
  compileConsumer();
  console.log("\nReact 18: correcto.");
} finally {
  // Pase lo que pase, el árbol vuelve a como estaba.
  console.log("→ restaurando las versiones declaradas");
  run("npm", ["install"]);
}
