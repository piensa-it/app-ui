# Backlog

El backlog vivo está en el tablero **[UIs](https://github.com/orgs/piensa-it/projects/4)**, un issue por trabajo. Este documento es el mapa: en qué orden conviene atacarlo y por qué, que es lo que no cabe en un issue suelto.

Estado a 0.4.2, con MiDivisa y Corelink en producción y TuDivisa por llegar. Un cambio aquí afecta a tres aplicaciones a la vez: esa es la razón de que este documento exista.

---

## Ahora

|  | Issue | Por qué primero |
| --- | --- | --- |
| 1 | [#48](https://github.com/piensa-it/app-ui/issues/48) — `w-control-*` no se genera | Rompe algo hoy: todo botón de icono sale a media anchura, en cuatro sitios. Verificado compilando el preset. Es de una tarde |
| 2 | [#49](https://github.com/piensa-it/app-ui/issues/49) — el menú no separa sus secciones | Implementado en `fix/49-separacion-entre-grupos-menu`, pendiente de PR |

---

## Deuda que ya duele

Va antes que las migraciones **a propósito**: sin red de pruebas, una migración de React o Tailwind se valida a ojo. Los tres primeros se refuerzan entre sí y conviene hacerlos seguidos.

|  | Issue |  |
| --- | --- | --- |
| 3 | [#50](https://github.com/piensa-it/app-ui/issues/50) | 35 exports sin ninguna prueba, incluido `GlobalErrorBoundary` |
| 4 | [#51](https://github.com/piensa-it/app-ui/issues/51) | La cobertura del 86 % no mide lo que creemos |
| 5 | [#52](https://github.com/piensa-it/app-ui/issues/52) | Nada verifica las reglas que nos dimos |
| 6 | [#53](https://github.com/piensa-it/app-ui/issues/53) | Ningún overlay pasa por axe, y el contraste no lo comprueba nadie |
| 7 | [#54](https://github.com/piensa-it/app-ui/issues/54) | `Layout` y `AppShell` conviven, y el README enseña el viejo |

Los tres fallos de accesibilidad que llevamos (el `aria-label` de MultiSelect, los aria de Select y DatePicker, los dos landmarks con el mismo nombre) se encontraron **integrando, no en CI**. El #53 es el que cierra esa vía.

---

## Migraciones

El orden importa: cada paso deja el siguiente más barato, y mezclarlos hace imposible saber qué rompió qué.

|  | Issue | Tamaño real |
| --- | --- | --- |
| 8 | [#55](https://github.com/piensa-it/app-ui/issues/55) — ola de mantenimiento | Un `npm update`. Deja el terreno limpio para que lo que rompa después sea atribuible |
| 9 | [#56](https://github.com/piensa-it/app-ui/issues/56) — React 19 | **Más barato de lo que parece.** Ninguna API eliminada está en uso y ninguna dependencia bloquea. Sale como minor |
| 10 | [#57](https://github.com/piensa-it/app-ui/issues/57) — herramental | No toca `dist/`; puede ir en paralelo con React 19 |
| 11 | [#59](https://github.com/piensa-it/app-ui/issues/59) — `tailwind-merge` | Decidir antes de tocar Tailwind, no después |
| 12 | [#58](https://github.com/piensa-it/app-ui/issues/58) — spike de Tailwind 4 | **Proyecto, no actualización.** El preset es API pública de tres apps: el release hay que coordinarlo con un PR en cada una |

**TypeScript 7 no está en la lista y no es olvido.** Es estable y mucho más rápido, pero salió sin API programática estable, y por eso `typescript-eslint` todavía declara `typescript <6.1.0`. Como usamos `typescript-eslint` y `vite-plugin-dts` con `rollupTypes`, no hay ruta viable hoy. Revisar cuando salga 7.1; detalle en [#57](https://github.com/piensa-it/app-ui/issues/57).

---

## Cuando toque

| Issue |  |
| --- | --- |
| [#60](https://github.com/piensa-it/app-ui/issues/60) | Faltan cuatro patrones. El más urgente es la entrada monetaria: las tres apps son financieras y cada una formatea pesos a mano |
| [#61](https://github.com/piensa-it/app-ui/issues/61) | El botón de icono escrito tres veces; solo 14 de 60 componentes usan las recipes |
| [#62](https://github.com/piensa-it/app-ui/issues/62) | Nombres de props inconsistentes entre controles hermanos |
| [#63](https://github.com/piensa-it/app-ui/issues/63) | Seis archivos en PascalCase, y `Sheet` dentro de `sidebar.tsx` |
| [#64](https://github.com/piensa-it/app-ui/issues/64) | `framer-motion` de producción por dos archivos de marketing |
| [#65](https://github.com/piensa-it/app-ui/issues/65) | `data-table.tsx` concentra la deuda: 604 líneas, el único aviso de lint con posible fallo real |
| [#66](https://github.com/piensa-it/app-ui/issues/66) | `COMPONENT_STATUS.md` y otros documentos mienten sobre el estado actual |

---

## Lo que no está verificado

Para no confundir lo comprobado con lo supuesto:

- El análisis de React 19 y Tailwind 4 es **estático**: lectura de código y de las dependencias que declara cada paquete. No se instaló ni ejecutó nada con las versiones nuevas, así que los errores de tipos previstos en [#56](https://github.com/piensa-it/app-ui/issues/56) son la superficie encontrada leyendo, no un conteo del compilador.
- No se revisaron los repositorios de las aplicaciones consumidoras. El impacto de cambiar `tailwind-preset.js` está inferido de cómo lo documentamos, no de leer sus configuraciones.
- Que `tailwindcss-animate` funcione con Tailwind 4 no está probado. Es una de las preguntas del spike.
- Que el desajuste de `tailwind-merge` ([#59](https://github.com/piensa-it/app-ui/issues/59)) esté causando fallos hoy es una hipótesis coherente con lo que vimos en 0.4.1, no una reproducción.
