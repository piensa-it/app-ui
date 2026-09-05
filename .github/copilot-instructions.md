# Instrucciones para el agente de Copilot

La fuente de verdad del proyecto es `AGENTS.md` en la raíz: stack, estructura,
patrones y convenciones. Leelo entero antes de tocar nada. Esto es lo que
`AGENTS.md` no dice porque es específico de trabajar como agente en la nube.

## Antes de dar algo por hecho

Cada cambio pasa las mismas puertas que un PR humano, y las corrés vos antes de
abrir el PR:

```bash
npm run typecheck        # 0 errores
npm run test:run         # todo en verde
npm run lint             # 0 errores (los warnings existentes no cuentan)
npm run verify:package   # el paquete se construye y se puede consumir
npm run test:browser     # 18 pruebas de navegador, capturas incluidas
```

`npm run verify:react18` además, si tocaste tipos públicos o algo con `ref`:
la librería compila contra React 18 y 19, y `RefObject` cambia de forma entre
los dos.

Si `test:browser` cambia capturas, regenerá **solo** las `*-linux.png`
(`npm run test:browser -- --update-snapshots=all`) y explicá en el PR qué
cambió y por qué. Las `*-darwin.png` no las toques nunca: se generan en macOS
y este entorno es Linux.

## Qué tiene que traer un cambio

- Un componente nuevo o una prop nueva viene con story (`*.stories.tsx`,
  `tags: ["autodocs"]`), prueba en `src/__tests__/` y export en
  `src/index.ts`. Sin las tres cosas no está terminado.
- Entrada en `CHANGELOG.md` bajo `## [Unreleased]`, escrita para quien
  actualiza: qué cambia para él y por qué existía el problema. No una lista de
  archivos.
- Si el cambio rompe compatibilidad, entrada en `migration` de la versión
  actual en `src/version.ts`, como instrucción («sustituí X por Y»), y `feat!`
  o `fix!` en el título.

## Commits y PR

- Título del PR y asunto del commit en Conventional Commits, y el asunto **en
  minúsculas**: `feat(stat): tone, para decir qué clase de noticia es la
  cifra`. `commitlint` rechaza `feat(ui): AppSwitcher …` por la mayúscula.
- El cuerpo del PR dice qué se decidió y por qué, y qué se verificó con
  números. Si el issue propone un remedio, medí antes si funciona: en #71 la
  vía que el issue daba por buena no funcionaba y se descubrió compilando.
- Cerrá el issue con `Closes #N` en el cuerpo (en inglés: GitHub no reconoce
  «Cierra»).

## Lo que no hacés

- No añadís dependencias de routing, data-fetching o backend.
- No hardcodeás colores: todo pasa por los tokens (`bg-primary`,
  `text-muted-foreground`…). `--accent` no es un color de marca.
- No adivinás atributos de Ark UI: verificá `data-scope`/`data-part`/
  `data-state` en `node_modules/@ark-ui/react/dist/components/<c>/<c>.d.ts` y
  en `node_modules/@zag-js/<c>/dist/*.js` antes de tematizar.
- No usás `max-w-*` por espaciado ni `p-md`: los pasos del espaciado llevan
  prefijo (`p-ui-md`); los de rol no (`p-inset`, `space-y-stack`).
- No publicás versiones: el bump y el Release los hace una persona.
