#!/usr/bin/env node
/**
 * `npm run pruebas`: todas las verificaciones y la suite de navegador, en local,
 * dentro de la imagen de Playwright del CI, y la constancia firmada si pasan.
 *
 * Es la mitad de FUERA: comprueba Docker (levanta Colima si hace falta), lanza
 * el contenedor con `scripts/dentro-del-contenedor.sh` y, solo con todo en
 * verde, escribe `.pruebas-evidencia.json` (`scripts/evidencia-pruebas.mjs`).
 * Ver DEPLOYMENT.md.
 *
 * Uso:
 *   npm run pruebas              # correr todo y firmar
 *   npm run pruebas -- --limpio  # borrar antes el node_modules del contenedor
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

import { ARCHIVO_EVIDENCIA, RAIZ, cotejar, escribirEvidencia, versionDePlaywright } from "./evidencia-pruebas.mjs";

const LOCALES = path.join(RAIZ, "pruebas-locales");
const NAVEGADOR = path.join(LOCALES, "navegador.json");
const VERIFICACIONES = path.join(LOCALES, "verificaciones.json");
const ENTORNO = path.join(LOCALES, "entorno.json");
const VOLUMEN = "app-ui-node-modules-linux";

const morir = (mensaje, codigo = 1) => {
  process.stderr.write(`\n${mensaje}\n`);
  process.exit(codigo);
};
const responde = () => spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0;

if (spawnSync("docker", ["--version"], { stdio: "ignore" }).status !== 0) {
  morir("No hay `docker` en el PATH. Instala Colima (`brew install colima docker`) y vuelve a intentarlo.");
}
if (!responde()) {
  if (spawnSync("colima", ["version"], { stdio: "ignore" }).status !== 0) {
    morir("Docker no responde. Arráncalo y vuelve a intentarlo.");
  }
  console.log("── Docker no responde: se levanta Colima ──");
  spawnSync("colima", ["start"], { stdio: "inherit" });
  spawnSync("docker", ["context", "use", "colima"], { stdio: "ignore" });
  if (!responde()) morir("Colima arrancó pero Docker sigue sin responder: revisa `colima status`.");
}

const version = versionDePlaywright();
if (!version) morir("No se encontró @playwright/test en package-lock.json.");
const imagen = `mcr.microsoft.com/playwright:v${version}-noble`;

if (process.argv.includes("--limpio")) {
  spawnSync("docker", ["volume", "rm", VOLUMEN], { stdio: "inherit" });
}

// Resultados viejos fuera: si el contenedor muere antes de escribir los suyos,
// no se puede firmar con los de otra corrida.
for (const archivo of [NAVEGADOR, VERIFICACIONES, ENTORNO]) {
  if (existsSync(archivo)) rmSync(archivo);
}

console.log(`→ imagen: ${imagen}`);
const corrida = spawnSync(
  "docker",
  [
    "run", "--rm", "--ipc=host",
    "-v", `${RAIZ}:/app`,
    "-v", `${VOLUMEN}:/app/node_modules`,
    "-w", "/app",
    "-e", `IMAGEN_PLAYWRIGHT=${imagen}`,
    imagen,
    "bash", "scripts/dentro-del-contenedor.sh",
  ],
  { cwd: RAIZ, stdio: "inherit" },
);

if (corrida.error) morir(`No se pudo lanzar Docker: ${corrida.error.message}`);
if (corrida.status !== 0) {
  morir(`Las pruebas NO pasaron (código ${corrida.status}). No se escribe constancia.`, corrida.status ?? 1);
}

if (!existsSync(NAVEGADOR) || !existsSync(VERIFICACIONES)) {
  morir("El contenedor salió en verde pero faltan sus resultados en pruebas-locales/. No se firma.");
}

const stats = JSON.parse(readFileSync(NAVEGADOR, "utf8")).stats ?? {};
const pruebas = {
  pasaron: stats.expected ?? 0,
  inestables: stats.flaky ?? 0,
  omitidas: stats.skipped ?? 0,
  fallaron: stats.unexpected ?? 0,
  duracion_ms: Math.round(stats.duration ?? 0),
};
if (pruebas.fallaron > 0 || pruebas.pasaron === 0) {
  morir(`El informe declara ${pruebas.fallaron} fallo(s) y ${pruebas.pasaron} en verde. No se firma.`);
}

// Storybook lo construye el `webServer` de Playwright: si la suite pasó, compiló.
const verificaciones = { ...JSON.parse(readFileSync(VERIFICACIONES, "utf8")), storybook: true };
const entorno = existsSync(ENTORNO) ? JSON.parse(readFileSync(ENTORNO, "utf8")) : {};

const evidencia = escribirEvidencia({ pruebas, verificaciones, imagen: entorno.imagen ?? imagen, nodo: entorno.nodo ?? null, arquitectura: entorno.arquitectura ?? null });
const { valida, motivo } = cotejar();

console.log(
  `\n✔ ${verificaciones.unitarias_pasaron ?? "?"} unitarias y ${pruebas.pasaron} de navegador en verde`
    + (pruebas.inestables ? ` (${pruebas.inestables} inestables)` : "")
    + `.\nConstancia en ${ARCHIVO_EVIDENCIA} (${evidencia.hash.slice(0, 12)}…): ${valida ? "valida" : `INVALIDA: ${motivo}`}.\n`
    + "Haz `git add .pruebas-evidencia.json` y commitéala con el cambio: cualquier edición posterior en src/, tests/ o la configuración la invalida.",
);
if (!valida) process.exit(1);
