---
name: consistencia-visual
description: Audita la consistencia visual de los controles de @piensa-it/ui-library — nombres de variantes, escala de tamaños, alturas, estados (hover/active/disabled/focus/invalid), modo oscuro, tokens de color y reutilización de recipes — comparando contra la matriz canónica del repo. Produce un reporte con hallazgos priorizados y archivo:línea; no modifica código. Úsala cuando se pregunte si un componente "se ve raro", "no combina", "está desalineado" o "se ve distinto al resto", cuando se revise un componente recién agregado o portado, antes de publicar una versión, o cuando alguien quiera ordenar las variantes, tamaños o formas de los controles.
---

# Auditoría de consistencia visual

Los tests de este repo verifican comportamiento y accesibilidad estructural, pero
nadie verifica que un control nuevo **se parezca** al resto. La regla de contraste
de `axe` está deshabilitada a propósito en jsdom (no calcula estilos finales con
fidelidad), así que la coherencia visual depende hoy de que alguien la mire. Eso
es lo que hace esta auditoría.

El objetivo no es uniformidad por gusto: cuando un Button y un Input se ponen
lado a lado en un formulario de una app consumidora y tienen 2px de diferencia de
altura, el bug se ve en producción, en otro repo, y nadie sabe de dónde salió.

**Esta skill solo reporta.** No edites código: entrega el diagnóstico y deja que
la persona decida qué aplicar.

## Alcance

Si se nombra un componente, audita ese. Si no, audita la carpeta completa de
[src/components/ui/](../../../src/components/ui/) y prioriza lo que más se
desvía. Cuando el alcance sea amplio, di al principio del reporte cuántos
componentes revisaste.

## La matriz canónica

Sale de [src/lib/recipes/button.ts](../../../src/lib/recipes/button.ts) y
[field-control.ts](../../../src/lib/recipes/field-control.ts) — son la referencia,
no una sugerencia. Antes de auditar, léelos: si cambiaron, la referencia cambió.

**Variantes semánticas**: `solid`, `subtle`, `surface`, `outline`, `plain`,
más `destructive` y `link` donde apliquen. Los campos de formulario usan el
subconjunto `surface | outline | subtle`. Los alias `default`, `secondary` y
`ghost` existen marcados `@deprecated` por compatibilidad con shadcn — un
componente nuevo no debería nacer con ellos.

**Tamaños**: `sm`, `md`, `lg`, con `xs` opcional. Default siempre `md`.

**Alturas**: los tokens `h-control-compact | h-control-default |
h-control-comfortable` (o sus variantes `min-h-` / `size-` / `min-w-`). Un `h-10`
literal rompe la alineación en cuanto una app cambie la densidad.

**Anillo de foco**: `focusRingOutside` para botones y triggers,
`focusRingInside` para campos de texto. La distinción es deliberada; mezclarlas
se nota.

**Transición**: `interactiveTransition`, que ya incluye el escape de
`motion-reduce`.

## Qué revisar

Trabaja componente por componente. Para cada uno, lee su archivo y su recipe si
la tiene, y contrasta:

1. **Nombres de variantes** — ¿usa el vocabulario canónico, o inventó
   `primary`/`danger`/`light`? ¿Nace con alias deprecados?
2. **Escala de tamaños** — ¿`sm`/`md`/`lg`? ¿Hay `defaultVariants`? Sin él, el
   consumidor que omite la prop recibe un componente sin estilo.
3. **Alturas y espaciado** — ¿tokens `control-*` o números sueltos? ¿El padding
   crece de forma coherente con el tamaño, comparado con Button e Input?
4. **Los cinco estados** — `hover`, `active`, `disabled`, `focus-visible`, y
   `aria-invalid` en campos. Faltar `active` es el olvido más común y hace que el
   control se sienta muerto al clic.
5. **Modo oscuro** — ¿los colores salen de tokens que ya se adaptan, o hay
   `dark:` parchado a mano? Un `dark:` explícito no está prohibido, pero suele
   indicar que se usó un color que no era el token correcto.
6. **Colores hardcodeados** — cualquier hex, `rgb()`, `bg-[#...]`, o color fijo de
   la paleta de Tailwind (`bg-gray-100`, `text-red-500`) es un hallazgo: rompe el
   theming por marca.
7. **Reutilización** — ¿repite a mano clases que ya existen como recipe? Un panel
   flotante que no usa `floatingPanelStyles`, o una opción de lista que no usa
   `optionStyles`, va a divergir con el tiempo.
8. **Animación** — si anima, ¿tiene `motion-reduce:`?
9. **Área táctil** — controles interactivos por debajo de ~44px de lado en su
   tamaño por defecto son difíciles de tocar en móvil.
10. **Cobertura de la story** — la documentación pública es parte del producto
    visual. ¿La story muestra todas las variantes y tamaños que la recipe define?
    Una variante sin story es una variante que nadie va a usar.

## Comandos útiles

```bash
# Colores hardcodeados en toda la librería
grep -rnE "#[0-9a-fA-F]{3,8}\b|rgb\(|bg-\[#|text-\[#" src/components/

# Colores fijos de la paleta Tailwind (deberían ser tokens)
grep -rnE "(bg|text|border)-(gray|slate|zinc|red|green|blue|yellow)-[0-9]" src/components/

# Alturas literales donde debería haber tokens control-*
grep -rnE "\bh-(8|9|10|11|12)\b" src/components/ui/

# Quién usa cada recipe compartida (y quién debería)
grep -rn "focusRing\|interactiveTransition\|floatingPanelStyles\|optionStyles" src/components/ui/ | head -40
```

Trata los resultados como pistas, no como veredictos — verifica cada uno leyendo
el archivo antes de reportarlo. Un `h-9` dentro del tamaño `sm` de una recipe es
intencional; el mismo `h-9` suelto en un componente sin variantes probablemente
no.

## Formato del reporte

```markdown
# Consistencia visual — <componente o "librería completa">

**Alcance**: N componentes revisados
**Estado**: <una línea honesta: sólido / desviaciones menores / hay que ordenar esto>

## Hallazgos

### 🔴 Alto — <título corto>
[archivo.tsx:42](src/components/ui/archivo.tsx#L42)
Qué encontraste, contra qué referencia se desvía, y qué se ve mal como
consecuencia. Termina con el cambio concreto sugerido.

### 🟡 Medio — <título corto>
…

### 🟢 Bajo — <título corto>
…

## Lo que está bien
Dos o tres líneas. Sirve para saber qué no tocar.
```

Prioriza por **impacto visible para quien usa la librería**, no por cantidad de
líneas: una altura fuera de escala en Input afecta todos los formularios de todas
las apps; un `active:` faltante en un componente marginal, no. Si no encuentras
nada relevante, dilo — un reporte honesto y corto vale más que diez hallazgos
inflados.
