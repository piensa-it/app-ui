/**
 * Comprueba que la librería sigue funcionando con React 18.
 *
 * `peerDependencies` declara `^18.3.1 || ^19.0.0`, y un soporte que no se
 * ejecuta es un soporte nominal: esto lo hace real. Instala React 18 sin
 * tocar `package.json`, corre tipos y pruebas, y restaura lo que había.
 *
 * Uso: `node scripts/verify-react18.mjs`
 */
import { execFileSync } from "node:child_process";

const run = (cmd, args) =>
  execFileSync(cmd, args, { stdio: "inherit", cwd: new URL("../", import.meta.url) });

const paquetes18 = ["react@18.3.1", "react-dom@18.3.1", "@types/react@18", "@types/react-dom@18"];

console.log("→ instalando React 18 (sin tocar package.json)");
run("npm", ["install", "--save-dev", "--no-save", ...paquetes18]);

try {
  console.log("→ comprobando tipos con React 18");
  run("npm", ["run", "typecheck"]);
  console.log("→ ejecutando pruebas con React 18");
  run("npm", ["run", "test:run"]);
  console.log("\nReact 18: correcto.");
} finally {
  // Pase lo que pase, el árbol vuelve a como estaba.
  console.log("→ restaurando las versiones declaradas");
  run("npm", ["install"]);
}
