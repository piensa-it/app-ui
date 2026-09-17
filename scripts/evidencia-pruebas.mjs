#!/usr/bin/env node
/**
 * La constancia de que las pruebas ya se corrieron (modelo de despliegue
 * común de Piensa IT, el mismo de app-corelink).
 *
 * El problema que resuelve: cada PR y cada push a `main` corría en Actions
 * lint, tipos, cobertura, contrato, paquete, Storybook y la suite de navegador
 * (~6 min por corrida, varias veces al día, más las de Dependabot). La cuota
 * gratuita son 2.000 min/mes para toda la organización, y cada fallo llegaba
 * por correo.
 *
 * El mecanismo: `npm run pruebas` corre TODO dentro de la imagen oficial de
 * Playwright (el mismo Linux del CI) y, si pasa entero, escribe
 * `.pruebas-evidencia.json` con el HASH de lo que se probó. Actions recalcula
 * ese hash sobre el commit y compara: si coincide, no repite nada; si no,
 * falla en segundos pidiendo correr `npm run pruebas`.
 *
 * Uso:
 *   node scripts/evidencia-pruebas.mjs hash       # imprime el hash del árbol
 *   node scripts/evidencia-pruebas.mjs cotejar    # `valida` o `invalida` + motivo
 *   node scripts/evidencia-pruebas.mjs mostrar    # la evidencia actual, legible
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

/** La raíz del repositorio, se invoque desde donde se invoque. */
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const ARCHIVO_EVIDENCIA = ".pruebas-evidencia.json";

/**
 * Qué entra en el hash: todo lo que puede cambiar el resultado de las
 * verificaciones o de las pruebas, y nada más. Corregir el README no debe
 * obligar a repetir la suite.
 *
 * Entra el código de la librería y sus pruebas, la receta de compilación y de
 * pruebas (configs, scripts, dependencias exactas) y lo que Storybook sirve,
 * porque la suite de navegador corre sobre Storybook y compara capturas.
 *
 * NO entra: la documentación en Markdown, `.github/` (decide cuándo se prueba,
 * no qué hace la prueba; si entrara, tocar el mecanismo invalidaría la firma
 * del commit que lo arregla), `docs/` y `.piensa/`.
 */
export const RUTAS = [
  "src",
  "tests",
  ".storybook",
  "public",
  "scripts",
  "index.html",
  "package.json",
  "package-lock.json",
  "playwright.config.ts",
  "vite.config.ts",
  "tailwind.config.ts",
  "tailwind-preset.js",
  "postcss.config.js",
  "eslint.config.js",
  "components.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
];

/**
 * Los archivos que entran en el hash, ordenados.
 *
 * Se enumeran con `git ls-files` y no recorriendo el disco: así la lista es
 * idéntica en el Mac y en el runner sin tener que reimplementar `.gitignore`,
 * y `node_modules`, `dist/` o `test-results/` no se cuelan nunca.
 *
 * Cuentan los archivos SEGUIDOS y también los NUEVOS que aún no tienen
 * `git add`, siempre que no estén ignorados. Los nuevos cuentan porque las
 * pruebas acaban de correr contra ellos: son parte de lo que se probó. Antes no
 * contaban, y el resultado era que firmar la constancia y luego commitear el
 * trabajo la invalidaba —justo el caso más común, una función nueva trae
 * archivos nuevos—, obligando a repetir cinco minutos de pruebas para no
 * cambiar ni una línea.
 *
 * La garantía no se pierde. Si el archivo acaba en el commit, su contenido no
 * cambia y el hash sigue cuadrando. Si NO acaba en el commit, en el runner no
 * existe, el hash de allí es otro y las pruebas se corren. El error sigue
 * cayendo del lado de ejecutar de más.
 */
export function archivosDelHash(raiz = RAIZ) {
  const listar = (extra) =>
    execFileSync(
      "git",
      ["ls-files", "-z", ...extra, "--", ...RUTAS],
      { cwd: raiz, maxBuffer: 64 * 1024 * 1024 },
    )
      .toString("utf8")
      .split("\0")
      .filter(Boolean);

  // `-o --exclude-standard`: lo no seguido que tampoco está en `.gitignore`.
  return [...new Set([...listar([]), ...listar(["-o", "--exclude-standard"])])].sort();
}

/**
 * El hash de lo que afecta a las pruebas.
 *
 * Se calcula sobre el CONTENIDO en disco, no sobre el índice de git: en local
 * el árbol de trabajo puede tener cambios sin preparar, y la evidencia tiene
 * que hablar de lo que realmente se probó. En el runner, recién clonado, el
 * árbol de trabajo es el commit, así que ambos lados calculan lo mismo.
 *
 * El formato —`ruta\0sha256(contenido)\n` por archivo, en orden— hace que
 * renombrar un archivo cambie el hash aunque su contenido no cambie, que es
 * lo correcto: el import roto solo aparece al ejecutar.
 */
export function hashDeLasPruebas(raiz = RAIZ) {
  const total = createHash("sha256");

  for (const ruta of archivosDelHash(raiz)) {
    const completa = path.join(raiz, ruta);
    // Un archivo borrado en el árbol de trabajo pero aún en el índice: se
    // marca como ausente en vez de omitirlo, para que borrarlo cambie el hash.
    const digest = existsSync(completa)
      ? createHash("sha256").update(readFileSync(completa)).digest("hex")
      : "AUSENTE";
    total.update(`${ruta}\0${digest}\n`);
  }

  return total.digest("hex");
}

/**
 * La versión de Playwright, leída del lock y no de `node_modules`.
 *
 * El pipeline coteja la evidencia en el trabajo `plan`, que no hace `npm ci`:
 * ahí `node_modules` no existe. El lock sí, y dice la versión exacta que se
 * instalaría, que es justo la que importa.
 */
export function versionDePlaywright(raiz = RAIZ) {
  const lock = JSON.parse(readFileSync(path.join(raiz, "package-lock.json"), "utf8"));
  return lock.packages?.["node_modules/@playwright/test"]?.version ?? null;
}

export function leerEvidencia(raiz = RAIZ) {
  const ruta = path.join(raiz, ARCHIVO_EVIDENCIA);
  if (!existsSync(ruta)) return null;
  try {
    return JSON.parse(readFileSync(ruta, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Escribe la constancia. Solo debe llamarse cuando la suite pasó ENTERA.
 */
export function escribirEvidencia({ pruebas, verificaciones, imagen, nodo, arquitectura }, raiz = RAIZ) {
  // Silencio en la salida de error: aquí git puede quejarse legítimamente —un
  // repositorio sin commits, un `user.name` sin configurar— y eso no es un
  // problema que haya que enseñarle a nadie. El dato simplemente falta.
  const preguntarle_a_git = (args) => {
    try {
      return execFileSync("git", args, {
        cwd: raiz,
        stdio: ["ignore", "pipe", "ignore"],
      }).toString().trim() || null;
    } catch {
      return null;
    }
  };
  const quien = (arg) => preguntarle_a_git(["config", arg]);
  const commit = () => preguntarle_a_git(["rev-parse", "HEAD"]);

  const evidencia = {
    // Lo primero del archivo: el porqué, para quien lo abra en un diff.
    _lee_esto: "Constancia de que lint, tipos, pruebas con cobertura, contrato, paquete, "
      + "React 18, Storybook y la suite de navegador pasaron en verde antes de este "
      + "commit, dentro de la imagen de Playwright del CI, para que GitHub Actions no "
      + "las repita. Se genera sola con `npm run pruebas`; no se edita a mano. "
      + "Ver DEPLOYMENT.md.",
    // Mismo formato que app-corelink, para que los scripts puedan subir a
    // piensa-it/.github sin cambiar la constancia de ningún repo.
    version_formato: 2,
    hash: hashDeLasPruebas(raiz),
    playwright: versionDePlaywright(raiz),
    pruebas,
    // Lo que corrió en el mismo contenedor ANTES de Playwright. Si cualquiera
    // falla, el guion no llega a firmar: aquí solo hay verdes.
    verificaciones,
    generada: new Date().toISOString(),
    generada_por: {
      nombre: quien("user.name"),
      correo: quien("user.email"),
      maquina: os.hostname(),
    },
    entorno: {
      imagen,
      nodo,
      // Se deja escrito porque NO coincide con el runner: el Mac es arm64 y
      // `ubuntu-latest` es x86_64. La imagen iguala el sistema y el Node; la
      // arquitectura no la iguala nadie.
      arquitectura,
    },
    // Informativo: el commit sobre el que se corrió. No se coteja —el commit
    // que se despliega es posterior, porque incluye esta misma evidencia—,
    // pero sirve para reconstruir qué pasó.
    commit_al_generar: commit(),
  };

  writeFileSync(
    path.join(raiz, ARCHIVO_EVIDENCIA),
    JSON.stringify(evidencia, null, 2) + "\n",
  );

  return evidencia;
}

/**
 * ¿Sirve la evidencia para el árbol que hay ahora mismo?
 *
 * Devuelve siempre un motivo legible: un pipeline que solo dice «se saltó» no
 * permite comprobar que podía saltarse.
 */
export function cotejar(raiz = RAIZ) {
  const evidencia = leerEvidencia(raiz);
  if (!evidencia) {
    return { valida: false, motivo: "No hay `.pruebas-evidencia.json`, o no es JSON legible. Corre `npm run pruebas`." };
  }

  if (evidencia.version_formato !== 2) {
    return {
      valida: false,
      motivo: `La evidencia usa el formato ${evidencia.version_formato}, y aquí se lee el 2`
        + " (el que certifica también typecheck y unitarias).",
    };
  }

  const requeridas = ["auditoria", "lint", "typecheck", "cobertura", "contrato", "paquete", "react18", "storybook"];
  const faltan = requeridas.filter((nombre) => evidencia.verificaciones?.[nombre] !== true);
  if (faltan.length) {
    return {
      valida: false,
      motivo: `La evidencia no certifica: ${faltan.join(", ")}. Corre \`npm run pruebas\`.`,
    };
  }

  const esperada = versionDePlaywright(raiz);
  if (!evidencia.playwright || evidencia.playwright !== esperada) {
    return {
      valida: false,
      motivo: `Playwright cambió: la evidencia se generó con ${evidencia.playwright ?? "«sin dato»"}`
        + ` y el lock pide ${esperada}.`,
    };
  }

  const pasaron = Number(evidencia.pruebas?.pasaron ?? 0);
  if (!Number.isFinite(pasaron) || pasaron <= 0) {
    return { valida: false, motivo: "La evidencia no declara ninguna prueba en verde." };
  }

  const actual = hashDeLasPruebas(raiz);
  if (evidencia.hash !== actual) {
    return {
      valida: false,
      motivo: "El código cambió desde que se generó la evidencia"
        + ` (declara ${String(evidencia.hash).slice(0, 12)}…, el árbol es ${actual.slice(0, 12)}…). Corre \`npm run pruebas\`.`,
    };
  }

  return {
    valida: true,
    motivo: `${pasaron} pruebas en verde el ${evidencia.generada}`
      + ` (${evidencia.generada_por?.nombre ?? "sin firmar"}, ${evidencia.entorno?.imagen ?? "sin imagen"}).`,
  };
}

/* ── Interfaz de línea de comandos ───────────────────────────────────────── */

const invocadoDirectamente = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invocadoDirectamente) {
  const orden = process.argv[2] ?? "cotejar";

  if (orden === "hash") {
    process.stdout.write(hashDeLasPruebas() + "\n");
  } else if (orden === "cotejar") {
    // La palabra sola por la salida estándar, para que el pipeline la capture
    // con `$(...)`; el motivo por la de error, para que se lea en el log.
    const { valida, motivo } = cotejar();
    process.stderr.write(motivo + "\n");
    process.stdout.write((valida ? "valida" : "invalida") + "\n");
  } else if (orden === "mostrar") {
    const e = leerEvidencia();
    process.stdout.write(e ? JSON.stringify(e, null, 2) + "\n" : "No hay evidencia.\n");
  } else {
    process.stderr.write(`Orden desconocida: ${orden}. Usa hash, cotejar o mostrar.\n`);
    process.exit(2);
  }
}
