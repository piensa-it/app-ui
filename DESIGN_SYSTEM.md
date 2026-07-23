# Sistema de diseño de Piensa IT

Este documento define los principios de producto, diseño y calidad de
`@piensa-it/ui-library`. Es el criterio de aceptación para componentes nuevos y
para cambios sobre componentes existentes.

## Propósito

La librería ofrece una capa de presentación compartida para los productos de
Piensa IT. Debe permitir que equipos distintos construyan interfaces coherentes,
accesibles y reconocibles sin acoplarse a una marca de producto, un router o una
fuente de datos concreta.

Su audiencia principal son equipos que construyen aplicaciones operativas,
financieras y administrativas. En ellas importan especialmente la claridad, la
confianza, la lectura de datos y la eficiencia en tareas repetitivas.

## Principios

### Claridad antes que decoración

Cada elemento visual debe ayudar a entender jerarquía, estado o interacción. Las
interfaces evitan adornos sin función, ambigüedad en los textos y movimiento que
no comunique un cambio de estado.

### Precisión con calidez

Piensa IT debe sentirse tecnológico y riguroso, pero no frío. Las superficies son
sobrias, la tipografía es legible y el color de marca se reserva para acciones,
selección y puntos de énfasis reales.

### Identidad contenida

La firma visual del sistema es un acento lineal rojo Piensa IT, preciso y de uso
limitado. Puede aparecer en navegación seleccionada, estados activos, indicadores
o encabezados relevantes. No debe convertirse en una franja decorativa repetida
en todos los contenedores.

El rojo principal conserva su linaje de marca tanto en modo claro como oscuro.
El naranja puede funcionar como acento complementario, pero no reemplaza la
identidad principal ni se usa para acciones destructivas.

### Datos fáciles de comparar

Las tablas, métricas, fechas y valores financieros priorizan alineación,
densidad controlada y numerales tabulares. El sistema no sacrifica legibilidad
para mostrar más información.

### Accesibilidad incorporada

La accesibilidad no es una variante opcional. El estándar mínimo es WCAG 2.2 AA:
navegación por teclado, foco visible, nombres accesibles, contraste suficiente,
targets táctiles adecuados y soporte para preferencias de movimiento reducido.

### APIs predecibles

Componentes equivalentes usan las mismas convenciones para tamaño, variante,
estado controlado, callbacks, errores y composición. El tipado público debe
reflejar exactamente el valor recibido por el consumidor.

## Dirección visual

### Color

Los componentes consumen exclusivamente tokens semánticos. Ningún componente
debe introducir valores hexadecimales, RGB o colores Tailwind físicos para
decisiones de marca.

La paleta de referencia parte de estos roles:

- Rojo Piensa IT (`#C8102E`): identidad y acción principal.
- Rojo de peligro (`#EF4444`): error y acciones destructivas.
- Grafito (`#211E1C`): texto y contraste principal.
- Marfil cálido (`#FDFCFC`): canvas claro.
- Naranja (`#F07A35`): acento complementario del modo oscuro.
- Verde (`#16A34A`): confirmación y estados positivos.

Los valores concretos pueden evolucionar; sus roles semánticos deben permanecer
estables. Toda pareja foreground/background debe cumplir el contraste aplicable
de WCAG 2.2 AA.

### Tipografía

- `font-heading`: títulos y encabezados breves; aporta carácter con moderación.
- `font-sans`: cuerpo, controles e información operativa.
- `font-mono` o una variante con numerales tabulares: códigos, importes, fechas y
  datos que necesitan comparación vertical.

La librería define familias mediante variables CSS, pero no descarga fuentes
remotas. Cada aplicación consumidora decide cómo alojarlas y cargarlas.

### Densidad

El sistema utiliza tres alturas nominales:

| Densidad | Altura | Uso |
| --- | ---: | --- |
| Compacta | 32 px | Tablas y herramientas densas de escritorio |
| Predeterminada | 40 px | Formularios y aplicaciones generales |
| Cómoda | 44 px | Mobile y acciones principales |

Un control visualmente pequeño puede conservar un área interactiva mínima de 44
px cuando se use en superficies táctiles.

### Superficies y elevación

El sistema distingue cuatro niveles: canvas, superficie, superficie elevada y
superficie flotante. Bordes, sombras y fondos expresan esa jerarquía; no se suman
por decoración. Los overlays utilizan un token semántico y nunca un negro fijo.

### Movimiento

El movimiento explica apertura, cierre, aparición o cambio de estado. Las
transiciones de controles deben ser breves y consistentes. El sistema respeta
`prefers-reduced-motion` y elimina transformaciones no esenciales cuando está
activo.

## Voz de interfaz

- Español claro, directo y en voz activa.
- Sentence case para labels y acciones.
- Los botones nombran el resultado: “Guardar cambios”, no “Enviar”.
- La confirmación mantiene el mismo verbo de la acción que la originó.
- Los errores explican qué ocurrió y cómo corregirlo.
- Los estados vacíos ofrecen un siguiente paso cuando exista.
- Labels, ayudas y ejemplos cumplen funciones distintas y no se duplican.

## Arquitectura y alcance

- React, TypeScript y componentes headless son la base del paquete.
- Ark UI se usa para interacciones complejas cubiertas por su catálogo.
- TanStack Table y Recharts resuelven tablas y gráficas.
- Los componentes no hacen fetch ni importan auth, backend o routing.
- Los textos específicos de una aplicación se reciben por props.
- Todo export público sale de `src/index.ts`.
- Los consumidores importan únicamente desde la raíz del paquete.
- Los estilos compartidos viven en tokens y recetas; no se duplican entre
  componentes equivalentes.

## Compatibilidad antes de 1.0

Hasta publicar `1.0.0`, se permiten cambios incompatibles cuando corrigen un
contrato confuso o consolidan el sistema. Todo cambio debe:

1. Incluir una nota de migración.
2. Mantener un alias deprecated durante al menos una versión menor cuando sea
   razonable.
3. Actualizar tests, stories, documentación y tipos en el mismo PR.
4. Evitar aliases cuando conservarlos perpetúe un comportamiento incorrecto.

Después de `1.0.0`, los cambios incompatibles requieren una versión mayor.

## Presupuestos de calidad

Todo PR debe cumplir:

- Cero errores de ESLint y TypeScript.
- Tests y build exitosos.
- Un test de humo por cada componente exportado.
- Tests de interacción para componentes con estado o navegación por teclado.
- Cero violaciones críticas o serias de accesibilidad en los flujos cubiertos.
- Story con `tags: ["autodocs"]` para cada componente exportado.
- Funcionamiento verificado en tema claro y oscuro.
- Sin colores de marca hardcodeados en componentes.
- Sin una regresión injustificada del tamaño del paquete.

El presupuesto inicial de bundle se fijará con la medición obtenida después de
corregir la externalización de dependencias en la Fase 1. A partir de esa línea
base, CI no permitirá un aumento superior al 10 % sin justificación explícita.

## Definición de terminado

Un componente está terminado cuando:

- Usa tokens semánticos y las recetas compartidas aplicables.
- Expone una API tipada, coherente y documentada.
- Funciona en claro, oscuro, mobile y contenido largo.
- Soporta teclado, foco visible y nombres accesibles.
- Comunica disabled, invalid, loading y empty cuando apliquen.
- Respeta movimiento reducido.
- Tiene story, autodocs y ejemplos de estados relevantes.
- Tiene tests proporcionales a su riesgo.
- Está exportado desde `src/index.ts`.
- No incorpora lógica de negocio ni dependencias de aplicación.

## Gobierno

Una nueva variante o token requiere demostrar uso repetido en al menos dos
componentes o productos, salvo que represente una necesidad de accesibilidad. La
preferencia es componer patrones existentes antes de ampliar la API pública.

Las excepciones a este documento deben quedar explicadas en el PR que las
introduce y, si se convierten en una práctica recurrente, actualizar esta fuente
de verdad.
