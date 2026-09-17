# Despliegue y publicación

`app-ui` sigue el modelo de despliegue común de Piensa IT (skill `piensa-rollout:ro`, configuración en [.piensa/rollout.json](.piensa/rollout.json)): **las pruebas corren en local, una vez, y Actions solo coteja la firma**.

## Por qué

Antes, cada PR y cada push a `main` corrían en Actions lint, tipos, cobertura, contrato, paquete, Storybook y la suite de navegador: unos 6 minutos por corrida. A eso se sumaban las corridas semanales de Dependabot, que fallaban y llegaban por correo. La cuota gratuita son 2.000 minutos al mes para toda la organización.

## Cómo se trabaja

1. Cambia el código en una rama, como siempre.
2. Antes de empujar, corre **`npm run pruebas`**. Dentro de la imagen oficial de Playwright (el mismo Linux que usaba CI) corre:
   - `npm audit`, lint, tipos y pruebas con cobertura;
   - `verify:contract`, `verify:package` y `verify:react18`;
   - la suite de navegador completa, que también construye Storybook.

   Si todo pasa, escribe `.pruebas-evidencia.json` con el hash de lo probado. Necesita Docker; en Mac, Colima, que el script levanta solo si está parado.
3. Commitea la constancia junto con el cambio: `git add .pruebas-evidencia.json`.
4. Empuja. En el PR, `constancia` coteja la firma en segundos. Si el código cambió después de firmar, falla y pide repetir `npm run pruebas`.

Qué invalida la firma: cualquier cambio en `src/`, `tests/`, `.storybook/`, `public/`, `scripts/`, las configuraciones o las dependencias. Qué no la invalida: documentación en Markdown, `docs/`, `.github/` y `.piensa/`.

## Qué corre en Actions

| Evento | Qué corre | Minutos |
|---|---|---|
| PR | `pull-request-policy` y `constancia` | segundos |
| Push a `main` (merge) | `constancia` y `deploy-docs` (Storybook a ui.piensait.com) | ~3 |
| Commit con `[skip ci]` | nada | 0 |
| Release publicado | `publish.yml`: cotejo, build, verificación del paquete y `npm publish` | ~2 |
| A mano: `gh workflow run ci.yml -f regresion_completa=true` | la calidad y la suite de navegador completas | ~6 |

## Dependabot

- Revisa las dependencias **una vez al mes** y **no toca Playwright**. Playwright se sube a mano, junto con la etiqueta de la imagen en `ci.yml` y las capturas de Linux regeneradas.
- Sus PR no corren pruebas en Actions. Para fusionar uno: `gh pr checkout <n>`, `npm run pruebas`, commitear la constancia y empujar.

## Publicar una versión

1. PR con el bump de `version` en `package.json` y `src/version.ts` (con sus notas de migración) y el `CHANGELOG`, más la constancia firmada.
2. Merge con squash a `main`.
3. `gh release create v<version> --target main --title "…" --notes-file <notas>`.
4. Comprobar que la versión quedó en GitHub Packages y que ui.piensait.com se actualizó.
