#!/usr/bin/env bash
#
# La mitad de dentro de `npm run pruebas`: se ejecuta YA en la imagen oficial
# de Playwright, el mismo Linux que usaba el CI. La mitad de fuera es
# `scripts/pruebas-docker.mjs`, que lanza el contenedor y firma.
#
# Corre TODO lo que antes corría Actions en cada PR y push, en el orden en que
# falla más barato. Con `set -e`, el primer rojo corta aquí y no hay firma.
set -euo pipefail

cd /app
export CI=1   # los mismos modos que el runner: retries, forbidOnly, sin crear capturas

echo "── Entorno ──────────────────────────────────────────────────────────────"
echo "  imagen:        ${IMAGEN_PLAYWRIGHT:-desconocida}"
echo "  arquitectura:  $(uname -m)"
echo "  node:          $(node -v)"

# `node_modules` es un volumen del contenedor (los binarios del Mac no corren en
# Linux). Solo se reinstala cuando cambia el lock.
if ! cmp -s package-lock.json node_modules/.lock-instalado 2>/dev/null; then
  echo
  echo "── npm ci ───────────────────────────────────────────────────────────────"
  npm ci
fi
cp package-lock.json node_modules/.lock-instalado

mkdir -p pruebas-locales
rm -f pruebas-locales/verificaciones.json

paso() {
  echo
  echo "── $1 ──────────────────────────────────────────────────────────────"
}

paso "npm audit (dependencias publicadas)"
npm audit --omit=dev --audit-level=high

paso "lint"
npm run lint

paso "typecheck"
npm run typecheck

paso "pruebas con cobertura"
npx vitest run --coverage --reporter=default --reporter=json --outputFile.json=pruebas-locales/unitarias.json

paso "contrato público"
npm run verify:contract

paso "paquete (build, externos y tamaño)"
npm run verify:package

# Instala React 18 sin tocar package.json y restaura lo que había al terminar.
paso "React 18"
LOCK_ANTES="$(sha256sum package-lock.json | cut -d" " -f1)"
npm run verify:react18
# `verify:react18` restaura con `npm install`: si eso reescribiera el lock, la
# constancia firmaría un árbol distinto al del commit. Se exige que no cambie.
if [ "$(sha256sum package-lock.json | cut -d" " -f1)" != "$LOCK_ANTES" ]; then
  echo "verify:react18 modificó package-lock.json. Revierte el lock y repite." >&2
  exit 1
fi
cp package-lock.json node_modules/.lock-instalado

node -e '
  const fs = require("node:fs");
  let unitarias = null;
  try { unitarias = JSON.parse(fs.readFileSync("pruebas-locales/unitarias.json", "utf8")).numPassedTests ?? null; } catch {}
  fs.writeFileSync("pruebas-locales/verificaciones.json", JSON.stringify({
    auditoria: true, lint: true, typecheck: true, cobertura: true, contrato: true,
    paquete: true, react18: true, unitarias_pasaron: unitarias,
  }));
  fs.writeFileSync("pruebas-locales/entorno.json", JSON.stringify({
    nodo: process.version, arquitectura: process.arch, imagen: process.env.IMAGEN_PLAYWRIGHT ?? null,
  }));
'

# La suite de navegador ENTERA. Su `webServer` construye Storybook, así que un
# verde aquí también certifica el build de la documentación.
paso "playwright (suite completa, sobre Storybook)"
PLAYWRIGHT_JSON_OUTPUT_NAME=pruebas-locales/navegador.json \
  npx playwright test --reporter=line,json
