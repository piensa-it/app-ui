---
name: revisar-api-publica
description: Revisa el contrato público de @piensa-it/ui-library y detecta cambios que romperían a los repos que la consumen — props renombradas, exports faltantes en el barrel, variantes o alias deprecados eliminados, tipos no exportados, tokens CSS removidos, cambios en el preset de Tailwind o en peerDependencies — y dictamina el impacto en semver. Produce un reporte; no modifica código. Úsala antes de publicar una versión o crear un Release, al hacer bump de version en package.json, cuando se renombre o elimine cualquier cosa exportada, cuando alguien pregunte si un cambio "rompe algo" o "es breaking", y al revisar un PR que toca src/index.ts, las recipes, los tokens o package.json.
---

# Revisión de API pública

Esta librería se instala en varios repos de la compañía. Un cambio que aquí se ve
como una mejora de nomenclatura allá es un build roto que alguien tiene que
diagnosticar sin contexto. Nada en el pipeline detecta eso hoy: `npm run
verify:package` valida el empaquetado (archivos publicados, versión sincronizada,
presupuesto del bundle), no la compatibilidad del contrato.

**Esta skill solo reporta.** Entrega el diagnóstico y el veredicto de semver; que
la persona decida si acepta el breaking change o lo evita.

## Qué es "el contrato público"

Más amplio de lo que parece. Todo esto lo puede estar usando un consumidor:

1. **Lo exportado en [src/index.ts](../../../src/index.ts)** — componentes,
   tipos, recipes `cva`, helpers.
2. **Las props de cada componente exportado**, incluidos sus valores por defecto.
3. **Los valores de variante** de cada recipe (`variant="subtle"` es API).
4. **Las variables CSS de [globals.css](../../../src/styles/globals.css)** — el
   theming por marca funciona porque las apps las sobreescriben. Quitar o
   renombrar un token rompe el tema de quien lo estuviera pisando.
5. **[tailwind-preset.js](../../../tailwind-preset.js)** — se publica y se
   extiende desde los `tailwind.config` de los consumidores.
6. **El campo `exports` de package.json** — las rutas `.`, `./styles.css`,
   `./tailwind-preset`.
7. **`peerDependencies`** — subir un rango obliga a los consumidores a migrar.

## Cómo revisar

Compara contra el punto de partida correcto. Si estás en una rama, el punto de
comparación es `main`; si vas a publicar, es el tag de la última versión
publicada.

```bash
git diff main -- src/index.ts src/lib/recipes/ src/styles/globals.css \
                 tailwind-preset.js package.json src/version.ts

# Superficie exportada antes y ahora
git show main:src/index.ts | grep -oE "export \{[^}]*\}" | sort > /tmp/api-antes.txt
grep -oE "export \{[^}]*\}" src/index.ts | sort > /tmp/api-ahora.txt
diff /tmp/api-antes.txt /tmp/api-ahora.txt

# Tokens CSS que desaparecieron
diff <(git show main:src/styles/globals.css | grep -oE "^\s*--[a-z-]+" | sort -u) \
     <(grep -oE "^\s*--[a-z-]+" src/styles/globals.css | sort -u)
```

Para las props, el diff de texto no basta: lee las interfaces de los componentes
tocados y compáralas. Un `prop?: string` que pasó a `prop: string` es breaking
aunque el diff se vea inocente.

## Qué buscar

**Rompe seguro:**
- Un export que desapareció o cambió de nombre.
- Una prop renombrada, eliminada, o que pasó de opcional a requerida.
- Un valor de variante o tamaño eliminado.
- Un alias `@deprecated` eliminado (`default`, `secondary`, `ghost`, `size:
  default`). Están ahí para no romper a quien migró desde shadcn — quitarlos es
  una decisión de versión mayor, no una limpieza.
- Un token CSS eliminado o renombrado.
- Un rango de `peerDependencies` subido.
- Un cambio en el mapa `exports` de package.json.

**Rompe silenciosamente** (lo peor, porque compila):
- Cambiar un `defaultVariants` — todo consumidor que omitía la prop cambia de
  aspecto sin tocar su código.
- Cambiar el elemento HTML que renderiza un componente, o quitarle el
  `forwardRef`: rompe a quien apuntaba un ref o un selector CSS.
- Dejar de pasar `className` al elemento raíz, o dejar de combinarlo al final con
  `cn()`: los overrides del consumidor dejan de ganar.
- Cambiar el shape del evento de un callback (`onChange(value)` →
  `onChange(event)`).

**Huecos del contrato** (no rompen, pero limitan):
- Componente exportado sin su tipo de props: el consumidor no puede tipar un
  wrapper. El patrón correcto es
  `export { Button, buttonVariants, type ButtonProps } from "...";`
- Componente nuevo en `src/components/` que nunca llegó al barrel — existe pero
  nadie puede importarlo.
- Recipe `cva` usada por un componente exportado pero no exportada ella misma:
  el consumidor no puede componer sobre ella.

```bash
# Componentes sin export en el barrel
for f in src/components/ui/*.tsx; do
  case "$f" in *.stories.tsx) continue;; esac
  base=$(basename "$f" .tsx)
  grep -q "components/ui/$base\"" src/index.ts || echo "sin export: $f"
done
```

## Veredicto de semver

La librería está en `0.x`, donde por convención el segundo número absorbe los
breaking changes. Da el veredicto explícito:

- **Breaking** → `0.MINOR+1.0` (equivalente a un major en 1.x)
- **Feature** (agrega sin romper) → `0.MINOR.PATCH+1`, o minor si es sustancial
- **Fix / interno** → `0.MINOR.PATCH+1`

Recuerda que [src/version.ts](../../../src/version.ts) tiene su propio
`UI_LIBRARY_VERSION` y debe coincidir con `package.json` — `verify:package` falla
si no. Si hay un breaking change, `UI_LIBRARY_RELEASES` es el lugar para mover la
línea anterior a `maintenance` o `deprecated`.

Cuando encuentres un breaking change, no te quedes en el diagnóstico: casi
siempre hay una versión no rompedora del mismo cambio — mantener la prop vieja
como alias `@deprecated` que delega en la nueva, o aceptar ambos nombres por una
versión. Propónla.

## Formato del reporte

```markdown
# API pública — <rama o versión> vs <referencia>

**Veredicto**: Breaking / Feature / Fix → sugiere `X.Y.Z`

## Cambios que rompen
### <título>
[archivo.tsx:12](src/components/ui/archivo.tsx#L12)
Qué cambió, qué código del consumidor deja de funcionar (con un ejemplo corto),
y la alternativa compatible si existe.

## Cambios silenciosos
…

## Huecos del contrato
…

## Aditivos (no rompen)
Lista corta.
```

Si no hay nada que rompa, dilo en una línea y pasa al veredicto — no infles el
reporte. Y si el diff es puramente interno (recipes que nadie exporta, tests,
stories), decláralo así: es información útil para quien va a publicar.
