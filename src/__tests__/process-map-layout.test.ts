import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import { tienda } from "../components/diagramas/ejemplos/c4-tienda";
import { cicloCoreLink, gruposCoreLink, procesoCompras } from "../components/diagramas/ejemplos/mapa-corelink";
import type { ElkNode } from "elkjs/lib/elk-api";
import { PERFILES_ELK, distribuirNivel, limpiarPoligonal, medirNodo, type MotorDistribucion } from "../components/diagramas/layout";
import { validarDistribucion } from "../diagramas";
import type { Distribucion, NodoProceso } from "../components/diagramas/types";

const motor = new ELK();

function esOrtogonal(d: Distribucion) {
  return d.aristas.every((a) =>
    a.puntos.every((p, i) => i === 0 || Math.abs(p.x - a.puntos[i - 1].x) < 0.5 || Math.abs(p.y - a.puntos[i - 1].y) < 0.5),
  );
}

/**
 * El criterio central de #205: con los datos del Mapa de CoreLink, ELK
 * distribuye el nivel y ninguna arista atraviesa una caja que no sea la suya.
 */
describe("distribuirNivel: el Mapa de CoreLink", () => {
  it("el conjunto de datos tiene el tamaño del mapa original", () => {
    expect(cicloCoreLink.hijos).toHaveLength(13);
    expect(cicloCoreLink.aristas).toHaveLength(17);
    expect(new Set(cicloCoreLink.hijos!.filter((n) => n.capa === "flujo").map((n) => n.grupo)).size).toBe(3);
  });

  for (const direccion of ["derecha", "abajo"] as const) {
    it(`hacia ${direccion}: ninguna arista cruza un nodo, ninguna etiqueta lo tapa y los nodos no se solapan`, async () => {
      const d = await distribuirNivel(cicloCoreLink, motor, { direccion, grupos: gruposCoreLink });

      expect(d.nodos).toHaveLength(13);
      expect(d.aristas).toHaveLength(17);
      expect(d.carriles.map((c) => c.id).sort()).toEqual(["egreso", "ingreso", "transformacion"]);
      expect(d.bandas.map((b) => b.capa)).toEqual(["transversal", "base"]);
      expect(validarDistribucion(d)).toEqual([]);
      expect(esOrtogonal(d)).toBe(true);

      // Cada arista empieza en el borde de su origen y acaba en el de su destino.
      for (const a of d.aristas) {
        const origen = d.nodos.find((n) => n.id === a.desde)!;
        const destino = d.nodos.find((n) => n.id === a.hasta)!;
        expect(enBorde(a.puntos[0], origen), `${a.id} sale de ${a.desde}`).toBe(true);
        expect(enBorde(a.puntos[a.puntos.length - 1], destino), `${a.id} llega a ${a.hasta}`).toBe(true);
      }

      // Todo cabe en el lienzo, y las bandas quedan antes y después del flujo.
      for (const n of d.nodos) {
        expect(n.x).toBeGreaterThanOrEqual(0);
        expect(n.y).toBeGreaterThanOrEqual(0);
        expect(n.x + n.ancho).toBeLessThanOrEqual(d.ancho);
        expect(n.y + n.alto).toBeLessThanOrEqual(d.alto);
      }
      const eje = direccion === "derecha" ? "y" : "x";
      const largo = direccion === "derecha" ? "alto" : "ancho";
      const [transversal, base] = d.bandas;
      const flujo = d.nodos.filter((n) => n.capa === "flujo");
      for (const n of flujo) {
        expect(n[eje]).toBeGreaterThanOrEqual(transversal[eje] + transversal[largo]);
        expect(n[eje] + n[largo]).toBeLessThanOrEqual(base[eje]);
      }
    });
  }

  it("un nivel 2 (Compras) también sale limpio", async () => {
    const d = await distribuirNivel(procesoCompras, motor);
    expect(d.carriles).toHaveLength(0);
    expect(validarDistribucion(d)).toEqual([]);
  });

  it("la comprobación detecta de verdad una arista que atraviesa un nodo", async () => {
    const d = await distribuirNivel(cicloCoreLink, motor, { grupos: gruposCoreLink });
    const [a, b, c] = d.nodos;
    const trampa: Distribucion = {
      ...d,
      aristas: [
        {
          id: "trampa",
          desde: a.id,
          hasta: b.id,
          estilo: "continua",
          animada: false,
          puntos: [
            { x: c.x - 10, y: c.y + c.alto / 2 },
            { x: c.x + c.ancho + 10, y: c.y + c.alto / 2 },
          ],
        },
      ],
      nodos: [...d.nodos, { ...c, id: "gemelo" }],
    };
    const problemas = validarDistribucion(trampa);
    expect(problemas).toContainEqual({ tipo: "arista-cruza-nodo", arista: "trampa", nodo: c.id });
    expect(problemas).toContainEqual({ tipo: "nodos-solapados", nodos: [c.id, "gemelo"] });
  });

  it("aguanta niveles degenerados: vacío, sin flujo, aristas a nodos que no existen", async () => {
    expect((await distribuirNivel({}, motor)).nodos).toEqual([]);
    const soloBase: NodoProceso = {
      id: "x",
      etiqueta: "x",
      hijos: [
        { id: "a", etiqueta: "A", capa: "base" },
        { id: "b", etiqueta: "B", capa: "transversal" },
      ],
      aristas: [{ desde: "a", hasta: "b" }, { desde: "a", hasta: "fantasma" }, { desde: "a", hasta: "a" }],
    };
    const d = await distribuirNivel(soloBase, motor);
    expect(d.bandas).toEqual([]);
    expect(d.aristas).toHaveLength(1);
    expect(validarDistribucion(d)).toEqual([]);
  });

  it("aristas entre bandas van por canales sin pisar nada", async () => {
    const nivel: NodoProceso = {
      id: "n",
      etiqueta: "n",
      hijos: [
        { id: "f1", etiqueta: "Uno" },
        { id: "f2", etiqueta: "Dos" },
        { id: "t1", etiqueta: "Transversal 1", capa: "transversal" },
        { id: "t2", etiqueta: "Transversal 2", capa: "transversal" },
        { id: "t3", etiqueta: "Transversal 3", capa: "transversal" },
        { id: "b1", etiqueta: "Base 1", capa: "base" },
        { id: "b2", etiqueta: "Base 2", capa: "base" },
      ],
      aristas: [
        { desde: "f1", hasta: "f2" },
        { desde: "t1", hasta: "t3", etiqueta: "salta a t3" },
        { desde: "b2", hasta: "b1", etiqueta: "vuelve" },
        { desde: "t2", hasta: "b2", etiqueta: "cruza" },
        { desde: "b1", hasta: "t1" },
        { desde: "t1", hasta: "f2" },
      ],
    };
    for (const direccion of ["derecha", "abajo"] as const) {
      const d = await distribuirNivel(nivel, motor, { direccion });
      expect(d.aristas).toHaveLength(6);
      expect(validarDistribucion(d)).toEqual([]);
      expect(esOrtogonal(d)).toBe(true);
    }
  });
});

describe("medidas y poligonales", () => {
  it("una etiqueta larga pasa a dos líneas sin superar el ancho máximo", () => {
    const corta = medirNodo({ etiqueta: "Ventas", icono: undefined });
    const larga = medirNodo({ etiqueta: "Importaciones · comercio exterior y nacionalización" });
    expect(larga.ancho).toBeLessThanOrEqual(272);
    expect(larga.alto).toBeGreaterThan(corta.alto);
  });

  it("limpiarPoligonal quita repetidos y puntos alineados", () => {
    expect(
      limpiarPoligonal([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });
});

function enBorde(p: { x: number; y: number }, c: { x: number; y: number; ancho: number; alto: number }) {
  const e = 1;
  const dentroX = p.x >= c.x - e && p.x <= c.x + c.ancho + e;
  const dentroY = p.y >= c.y - e && p.y <= c.y + c.alto + e;
  const enX = Math.abs(p.x - c.x) <= e || Math.abs(p.x - c.x - c.ancho) <= e;
  const enY = Math.abs(p.y - c.y) <= e || Math.abs(p.y - c.y - c.alto) <= e;
  return dentroX && dentroY && (enX || enY);
}

describe("distribuirNivel: los tres niveles de un C4", () => {
  it("contexto, contenedores y componentes salen limpios en las dos direcciones", async () => {
    const sistema = tienda.hijos![2];
    for (const elemento of [tienda, sistema, sistema.hijos![1]]) {
      const nivel: NodoProceso = {
        id: elemento.id,
        etiqueta: elemento.nombre,
        hijos: elemento.hijos!.map((h) => ({ id: h.id, etiqueta: h.nombre, subtitulo: h.descripcion, grupo: h.limite, insignia: h.tipo })),
        aristas: elemento.relaciones!.map((r) => ({ desde: r.desde, hasta: r.hasta, etiqueta: r.descripcion })),
      };
      for (const direccion of ["derecha", "abajo"] as const) {
        const d = await distribuirNivel(nivel, motor, { direccion });
        expect(d.nodos).toHaveLength(elemento.hijos!.length);
        expect(validarDistribucion(d)).toEqual([]);
      }
    }
  });
});

describe("perfiles de ELK", () => {
  const contando = (base: MotorDistribucion) => {
    const perfiles: (string | undefined)[] = [];
    return {
      perfiles,
      motor: {
        layout: (grafo: ElkNode) => {
          perfiles.push(grafo.children?.[0]?.layoutOptions?.["elk.layered.compaction.postCompaction.strategy"]);
          return base.layout(grafo);
        },
      } satisfies MotorDistribucion,
    };
  };

  it("el Mapa de CoreLink sale con el perfil compacto, al primer intento", async () => {
    const { perfiles, motor: m } = contando(motor);
    const d = await distribuirNivel(cicloCoreLink, m, { grupos: gruposCoreLink });
    expect(perfiles).toEqual(["EDGE_LENGTH"]);
    expect(d.ancho).toBeLessThan(2400);
  });

  it("si un perfil falla, prueba el siguiente", async () => {
    const vistos: (string | undefined)[] = [];
    const quisquilloso: MotorDistribucion = {
      layout: (grafo) => {
        const compactacion = grafo.children?.[0]?.layoutOptions?.["elk.layered.compaction.postCompaction.strategy"];
        vistos.push(compactacion);
        return compactacion === "EDGE_LENGTH" ? Promise.reject(new Error("hitboxes")) : motor.layout(grafo);
      },
    };
    const d = await distribuirNivel(cicloCoreLink, quisquilloso, { grupos: gruposCoreLink });
    expect(vistos).toEqual(PERFILES_ELK.map((p) => p["elk.layered.compaction.postCompaction.strategy"]));
    expect(validarDistribucion(d)).toEqual([]);
  });

  it("si fallan todos, propaga el primer error", async () => {
    let n = 0;
    const roto: MotorDistribucion = { layout: () => Promise.reject(new Error(`fallo ${++n}`)) };
    await expect(distribuirNivel(cicloCoreLink, roto)).rejects.toThrow("fallo 1");
  });
});
