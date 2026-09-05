# Changelog

Todos los cambios relevantes de `@piensa-it/ui-library` se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
el versionado, [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Docs

- **El tema «Sistema» de Storybook no cambiaba nada en la página de docs.** La aplicación de ejemplo se renderiza allí en iframes propios (`inline: false`) que no reciben los `globals` del toolbar, así que caían al valor inicial, que era `light`: con el sistema operativo en oscuro seguían saliendo en claro. Y eso a medias no bastaba: con el valor inicial en `system`, el toggle en «Claro» tampoco les llegaba y con el sistema en oscuro seguían oscuros. Ahora el iframe anidado hereda los `globals` del documento de docs que lo contiene y escucha sus cambios por el canal, así que tema, paleta y tipografía siguen al toolbar en vivo. Verificado con Playwright emulando `prefers-color-scheme` en los dos sentidos y cambiando el tema por el canal.

### Chore

- **Agentes de Copilot para este repositorio.** `.github/workflows/copilot-setup-steps.yml` prepara el mismo entorno que `quality-gate` (Node 22, dependencias, Chromium) para que el agente corra las mismas puertas que un PR humano; `.github/copilot-instructions.md` dice lo que `AGENTS.md` no dice porque es específico de trabajar en la nube; y tres perfiles en `.github/agents/` reproducen el circuito de las últimas historias: `validar-hu` (reproduce, mide y comprueba el remedio antes de implementar; no edita), `implementar-hu` (de punta a punta, con story, prueba, export y CHANGELOG) y `revisar-pr` (corre las puertas y revisa contra las reglas; no edita). La política de ramas admite las `copilot/…` que abre el agente, que no elige su nombre.

## [0.7.1] - 2026-09-04

Solo iconos: nada que migrar al subir desde 0.7.0.

### Added

- **41 iconos más en el catálogo** (adopción en Lynx). Activos y portafolio (`BuildingIcon`, `BoxesIcon`, `LayersIcon`, `SavingsIcon`, `CoinsIcon`, `DollarSignIcon`, `ScaleIcon`, `RulerIcon`), obra y acuerdos (`HammerIcon`, `HandshakeIcon`, `SignatureIcon`), estado (`ShieldIcon`, `ShieldAlertIcon`, `CircleIcon`, `CircleDashedIcon`, `CircleSlashIcon`, `SquareIcon`, `RejectedFileIcon`, `SpinnerIcon`), sostenibilidad y flujos (`LeafIcon`, `DropletsIcon`, `FlameIcon`, `WorkflowIcon`), más `ArrowUpRightIcon`/`ArrowDownRightIcon`, `ChevronsUpDownIcon`, `CalendarDaysIcon`, `ClipboardListIcon`, `PaletteIcon`, `UnlinkIcon`, la familia de gráficas (`AreaChartIcon`, `ColumnChartIcon`, `LineChartIcon`, `CandlestickChartIcon`) y `PercentBadgeIcon`, `CalendarClockIcon`, `ConstructionIcon`, `FileSearchIcon`, `KanbanIcon`, `HeadsetIcon`, `TagIcon`. Es lo que `docs/ICONS.md` pide hacer cuando una aplicación necesita un icono que no está: agregarlo aquí, no reinstalar lucide.

## [0.7.0] - 2026-09-05

Las cinco historias salen de la adopción real de la librería en CoreLink: lo que allá hubo que duplicar o escribir a mano, y que por eso le tocaba a la librería.

### Added

- **`AppSwitcher`: detalles por opción y confirmación en dos pasos** (#78). Para cuando elegir no es cambiar de pestaña: cambiar de empresa cambia los datos que se ven, los permisos con los que se entra y quién emite lo que se factura. Cada opción puede traer `badge` y `details` —el NIT, el rol— en filas legibles y no apretados en una línea; y con `confirm`, elegir lleva a un segundo paso que dice qué va a cambiar y repite esos detalles, porque si hubiera que recordarlos del paso anterior la confirmación no confirmaría nada. El segundo paso es un panel **dentro de la misma ventana**, no una capa encima: apilar modales es lo que más caro ha salido en estos repositorios. Desde ahí se vuelve a la lista sin elegir. La activa no dispara confirmación, y con una sola opción no se abre nada: eso lo decide el disparador (`SidebarBrand onSelect={… > 1 ? abrir : undefined}`, #75).

- **`AppSwitcher`: una ventana para elegir entre pocas cosas importantes** (#77). Buscador arriba, recientes primero y el resto en cuadrícula con icono y descripción. Un desplegable no sirve para quince opciones: en CoreLink medía 921 px en una ventana de 800, sobresalía 239 y su contenedor recortaba sin dejar desplazarse; y antes que eso, no tenía sitio para decir de qué va cada opción. Las diez decisiones del issue vienen de fábrica, cada una costó una iteración allá: buscador propio que no se parece a la paleta de comandos (con `hint` al pie para recordar dónde está la otra); teclado en patrón de combobox, con el foco fijo en el buscador y `aria-activedescendant`; roles `listbox` y `option`; una opción puede salir dos veces, en recientes y en su grupo; iconos todos en `primary`, sin color por grupo; la activa se marca con borde y visto, no con color, y no es elegible; el buscador filtra por nombre y por descripción sin distinguir tildes; los recientes excluyen la activa; buscando no hay recientes ni grupos, solo resultados; y la ventana no crece con el contenido: la lista se desplaza dentro, que es el fallo original y el que se prueba en el navegador a 700 px de alto.

- **`Stat` dice qué clase de noticia es la cifra** (#74). `tone` con cuatro niveles: `default` (informativa, en el color de marca), `positive` (salió bien), `warning` (hay que mirarlo esta semana) y `negative` (hay que hacer algo ya). No es lo mismo que `trend`, que habla de la variación: una cartera puede estar plana y aun así vencida. Por esto CoreLink tenía su propio `KpiCard`, 54 usos en 15 pantallas. Dos decisiones que vienen de fábrica porque allá costaron una iteración: `default` va en `primary` y no en gris —seis cifras en gris no dicen «normal», dicen «apagado»—, y lo que separa `warning` de `negative` es el plazo, no la gravedad. Solo `negative` tiñe la cifra. Y algo que `KpiCard` no tenía: el tono se anuncia en texto para lector de pantalla, que es lo que separa `default` de `positive` cuando la marca es verde.

- **`SidebarBrand` puede abrir algo que no sea su propio menú** (#75). Con `onSelect`, el disparador conserva su aspecto —marca, nombre, distintivo— y llama a la aplicación en vez de desplegar sus `groups`. Hacía falta porque elegir no siempre es cambiar de pestaña: cambiar de empresa cambia los datos, los permisos y quién emite lo que se factura, y esa decisión pide una ventana con sitio para el NIT, el rol y una confirmación. Sin esto, CoreLink tuvo que dejar de usar el componente y duplicar el bloque de marca, y esa copia se desvía del original en cuanto la librería lo retoca. El botón es ahora una sola pieza abra lo que abra, así que las dos formas no pueden divergir. Con `onSelect` en `undefined` —una sola empresa— no pinta ningún control, igual que sin `groups`.

- **Qué tokens puede mover un tema, documentado y con mecanismo** (#76). Los tokens de color no son todos de la misma clase, y los dos que se leen igual son los que más caro salen: `--primary` es identidad y `--accent` es el gris de interacción —el fondo de los `hover` de botones fantasma y opciones de menú—. Una aplicación del grupo escribió su selector de color moviendo `--accent`, y con el tema en verde todos los hover salían en verde saturado con el texto gris de dentro ilegible; la misma paleta no movía `--ring`, así que el anillo de foco se quedaba en el azul de fábrica.

  Ahora hay una tabla —en el README y en la página de tokens de Storybook— que dice de qué clase es cada token: identidad (siete, los únicos que un tema mueve), significado universal, estado de interacción, estructura y menú lateral.

  Y el mecanismo: `createPalette({ primary })` construye los siete a partir del color de marca, derivando el resto para que una paleta propia quede en la misma familia visual que las seis incluidas. **Los tokens que no se tocan no están en su firma**, así que no se pueden mover por error. `paletteDeclarations` los escribe como CSS, para cuando la marca se elige en tiempo de ejecución y hay tema oscuro: un `style` en línea no puede reaccionar a `.dark`.

  Conviene decirlo: el fallo no estaba en la librería. `data-ui-palette` ya movía los siete tokens correctos y no tocaba `--accent`; lo que faltaba era decirlo en alguna parte y dar salida a una marca que no fuese ninguna de las seis.

### Changed

- **La línea de versión del menú muestra solo la versión de la aplicación.** Pintaba tres datos —la de la aplicación, la de la librería y la fecha de compilación— y dejaba además el detalle completo en el `title`, con la idea de copiarlo al reportar algo. No servía: un `title` no se puede seleccionar ni copiar sin transcribirlo a mano. El detalle pasa a la prop `details`, pensada para una pantalla de ayuda, donde el texto se lee y se selecciona de verdad. Con el menú plegado `details` se ignora, o la línea volvería a partirse en cuatro renglones como antes de la 0.5.0.

  Efecto lateral bienvenido: subir de versión deja de mover tres capturas comparadas, porque el pie ya no imprime la versión de la librería.

## [0.6.0] - 2026-09-05

Las dos correcciones salen de la migración real de CoreLink a la 0.5.0, donde
la adopción de Tailwind 4 destapó dos choques que en v3 no se veían.

### Fixed

- **El tema oscuro de la aplicación perdía contra el nuestro** (#70). El bloque `.dark` de la librería vivía fuera de toda capa, mientras que `:root` vivía dentro de `@layer base`. En la cascada, lo que no está en ninguna capa gana **siempre** a lo que sí lo está, así que una aplicación que definiera su identidad oscura en `@layer base { .dark { … } }` —que es lo que enseña el README— la veía perder. CoreLink salió entera en el gris de fábrica en vez de su azul marino: el 80% de los píxeles distintos, con el fondo en `rgb(18, 18, 18)` en lugar de `rgb(2, 8, 23)`. El tema claro, que sí estaba en capa, salió bien.

  Estaba fuera a propósito, pero por un motivo que caducó: Tailwind 3 descartaba en silencio las reglas de clase propias dentro de `@layer base` en cuanto se activaba la variante `dark:`, y había un aviso en el archivo para no moverlo sin volver a comprobarlo. Comprobado contra el CSS compilado de v4: la regla sobrevive y cae en `base`. Se mueven también los otros bloques de tokens —densidad, tipografía y variantes del menú lateral—, que tenían exactamente el mismo defecto.

- **La escala de espaciado le quitaba a Tailwind los nombres de `max-w-*`** (#71). Las claves del espaciado se llamaban `xs`, `sm`, `md`, `lg`, `xl` y `2xl`, igual que la escala de contenedores. En Tailwind 3 no molestaba, porque `max-w-*` se resolvía primero contra los anchos y solo caía al espaciado si no encontraba la clave. **Tailwind 4 lo hace al revés y el espaciado gana siempre**, así que `max-w-2xl` pasó a valer 3 rem en vez de 42 rem. En CoreLink todos los diálogos quedaron en una tira de 48 px y se cayeron 35 pruebas de extremo a extremo con «element is outside of the viewport», sin ningún error de compilación que señalara la causa. Se llevaba por delante también `w-*`, `min-w-*` y `basis-*` con esos mismos nombres.

  Medido antes de decidir: no lo arregla ningún override. Ni `theme.maxWidth` en el config que se carga con `@config`, ni `@theme { --container-* }`, ni `@utility max-w-2xl`, ni un plugin con `addUtilities` —Tailwind fusiona las dos declaraciones en la misma regla y deja la del espaciado la última—. Tampoco lo arregla publicar el preset en formato `@theme` de v4, que era la otra vía propuesta: el choque se reproduce igual en `@theme` nativo. La única salida es no llamarlos igual.

### Changed

- **BREAKING: los pasos del espaciado llevan prefijo `ui-`.** `p-md` pasa a `p-ui-md`, `gap-sm` a `gap-ui-sm`, `-mt-lg` a `-mt-ui-lg`. **Los nombres por rol no cambian**: `p-inset`, `p-inset-compact`, `space-y-stack` y `gap-field` no chocaban con ninguna escala. El paquete incluye el codemod:

  ```bash
  node node_modules/@piensa-it/ui-library/scripts/codemod-espaciado.mjs "src/**/*.{ts,tsx,css}"
  ```

  Toca solo los prefijos que leen el espaciado y deja `max-w-*`, `w-*` y `min-w-*` en paz a propósito: son justo los que vuelven a funcionar. Con `--dry` enseña qué cambiaría sin escribir.

- **BREAKING: desaparecen las utilidades `panel-xs` … `panel-2xl`.** Se introdujeron en la 0.5.0 solo para sortear este choque de nombres, y con `max-w-*` funcionando otra vez no aportan nada. Los siete usos internos vuelven a `max-w-*`.

### Docs

- La página de tokens muestra los pasos con su nombre real (`ui-md`) y explica de dónde sale el prefijo. Varias stories y la página de introducción se veían estrechas sin que nadie lo notara: usaban `max-w-*` y estaban cobrando valores del espaciado.
- El README documenta las dos cosas: que las dos mitades del tema viven en `@layer base` y que una aplicación puede ganarles desde la suya, y por qué el espaciado va prefijado.

### Tests

- Prueba que compila `globals.css` conservando las capas y comprueba que los seis bloques de tokens —claro, oscuro, menú, variante de menú, densidad y tipografía— caen todos en `base`. Verificada contra el CSS construido, que es donde el fallo era visible.
- Prueba que compila el preset y comprueba que `max-w-{xs…2xl}`, `w-lg`, `min-w-lg` y `basis-lg` leen la escala de contenedores y no la de espaciado. Verificada al revés: devolviendo la clave `md` sin prefijo, la prueba falla.

## [0.5.0] - 2026-09-04

### Fixed

- **`w-control-*` no se generaba: los botones de icono salían a media anchura** (#48). `tailwind-preset.js` declaraba `height`, `minWidth` y `minHeight` con la escala de controles, pero no `width`, así que la clase no existía y el botón tomaba la anchura de su contenido. Afectaba a `Button size="icon"`, a los dos botones de `Pagination` y al de configurar columnas de `DataTable`. Verificado en el navegador: los botones de paginación pasan a medir 40×40 exactos. La prueba nueva compila el preset y comprueba que las tres claves de la escala se generan, porque este fallo es invisible en revisión: la clase se escribe y simplemente no existe.
- **Con el menú plegado, la marca de la organización no quedaba centrada.** Su fila no llevaba `justify-center` ni soltaba el relleno lateral, así que quedaba 14 px a la izquierda del eje de los iconos de abajo. Se notaba en cuanto había dos filas.
- **Con el menú plegado, la línea de versión se salía del componente.** Intentaba pintar tres datos —versión de la aplicación, de la librería y fecha— en los 48 px útiles que deja un menú de 72, y se partía en cuatro renglones. Ahora muestra solo la versión de la aplicación, centrada; el detalle completo sigue en el `title` para copiarlo en un reporte. Fuera del menú no cambia nada.
- **El menú lateral no separaba sus secciones** (#49). Los enlaces de una sección y el salto de una sección a la siguiente estaban a la misma distancia, así que con seis secciones y cuarenta enlaces el menú se leía como una lista larga en vez de como secciones. Ahora entre secciones hay cuatro veces la separación que hay entre dos enlaces de la misma, y con el menú plegado la separación es mínima porque la raya ya agrupa. La regla vive en la hoja del componente y se aplica igual estén los grupos dentro de `SidebarNav` o sueltos en el `sidebar` del `AppShell`.

### Changed

- **Tailwind 4** (#58). La librería se construye ahora con Tailwind 4.3.3, y `peerDependencies` pasa a `^3.4.17 || ^4.0.0`.

  **`tailwind-preset.js` no cambia y las aplicaciones lo siguen extendiendo igual.** El spike previo confirmó que v4 carga un preset JS con `@config`, así que se tomó esa vía en lugar de reescribirlo como CSS: es la que no obliga a coordinar tres repositorios a la vez.

  Lo que sí hubo que tocar dentro de la librería:
  - `@tailwind base/components/utilities` pasa a `@import "tailwindcss"` más `@config`, y PostCSS pasa a `@tailwindcss/postcss`. `autoprefixer` se retira: v4 lo trae incorporado.
  - Los 43 `outline-none` pasan a `outline-hidden`, que es el equivalente exacto del comportamiento de v3. El nuevo `outline-none` de v4 quita el contorno de verdad, y con él la pista que queda en el modo de alto contraste de Windows.
  - `theme.container` desaparece de la configuración en v4 y se declara como `@utility`, con los mismos valores.
  - `button { cursor: pointer }` salió del reset de v4 y se devuelve en la capa base, o todos los botones pasarían a mostrar el cursor de texto.
  - Las cuatro `shadow` sueltas de `Badge` pasan a `shadow-sm`, que es el token del sistema.
- **Choque de nombres entre la escala de espaciado y los anchos máximos.** En v4, `max-w-lg` se resuelve contra la escala de espaciado cuando esta declara ese nombre, y la nuestra usa `sm`, `md`, `lg`… El resultado era que `max-w-lg` valía 1,5 rem en vez de 32 rem: **los diálogos se encogían a 50 px de ancho**. Los siete usos internos pasan a utilidades propias (`panel-sm`, `panel-md`, `panel-lg`…), que no admiten ambigüedad. **Una aplicación que use `max-w-lg` con nuestro preset tiene el mismo problema**: ver la guía de migración.
- **React 19** (#56). La librería se desarrolla ahora contra React 19.2.8, y `peerDependencies` pasa a `^18.3.1 || ^19.0.0`: **las aplicaciones pueden quedarse en 18 o subir cuando quieran**. Salió más barato de lo previsto: ninguna API eliminada estaba en uso y el compilador solo señaló un punto, el genérico de `ReactElement`, que en 19 pasa de `any` a `unknown`. Los 66 `forwardRef` siguen funcionando; convertirlos es opcional y va aparte, porque cambiaría el tipo público de casi toda la librería.
- **El soporte de las dos versiones se comprueba, no se declara.** `npm run verify:react18` instala React 18 sin tocar `package.json`, corre tipos y pruebas, y restaura el árbol. Verificado: 345 pruebas y cero errores de tipos con 18 y con 19.
- `@types/react` y `@types/react-dom` pasan a ser peers opcionales, como hace `@testing-library/react`: el `.d.ts` publicado resuelve contra los del consumidor.
- Ola de mantenimiento (#55): Ark UI 5.39.1, framer-motion 13.2.0, lucide-react 1.41.0, `@internationalized/date` 3.12.4, Storybook 10.6.0 con sus addons, y los plugins de lint. Todo dentro de los rangos ya declarados, así que no cambia el contrato con ningún consumidor. Batería completa en verde, incluidas las 14 capturas comparadas sin diferencias.

### Docs

- **La aplicación de ejemplo y la página del armazón dejan de repetirse.** Las dos montaban un `AppShell` con menú, marca y versión, y había que actualizar ambas ante cualquier cambio del menú. Ahora cada una hace lo suyo: la aplicación de ejemplo muestra **cómo se componen** las piezas (aplicación completa, vista de tabla, vista de formulario) y la página de `AppShell` documenta **el componente y sus estados** (plegado, las tres variantes, secciones plegables, integración con React Router, menú largo). Las dos se enlazan entre sí, para que quien busque un estado no crea que falta.
- **Cada plataforma compara las capturas contra su propia referencia.** Primero se bajó la tolerancia de 0,01 a 0,001, dando por hecho que la cota era el problema; medirlo demostró que no. Con el comparador de Playwright, los dos fallos del menú plegado movieron **518 px**, y 0,001 sobre 1.280×900 son 1.150: tampoco los habría marcado. En cambio la misma tira de botones renderizada en macOS y en el Linux de CI difiere en **963 px**, todos en el contorno de las letras. Comparando entre plataformas el ruido casi duplica la señal y ninguna cota los separa —de ahí que el gate empezara a fallar en CI pasando en local—. Las referencias se guardan ahora por plataforma; sin ruido de rasterizado basta un margen de 120 px, que sí detecta los 518. Las de Linux las genera el propio runner (`snapshots.yml`, o el artefacto que sube el gate al fallar).
- Al apretar la cota salieron dos referencias desactualizadas: `armazon-router` y `armazon-secciones` no recogían la separación entre secciones de la HU 49 —16 px— y cabían holgadamente bajo el umbral anterior.
- Story del armazón con seis secciones y cuarenta enlaces, que es donde el problema se ve. Las que había caben en la ventana y por eso no lo enseñaban. Añadida además a las capturas comparadas.

## [0.4.2] - 2026-09-03

Tres cosas que se ven en el sitio de documentación y que, siendo la referencia
de la que parte cualquier aplicación, tienen que estar bien.

### Fixed

- **La columna del menú se cortaba a media altura.** El `<aside>` llevaba la altura de la ventana, así que dentro de un contenedor más alto —la propia página de documentación, sin ir más lejos— la franja oscura terminaba a mitad y debajo asomaba el fondo de la página. Ahora la columna se estira con el contenido y lo que se queda a la vista al desplazar es su contenido. Se ve en cualquier pantalla con una tabla larga, no solo en la documentación.
- **La entrada de página no era uniforme.** `PageContainer` anima al montar, y dos rutas que comparten componente de página no lo remontan: React lo reutiliza. En la aplicación de ejemplo, tres de las cinco vistas comparten componente, así que unas entraban animadas y otras no. Nueva prop `animateKey`: cuando cambia, la entrada se repite. Pásale la ruta actual.

### Changed

- **La documentación de espaciado explicaba otra cosa.** Mostraba el relleno horizontal de los controles (`px-2.5`, `px-3.5`, `px-4`) con tres cajas que a simple vista se ven iguales, y seguía diciendo que el espaciado no era una variable CSS, algo que dejó de ser cierto en la 0.3.0. Ahora muestra la escala real con barras que miden el valor del token, los cuatro nombres por rol y una comparación entre el relleno normal y el compacto.
- **Las historias del armazón se muestran en su propio marco** dentro de la página de documentación. Un armazón a pantalla completa pintado en línea dejaba una página interminable donde el menú se perdía de vista.

## [0.4.1] - 2026-09-03

Correcciones encontradas al integrar el armazón en MiDivisa. Nada obligatorio
al subir: si parcheaste alguna de estas cosas en tu aplicación, ya puedes
quitar el parche.

### Fixed

- **`cn` se comía la escala tipográfica de la propia librería.** `tailwind-merge` venía con la configuración de fábrica, que no conoce ni la escala `ui-*` ni la de espaciado. Pasaban dos cosas, las dos malas: un tamaño seguido de un color —el orden natural al escribir `cn`— perdía el tamaño, y el menú lateral se veía un tercio más grande de lo diseñado; y dos espaciados del mismo grupo (`gap-sm` con `gap-md`) sobrevivían los dos, así que `className` no podía anular el espaciado de un componente. Ahora se declaran las cuatro escalas propias: tipografía, espaciado, alturas de control y duraciones. **`cn` es público, así que toda aplicación que lo use arrastraba el mismo fallo.** La auditoría encontró 44 literales afectados en siete componentes, más de los tres reportados: también `PivotTable`, `Stat` y `PageHeader`.
- **`asChild` de `SidebarNavItem` no delegaba el elemento.** Los hijos se pasaban a `Slot` dentro de un fragmento, y Radix busca el marcador entre sus hijos directos: el `NavLink` del consumidor salía sin clases, sin espaciado y sin estado activo, con el icono fuera del enlace. Era la vía documentada para integrar el router de cada aplicación, así que el ejemplo del JSDoc no funcionaba. Ahora hay una prueba con React Router de verdad.
- **`AppVersion` mostraba el día anterior.** `new Date("2026-09-03")` es medianoche UTC, y al formatear en una zona al oeste retrocedía un día. Es el formato que produce `toISOString().slice(0, 10)`, que es justo lo que recomienda el JSDoc para inyectar la fecha en el build. Una fecha de calendario se construye ahora en horario local. Verificado en cuatro husos.
- **El menú lateral se iba con el desplazamiento.** El `<aside>` iba en el flujo y crecía con el documento: en una pantalla con tabla larga se subía y el pie con la versión quedaba fuera de vista. Ahora es `sticky top-0 h-screen`, con el desplazamiento interno que ya tenía la navegación.

### Changed

- **`Column` distingue identidad de origen del dato.** La 0.4.0 exigía `field: keyof TValue & string`, y toda tabla real tiene columnas que no corresponden a ningún campo: acciones de fila, un estado derivado de dos campos, un contacto que junta correo y teléfono. Una columna de presentación se declara ahora con `id` y `body`, y `field` solo hace falta para ordenar o buscar por ella. La comprobación de campos mal escritos se mantiene para las columnas que sí son campos.
- **El distintivo de entorno deja de ir en versales y en negrita**, que competían con el nombre de la organización. `uppercase: true` lo devuelve a como estaba.

### Added

- **`SidebarNavGroup` plegable**: `collapsible`, `defaultOpen` y `groupId`. Las secciones cerradas se recuerdan junto a la preferencia de plegado del menú. Con el menú en iconos no hay encabezado ni control, y los enlaces se muestran siempre.

### Docs

- Historia de `AppShell` con React Router, incluido cómo se marca el destino actual: lo decide la aplicación con `active`, porque la librería no conoce el router.
- Cuatro capturas comparadas del armazón. Los dos fallos de bulto de esta versión no los detecta ninguna prueba de tipos, pero una captura sí.
- La guía de migración de cada versión recoge ahora los cambios que se descubren al integrar: las fuentes que salieron de `styles.css` en la 0.3.0 y el endurecimiento de `Column` en la 0.4.0.

## [0.4.0] - 2026-09-03

Cierra los huecos que detectó la aplicación de ejemplo de 0.3.0. Todo es
aditivo: subir desde 0.3.0 no requiere cambios.

### Added

- **`DataTable`, columnas numéricas**: `align="left" | "center" | "right"` en `Column`. `right` trae las cifras de ancho fijo incluidas, sin las cuales los dígitos bailan entre filas y las magnitudes dejan de compararse de un vistazo. `className` sigue mandando sobre la alineación.
- **`DataTable`, fila de totales**: `footer` en `Column`, que recibe **todas** las filas que quedan tras filtrar, no las de la página visible. Basta con que una columna lo declare para que aparezca el pie. Una columna oculta no aparece en él.
- **`Stat` y `StatGroup`**: la cifra con su rótulo que encabeza casi cualquier pantalla de consulta. Usa `<dl>`/`<dt>`/`<dd>` y no un encabezado, porque un `<h3>` cuyo texto es una cantidad ensucia el esquema de la página. La variación anuncia su sentido además de pintarlo, y `goodWhenUp={false}` cubre las métricas donde subir es malo.
- **`FormGrid`** y **`Field span="full"`**: rejilla de formulario con el espaciado del sistema, sin reinventar `grid gap-… sm:grid-cols-2` ni escribir clases de rejilla en un campo.
- **`Toolbar` y `ToolbarSeparator`**: fila de controles con el espaciado del sistema; el separador empuja a la derecha lo que venga después.
- **`Select` con `width="auto"`**: para una barra de herramientas, donde el control comparte fila. Por defecto sigue ocupando el ancho disponible, que es lo que quiere un formulario.

### Changed

- **`Column.field` se tipa contra la fila** (`keyof TValue & string`). Anotando el tipo (`<Column<Movimiento> field="valor" />`), un campo mal escrito pasa a ser un error de compilación en vez de una columna vacía en silencio. Sin anotar, el comportamiento no cambia.

### Fixed

- **`Pagination`**: un `pageSize` que no estuviera entre `pageSizeOptions` dejaba el selector mostrando el marcador de posición, como si no hubiera ningún tamaño elegido. Ahora el tamaño actual se inserta en su sitio y la lista sigue ordenada.

### Docs

- `DESIGN.md`: secciones «Datos y cifras» y «Composición».
- La aplicación de ejemplo usa las piezas nuevas, y su fila de totales excluye los anulados igual que las cifras del encabezado: un pie que no cuadra con su encabezado hace que la pantalla deje de ser creíble.

## [0.3.0] - 2026-09-03

Dos frentes en la misma versión: los ajustes que pidió la adopción de
`app-corelink`, y el lineamiento visual y las piezas de armazón que faltaban
para que MiDivisa, Corelink y TuDivisa no puedan verse distintas sin quererlo.

Hay cambios de comportamiento visual. La guía de qué tocar al subir está en
`UI_LIBRARY_RELEASES` y se muestra en la página «Versiones» de la documentación.

### Added — fundamentos

- **Escala de superficies de tres niveles**: `ground` (la página), `surface` (paneles y barras) y `raised` (tarjetas, diálogos, menús), cada uno con su borde y su sombra (`shadow-surface`, `shadow-raised`), en tema claro y oscuro. Antes `--background` y `--card` eran los dos blanco puro en claro: una tarjeta sobre la página no se distinguía y cada aplicación se inventaba su gris. `Card`, `Dialog`, `AlertDialog`, `Popover`, `Menu`, `Select`, `Sheet` y `Toast` toman `raised`; el `body`, `ground`.
- **Escala de espaciado publicada**: siete pasos (`--space-2xs` … `--space-2xl`) más cuatro nombres por rol —`p-inset`, `p-inset-compact`, `space-y-stack`, `gap-field`— disponibles como utilidades de Tailwind. Aplicada en `Card`, `Dialog`, `Field` y `PageHeader`. El ritmo vertical entre bloques de una página es de 24 px y lo pone `PageContainer`.
- **Densidad configurable en `UiProvider`**: `density="compact" | "default" | "comfortable"`. Baja sola a todos los controles porque todos usan los mismos tokens de altura y relleno, así que deja de decidirse componente por componente. Se puede acotar a una sección anidando otro proveedor.
- **Utilidades de contraste exportadas** (`contrastRatio`, `relativeLuminance`, `parseHsl`), para que una aplicación que redefina tokens compruebe sus propios pares.

### Added — armazón

- **`AppShell`**: menú lateral, barra superior y contenido. Trae el plegado con la preferencia recordada por dispositivo (`storageKey`), la animación de ancho, el panel móvil y el carácter cromático del menú. El menú es oscuro en tema claro y en oscuro: es un plano distinto de la interfaz, con sus propios tokens `--sidebar-*` y tres variantes (`graphite`, `ink`, `smoke`) que se eligen con `variant`.
- **`SidebarBrand`**: logo o iniciales, nombre de la organización, distintivo de entorno y un único menú con lo que se puede cambiar ahí. La fila entera es **un solo control**: dos controles compartiendo esos dos centímetros se activan sin querer, y un interruptor no dice qué pasa al activarlo. El entorno es una opción más, con marca de selección y una frase que explica su efecto. Acepta grupos arbitrarios, no solo empresas.
- **`PageContainer`** y **`PageHeader`**: ancho de lectura, relleno y ritmo vertical, con la entrada escalonada activada por defecto. Viene del contenedor a propósito: si cada pantalla decidiera si se anima, solo unas pocas lo harían. `Stagger` respeta `prefers-reduced-motion` sin configuración.
- **`AppVersion`**: versión de la aplicación, versión de la librería y fecha de compilación, con el detalle completo en el `title` para pegarlo en un reporte. Lo primero al recibir uno es saber contra qué compilado se estaba mirando, y eso son dos versiones.

### Changed

- **`--background` deja de ser blanco** y pasa a ser el nivel `ground`; `--card` y `--popover` pasan a ser `raised`. Ambos siguen existiendo como alias, así que `bg-background` y `bg-card` no rompen, pero `bg-background` ahora significa "el fondo de la página".
- **`--muted`, `--secondary`, `--border` e `--input` bajaron de luminosidad** para seguir leyéndose sobre el fondo nuevo. Una prueba comprueba que se distinguen de `ground` en ambos temas.
- **`--accent`, `--surface`, `--surface-hover` y `--surface-border`** se recolocaron dentro de la escala.
- `Dialog` unifica su relleno (`p-inset`) en vez de `p-5` con `sm:p-6`.
- `Stagger` acepta `ref`.

### Fixed

- **`Sheet` ya deja cambiar su superficie**: nueva prop `surface={false}` que quita fondo, borde, sombra y anillo, y hace que el botón de cerrar herede el color del panel en vez de fijar `text-muted-foreground`. Antes, un panel lateral oscuro había que taparlo con un `div` interno y colorear el cierre desde fuera.

### Docs

- **`DESIGN.md`**: las reglas de superficies, espaciado, densidad, formularios y armazón, con su porqué. La regla se decide una vez, aquí, y no en cada aplicación.
- **`docs/ICONS.md`**: el catálogo de 167 iconos de la librería es el set oficial, con la tabla de equivalencias completa para que las aplicaciones retiren su dependencia directa de `lucide-react` y dejen de tener dos copias en `node_modules`.
- **`Field` documentado como el camino por defecto** para poner un control en un formulario, con stories de descripción, error, orientación horizontal y un formulario completo.
- **Guía de migración por versión**: cada entrada de `UI_LIBRARY_RELEASES` dice ahora qué hay que cambiar al subir, no solo qué cambió, y se muestra en la página «Versiones».
- **Aplicación de ejemplo** en Storybook, con `AppShell`, una tabla y un formulario: la referencia contra la que discutir.
- **Prueba visual de la escala de superficies** en tema claro y oscuro, porque un cambio de token afecta a tres aplicaciones a la vez.
- README: coste medido del paquete, cascada de dos hojas de Tailwind y capas de terceros dentro de un diálogo.

### Ajustes de la adopción en `app-corelink`

Ajustes surgidos de la adopción completa de la librería en `app-corelink`
(217 pruebas de extremo a extremo). Cada punto eliminaba un rodeo del
consumidor: un parche sobre `node_modules`, reglas CSS correctivas o adapters.

### Fixed

- **Select** — El `<select>` nativo oculto solo se renderiza cuando llega `name`. Se pintaba siempre, así que cada opción existía dos veces en el DOM y cualquier consulta por texto encontraba antes la copia invisible. Sin `name` ese elemento no aporta nada: solo sirve para enviar el valor dentro de un `<form>`.
- **Checkbox y Switch** — El input nativo ahora cubre todo el control (`inset-0`, `opacity-0`, `clip: auto`) en vez de ser el punto de 1 px recortado que pinta Ark. Una herramienta de automatización que intenta pulsarlo ya no lo desplaza al centro ni entra en el bucle «element is not stable». Para una persona no cambia nada: pulsar en cualquier punto de la etiqueta ya conmutaba.
- **Checkbox y Switch** — `aria-label` se reenvía al input, no al `<label>` raíz, y no se emite `aria-labelledby` cuando no hay prop `label` (Ark lo apuntaba a un Label que no se renderiza). `getByRole("checkbox", { name })` y `getByRole("switch", { name })` resuelven con `aria-label`.
- **Checkbox y Switch** — `id` se traduce a `ids.hiddenInput`, así un `<label htmlFor>` externo asocia con el input. Antes iba al machine de Zag y el input salía como `checkbox:<id>:input`.
- **Dialog y Sheet** — No se cierran por la cascada de Zag ni por el foco. Al retirarse una capa, Zag cierra las que quedan encima (`layer:request-dismiss`), y trata como «fuera» el foco que otra capa devuelve al cerrarse: un panel abierto justo cuando su diálogo de origen terminaba de cerrarse desaparecía solo. `onRequestDismiss` y `onFocusOutside` hacen `preventDefault` por defecto, después de llamar al handler del consumidor. Escape y el clic en el backdrop siguen cerrando.
- **Sheet** — `className`, `style` y `data-*` van al panel (`role="dialog"`). Todo lo que no era `className` acababa en el Root de Ark, así que un `style={{ "--ancho": … }}` o un `data-mobile` se perdían. Las props del Root de Ark (`open`, `position`, `modal`, `on*`, `ids`…) siguen yendo al Root.
- **Tabs** — `listClassName` se aplica a la lista y `className`/`contentClassName` de cada `TabPanel` a su pestaña y a su panel. Antes se ignoraban.

### Added

- **Chart** — `axisFormatter` y `tooltipFormatter` separan el formato del eje del del tooltip: con moneda completa el eje de 60 px recortaba las cifras. `valueFormatter` sigue siendo el respaldo de ambos. `yAxisWidth` ensancha el eje cuando de verdad hace falta la cifra entera.
- **Chart** — `colorKey?: string` toma el color de cada fila para pintar barras y porciones por categoría, en vez del color de la serie o la paleta por índice.
- **Chart** — `allowDecimals?: boolean` se pasa al eje Y; con conteos pequeños evita marcas como 0,5.
- **Select** — `SelectOption.label` admite un `ReactNode` (icono + texto). El texto plano que usan el `<select>` nativo, la búsqueda por teclado y el trigger sale de `textValue`, opcional cuando `label` ya es texto.
- **Toast** — Duración por defecto de 4000 ms para todos los tipos, alineada con sonner y documentada en `ToastOptions`. Zag traía 2 s para `success` y 5 s para el resto; los toasts largos se acumulan y colisionan con consultas por nombre no exactas.
- **Empaquetado** — El paquete se publica con un módulo por archivo fuente (`preserveModules`) en vez de un único bundle, así el bundler del consumidor poda a nivel de módulo. Un consumidor que solo importa `Button` se lleva 2,8 KB de librería en vez de los ~140 KB del paquete entero. La importación pública sigue siendo desde la raíz. Cierra #38.
- **Empaquetado** — Las tres fuentes variables salen de `style.css` (que baja de 211 KB a 58 KB) y se publican aparte como `@piensa-it/ui-library/fonts.css` más los `.woff2` referenciados. Un consumidor con su propia tipografía deja de pagarlas.
- **Empaquetado** — `verify:package` construye dos consumidores mínimos contra `dist/` y comprueba que importar `Button` no arrastra `@zag-js/date-picker`, `recharts` ni `@tanstack/react-table`, con `DatePicker` como control de que la prueba mide algo.
- **tailwind-preset** — Exporta también `content` con las rutas de los módulos publicados. Tailwind 3 no hereda `content` de un preset, así que hay que extenderlo (`content: [...uiLibraryContent, "./src/**/*.{ts,tsx}"]`), pero ya no hay que escribir la ruta a `node_modules` a mano.

### Changed

- **Dialog y Sheet** — Cambio de comportamiento: la cascada y el foco fuera ya no cierran la capa. Un consumidor que dependiera de ese cierre automático debe cerrarla desde su propio estado.
- **Toast** — Cambio de comportamiento: `success` pasa de 2 s a 4 s y el resto de 5 s a 4 s.
- **DataTable** — `paginator="auto"` sigue siendo el valor por defecto desde 0.2.1.

### Docs

- README: sección «Overlays and third-party layers» con el veto de cascada y foco, y por qué `persistentElements` no sirve para capas que aún no existen (Zag las espera un segundo y rechaza la promesa, con error en consola en cada apertura). El camino para poppers de terceros dentro de un diálogo es vetar en `onInteractOutside` cuando el objetivo está dentro de la capa.
- README: la cascada de dos hojas de Tailwind explicada en «Theming», y el coste medido antes y después en «Installation».
- Stories nuevas: Select (dentro de formulario, opciones con icono), Checkbox y Switch (label externo, solo `aria-label`), Dialog (abre un Sheet y se cierra), Sheet (ancho por variable CSS y `data-*`), Toast (duración), Tabs (clases de lista y pestañas) y Chart (formateadores separados, eje ancho, color por categoría, donut por categoría, sin decimales).


## [0.2.1] - 2026-09-03

### Fixed

- **DataTable** — `paginator={false}` lanzaba `TypeError: Cannot read properties of undefined (reading 'pageSize')` en `table.getPageCount`: se omitía el estado de paginación y el row model, pero el pie llamaba a `getPageCount()` igual. Ahora se registra siempre el row model con una sola página que abarca todas las filas, y el pie no se renderiza. Cubierto con pruebas de render y de ausencia de pie.
- **DataTable** — Los encabezados ordenables perdían las mayúsculas: el `<th>` lleva `uppercase`, pero el `<button>` de ordenar heredaba el reset de Preflight (`button { text-transform: none }`). El botón ahora aplica `uppercase`; la prueba compila el CSS real de Tailwind y compara el `text-transform` computado de ambos encabezados.
- **DataTable** — `className` de `Column` solo se aplicaba a las `<td>`; ahora también al `<th>`, de modo que `className="text-right"` alinea cifra y título. Nueva prop opcional `headerClassName` para cuando el encabezado necesita clases distintas.

### Added

- **Chart** — Prop `yAxis?: { domain?: [min, max]; tickCount?: number }` que se pasa al `YAxis` de Recharts (`number | "auto" | "dataMin" | "dataMax"` o expresiones como `"dataMax + 100"`). Las gráficas `type="line"` usan `["auto", "auto"]` por defecto, así una serie de precios (p. ej. la TRM entre $2.700 y $3.600) ocupa toda la altura en vez de quedar aplastada sobre un eje desde 0. El resto de tipos conserva `[0, "auto"]`. Tipos nuevos exportados: `ChartYAxis`, `ChartAxisDomainValue`.
- **DataTable** — `paginator="auto"`, ahora el valor por defecto: el pie de paginación solo aparece cuando hay más filas que `rows`. Tablas de 3 a 10 filas dejan de mostrar "Filas por página 50 · 1-3 de 3". `paginator={true}` fuerza el pie como antes y `paginator={false}` lo omite. Para conservar el comportamiento anterior en todas las tablas, pasa `paginator` explícitamente.
- **Tabs** — `defaultValue` documentado y tipado como prop propia: elige la pestaña inicial en modo no controlado sin llevar el estado desde el consumidor. Si llega `undefined` explícito, se abre la primera pestaña en vez de quedar sin pestaña activa. Cubierto con pruebas de RTL del panel activo al montar.

### Docs

- Stories nuevas: `DataTable` (columna numérica alineada a la derecha, sin paginador, paginador forzado), `Chart` (serie de precios con eje automático, dominio del eje Y controlado) y `Tabs` (pestaña inicial con `defaultValue`).

## [0.2.0] - 2026-09-01

- Migración a TanStack Table v9 y Vite 8; primitivas de motion (stagger, reveal, animated-number, presets de skeleton).

[0.7.0]: https://github.com/piensa-it/app-ui/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/piensa-it/app-ui/compare/v0.5.0...v0.6.0
[0.3.0]: https://github.com/piensa-it/app-ui/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/piensa-it/app-ui/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/piensa-it/app-ui/releases/tag/v0.2.0
