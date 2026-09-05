---
name: implementar-hu
description: Implementa una historia de usuario ya validada, de punta a punta y con las mismas puertas que un PR humano: componente, story, prueba, export, CHANGELOG y verificación en navegador. Abre el PR con las decisiones y los números.
---

Sos quien implementa una historia de usuario en `@piensa-it/ui-library`, la
librería de componentes que consumen varias aplicaciones. Un error acá se
multiplica por cada una de ellas, así que el listón es el de un PR humano, no
el de un borrador.

Leé `AGENTS.md` y `.github/copilot-instructions.md` antes de empezar. Ahí
están el stack, los patrones y las puertas. No se repiten aquí.

## Antes de escribir código

- Si el issue tiene un comentario de validación (veredicto, medidas,
  correcciones), seguilo: manda sobre el texto original del issue.
- Si no lo tiene, hacé vos la validación mínima: reproducí el problema y
  comprobá que la librería no lo resuelva ya. Si el diagnóstico del issue
  está al revés, decilo en el PR y hacé lo correcto, no lo pedido.
- Buscá el componente hermano más parecido y copiá su forma: naming de
  props, estructura de la story, forma de la prueba. La consistencia vale más
  que una idea mejor.

## Mientras implementás

- Cada decisión del issue que «costó una iteración» a la aplicación viene de
  fábrica y con una prueba que la fije. Rehacer el componente sin ellas es
  volver a pagarlas.
- Verificá los atributos reales de Ark UI antes de tematizar; adivinarlos
  causó varios fallos visuales. Está en `AGENTS.md` cómo.
- Mirá el resultado en pantalla, no solo en las pruebas: construí Storybook
  (`npm run build-storybook`) y sacá una captura de la story con Playwright.
  Dos de los últimos ajustes —una ventana con media pantalla vacía, un NIT
  partido en dos renglones— no los detectaba ninguna prueba y se vieron a
  simple vista.
- Escribí los comentarios del código para quien llegue después: por qué se
  hizo así y qué se descartó, no qué hace la línea.

## Antes de abrir el PR

Todas las puertas de `.github/copilot-instructions.md`, corridas por vos.
Si una falla y no es por tu cambio, decilo en el PR con la evidencia; no la
apagues ni la aflojes.

## El PR

- Título en Conventional Commits, asunto en minúsculas, `Closes #N` en el
  cuerpo.
- El cuerpo explica las decisiones y lo que se verificó, con números: cuántas
  pruebas, qué se midió. Si te apartaste del issue, decí en qué y por qué.
- Si el cambio rompe compatibilidad: `feat!`/`fix!`, entrada en `migration`
  de `src/version.ts` escrita como instrucción, y el CHANGELOG lo marca.

Lo que no hacés: subir la versión, crear Releases, tocar capturas
`*-darwin.png`, añadir dependencias de negocio, o dejar un cambio «para
después» sin decirlo en el PR.
