import type { Distribucion, GrupoProceso, NodoProceso, Punto, TonoGrupo } from "./types";

/** Trazo SVG de una poligonal ortogonal con las esquinas redondeadas. */
export function trazoRedondeado(puntos: Punto[], radio = 8): string {
  if (puntos.length === 0) return "";
  let d = `M${r(puntos[0].x)} ${r(puntos[0].y)}`;
  for (let i = 1; i < puntos.length - 1; i++) {
    const [a, p, b] = [puntos[i - 1], puntos[i], puntos[i + 1]];
    const radioReal = Math.min(radio, Math.hypot(p.x - a.x, p.y - a.y) / 2, Math.hypot(b.x - p.x, b.y - p.y) / 2);
    const ux = Math.sign(p.x - a.x);
    const uy = Math.sign(p.y - a.y);
    const vx = Math.sign(b.x - p.x);
    const vy = Math.sign(b.y - p.y);
    d += ` L${r(p.x - ux * radioReal)} ${r(p.y - uy * radioReal)} Q${r(p.x)} ${r(p.y)} ${r(p.x + vx * radioReal)} ${r(p.y + vy * radioReal)}`;
  }
  const ultimo = puntos[puntos.length - 1];
  return `${d} L${r(ultimo.x)} ${r(ultimo.y)}`;
}

const r = (n: number) => Math.round(n * 10) / 10;

const TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "border",
  "muted",
  "muted-foreground",
  "primary",
  "success",
  "warning",
  "destructive",
] as const;
export type TokenSvg = (typeof TOKENS)[number];
export type ColoresSvg = Record<TokenSvg, string>;

/**
 * Colores del tema vigente para un SVG autónomo. Sin elemento (o sin tokens
 * resueltos) deja `hsl(var(--token))`, que funciona si el SVG se incrusta en
 * una página con los tokens de la librería.
 */
export function resolverColores(elemento?: Element | null): ColoresSvg {
  const estilo = elemento && typeof getComputedStyle === "function" ? getComputedStyle(elemento) : null;
  return Object.fromEntries(
    TOKENS.map((token) => {
      const valor = estilo?.getPropertyValue(`--${token}`).trim();
      return [token, valor ? `hsl(${valor})` : `hsl(var(--${token}))`];
    }),
  ) as ColoresSvg;
}

const escapar = (texto: string) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function recortar(texto: string, anchoDisponible: number, anchoCaracter: number) {
  const max = Math.max(1, Math.floor(anchoDisponible / anchoCaracter));
  return texto.length <= max ? texto : `${texto.slice(0, max - 1)}…`;
}

const tonoDe = (tono: TonoGrupo | undefined, colores: ColoresSvg) =>
  tono === "muted" ? colores["muted-foreground"] : colores[tono ?? "primary"];

/**
 * El nivel distribuido como un SVG autónomo (sin React, sin CSS externo), con
 * los mismos carriles, bandas, aristas y etiquetas que el lienzo. Los iconos
 * no se incluyen.
 */
export function distribucionASvg(
  distribucion: Distribucion,
  nivel: Pick<NodoProceso, "etiqueta" | "hijos">,
  opciones: { grupos?: GrupoProceso[]; colores?: ColoresSvg } = {},
): string {
  const colores = opciones.colores ?? resolverColores(null);
  const nodos = new Map((nivel.hijos ?? []).map((n) => [n.id, n]));
  const grupo = (id?: string) => opciones.grupos?.find((g) => g.id === id);
  const partes: string[] = [];
  const { ancho, alto } = distribucion;

  partes.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}" font-family="system-ui, sans-serif" role="img" aria-label="${escapar(nivel.etiqueta)}">`,
    `<title>${escapar(nivel.etiqueta)}</title>`,
    `<defs><marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${colores["muted-foreground"]}"/></marker></defs>`,
    `<rect width="100%" height="100%" fill="${colores.background}"/>`,
  );

  for (const b of distribucion.bandas) {
    partes.push(
      `<rect x="${r(b.x)}" y="${r(b.y)}" width="${r(b.ancho)}" height="${r(b.alto)}" fill="${colores.muted}" fill-opacity="0.45" stroke="${colores.border}" stroke-dasharray="4 4"/>`,
      `<text x="${r(b.titulo.x + 4)}" y="${r(b.titulo.y + 16)}" font-size="12" font-weight="600" fill="${colores["muted-foreground"]}">${escapar(b.etiqueta.toUpperCase())}</text>`,
    );
  }
  for (const c of distribucion.carriles) {
    const color = tonoDe(grupo(c.id)?.tono, colores);
    partes.push(
      `<rect x="${r(c.x)}" y="${r(c.y)}" width="${r(c.ancho)}" height="${r(c.alto)}" rx="12" fill="${color}" fill-opacity="0.05" stroke="${color}" stroke-opacity="0.35"/>`,
      `<text x="${r(c.x + 16)}" y="${r(c.y + 26)}" font-size="13" font-weight="600" fill="${colores.foreground}">${escapar(c.etiqueta)}</text>`,
    );
  }
  for (const a of distribucion.aristas) {
    partes.push(
      `<path d="${trazoRedondeado(a.puntos)}" fill="none" stroke="${colores["muted-foreground"]}" stroke-width="1.5"${a.estilo === "discontinua" ? ' stroke-dasharray="6 4"' : ""} marker-end="url(#flecha)"/>`,
    );
  }
  for (const a of distribucion.aristas) {
    if (!a.etiqueta) continue;
    const e = a.etiqueta;
    partes.push(
      `<rect x="${r(e.x)}" y="${r(e.y)}" width="${r(e.ancho)}" height="${r(e.alto)}" rx="6" fill="${colores.card}" stroke="${colores.border}"/>`,
      `<text x="${r(e.x + e.ancho / 2)}" y="${r(e.y + e.alto / 2 + 4)}" font-size="11" text-anchor="middle" fill="${colores["muted-foreground"]}">${escapar(e.texto)}</text>`,
    );
  }
  for (const n of distribucion.nodos) {
    const datos = nodos.get(n.id);
    if (!datos) continue;
    const color = datos.externo ? colores["muted-foreground"] : tonoDe(grupo(n.grupo)?.tono, colores);
    const disponible = n.ancho - 32;
    const lineas: string[] = [];
    let y = n.y + 24;
    if (datos.insignia) {
      lineas.push(`<text x="${r(n.x + 16)}" y="${r(y)}" font-size="10" fill="${colores["muted-foreground"]}">${escapar(recortar(datos.insignia.toUpperCase(), disponible, 6.4))}</text>`);
      y += 16;
    }
    lineas.push(`<text x="${r(n.x + 16)}" y="${r(y)}" font-size="14" font-weight="600" fill="${colores["card-foreground"]}">${escapar(recortar(datos.etiqueta, disponible, 7.6))}</text>`);
    if (datos.subtitulo) {
      lineas.push(`<text x="${r(n.x + 16)}" y="${r(y + 18)}" font-size="12" fill="${colores["muted-foreground"]}">${escapar(recortar(datos.subtitulo, disponible, 6.4))}</text>`);
    }
    partes.push(
      `<g><rect x="${r(n.x)}" y="${r(n.y)}" width="${r(n.ancho)}" height="${r(n.alto)}" rx="10" fill="${colores.card}" stroke="${colores.border}"${datos.externo ? ' stroke-dasharray="5 4"' : ""}/>`,
      `<rect x="${r(n.x)}" y="${r(n.y + 10)}" width="3" height="${r(Math.max(0, n.alto - 20))}" rx="1.5" fill="${color}"/>`,
      ...lineas,
      "</g>",
    );
  }
  partes.push("</svg>");
  return partes.join("\n");
}

/** Descarga un SVG como archivo. */
export function descargarSvg(svg: string, nombre: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre.endsWith(".svg") ? nombre : `${nombre}.svg`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
