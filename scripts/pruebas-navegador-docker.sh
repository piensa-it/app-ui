#!/usr/bin/env bash
#
# Ejecuta las pruebas de navegador dentro de la imagen oficial de Playwright,
# que es el mismo Linux y el mismo Chromium que usa CI.
#
# Sirve para dos cosas distintas:
#
#  1. Generar las capturas de referencia de Linux —las que compara el gate— sin
#     pasar por Actions. Antes había que empujar, esperar a que el gate fallara
#     y bajarse el artefacto; ahora salen aquí en un minuto.
#
#  2. Ver en verde o en rojo lo mismo que verá CI antes de empujar. Cada empujón
#     a una rama con PR abierto dispara CI y Security enteros, y en un
#     repositorio privado eso se factura.
#
# Las capturas que escribe llevan el sufijo `-linux` porque dentro del
# contenedor `process.platform` es linux. Las de macOS se siguen regenerando
# fuera, con `npm run test:browser -- --update-snapshots`.
#
# Uso:
#   npm run test:browser:docker                 # comprobar
#   npm run test:browser:docker:update          # regenerar las de Linux
#   npm run test:browser:docker -- -g armazon   # pasar opciones a Playwright
set -euo pipefail

cd "$(dirname "$0")/.."

if ! docker info >/dev/null 2>&1; then
  echo "Docker no está corriendo. Arrancá Docker Desktop y volvé a intentarlo." >&2
  exit 1
fi

# La imagen tiene que ser la de la MISMA versión de Playwright que el paquete:
# si no coinciden, el navegador que trae la imagen no es el que espera la
# librería y las capturas dejan de ser comparables con las de CI.
VERSION="$(node -p "require('@playwright/test/package.json').version")"
IMAGEN="mcr.microsoft.com/playwright:v${VERSION}-noble"

# `node_modules` va en un volumen propio y no en el del repositorio: los
# binarios de esbuild y rolldown que instala macOS no se ejecutan en Linux, y
# montar la carpeta del host encima rompería el contenedor.
VOLUMEN="app-ui-node-modules-linux"

echo "→ imagen: ${IMAGEN}"

docker run --rm \
  $([ -t 0 ] && echo "-it") \
  --ipc=host \
  -v "$PWD":/app \
  -v "${VOLUMEN}":/app/node_modules \
  -w /app \
  -e CI \
  "${IMAGEN}" \
  bash -euo pipefail -c '
    # Reinstalar en cada corrida costaría más que la propia prueba, así que se
    # instala solo cuando cambia el candado de dependencias.
    HUELLA="$(sha256sum package-lock.json | cut -d" " -f1)"
    if [ "$(cat node_modules/.huella-lock 2>/dev/null || true)" != "$HUELLA" ]; then
      echo "→ instalando dependencias de Linux (solo cuando cambia package-lock.json)"
      npm ci
      echo "$HUELLA" > node_modules/.huella-lock
    fi
    npx playwright test "$@"
  ' -- "$@"
