import { describe, expect, it } from "vitest";
import { buildTree, collectExpandedIds, collectSearchExpandedIds, type TreeRow } from "../lib/tree";

interface Unidad {
  id: string;
  parentId?: string | null;
  nombre: string;
}

type UnidadArbol = TreeRow<Unidad>;

describe("buildTree", () => {
  it("anida una lista plana según parentId", () => {
    const rows: Unidad[] = [
      { id: "1", nombre: "Edificio A" },
      { id: "1.1", parentId: "1", nombre: "Torre 1" },
      { id: "1.1.1", parentId: "1.1", nombre: "Apto 101" },
      { id: "1.2", parentId: "1", nombre: "Torre 2" },
    ];
    const tree = buildTree(rows);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("1");
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].id).toBe("1.1");
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].id).toBe("1.1.1");
    expect(tree[0].children[1].children).toEqual([]);
  });

  it("admite varias raíces", () => {
    const rows: Unidad[] = [
      { id: "a", nombre: "A" },
      { id: "b", nombre: "B" },
      { id: "a.1", parentId: "a", nombre: "A hija" },
    ];
    const tree = buildTree(rows);
    expect(tree.map((r) => r.id)).toEqual(["a", "b"]);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[1].children).toEqual([]);
  });

  it("respeta campos personalizados", () => {
    interface Fila {
      clave: string;
      padre?: string;
    }
    const rows: Fila[] = [{ clave: "x" }, { clave: "y", padre: "x" }];
    const tree = buildTree<Fila, "hijas">(rows, { id: "clave", parentId: "padre", childrenKey: "hijas" });
    expect(tree).toHaveLength(1);
    expect(tree[0].hijas).toHaveLength(1);
    expect(tree[0].hijas[0].clave).toBe("y");
  });

  describe("huérfanas", () => {
    it("una fila cuyo parentId no existe en la lista se muestra como raíz", () => {
      const rows: Unidad[] = [
        { id: "1", parentId: "no-existe", nombre: "Huérfana" },
        { id: "2", nombre: "Raíz normal" },
      ];
      const tree = buildTree(rows);
      expect(tree.map((r) => r.id).sort()).toEqual(["1", "2"]);
    });

    it("no se pierde ninguna fila: el total de nodos del árbol coincide con el de la lista", () => {
      const rows: Unidad[] = [
        { id: "1", parentId: "fantasma", nombre: "A" },
        { id: "2", parentId: "otro-fantasma", nombre: "B" },
        { id: "3", parentId: "1", nombre: "C" },
      ];
      const tree = buildTree(rows);

      function countNodes(nodes: UnidadArbol[]): number {
        return nodes.reduce((total, node) => total + 1 + countNodes(node.children), 0);
      }
      expect(countNodes(tree)).toBe(3);
    });
  });

  describe("ciclos", () => {
    it("A padre de B y B padre de A: no cuelga, y ambas filas aparecen", () => {
      const rows: Unidad[] = [
        { id: "a", parentId: "b", nombre: "A" },
        { id: "b", parentId: "a", nombre: "B" },
      ];
      const tree = buildTree(rows);
      // Ninguna arista es válida como raíz "natural" (ambas tienen parentId
      // apuntando a otra fila del ciclo): el primero en aparecer en `rows`
      // (a) se promueve a raíz, cortando el ciclo ahí.
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe("a");
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe("b");
      // La arista de vuelta (b -> a) se descarta: "a" no reaparece bajo "b".
      expect(tree[0].children[0].children).toEqual([]);
    });

    it("un ciclo de tres no produce recursión infinita ni filas duplicadas", () => {
      const rows: Unidad[] = [
        { id: "a", parentId: "c", nombre: "A" },
        { id: "b", parentId: "a", nombre: "B" },
        { id: "c", parentId: "b", nombre: "C" },
      ];
      expect(() => buildTree(rows)).not.toThrow();
      const tree = buildTree(rows);
      function countNodes(nodes: UnidadArbol[]): number {
        return nodes.reduce((total, node) => total + 1 + countNodes(node.children), 0);
      }
      expect(countNodes(tree)).toBe(3);
    });

    it("una fila que es su propio padre se trata como raíz, no como ciclo de un nodo", () => {
      const rows: Unidad[] = [{ id: "a", parentId: "a", nombre: "A" }];
      const tree = buildTree(rows);
      expect(tree).toHaveLength(1);
      expect(tree[0].children).toEqual([]);
    });
  });

  describe("ids repetidos", () => {
    it("la primera aparición gana; la segunda se descarta por completo", () => {
      const rows: Unidad[] = [
        { id: "1", nombre: "Primera" },
        { id: "1", nombre: "Segunda (duplicada)" },
      ];
      const tree = buildTree(rows);
      expect(tree).toHaveLength(1);
      expect(tree[0].nombre).toBe("Primera");
    });

    it("una fila duplicada no aparece tampoco como hija", () => {
      const rows: Unidad[] = [
        { id: "1", nombre: "Raíz" },
        { id: "1.1", parentId: "1", nombre: "Hija original" },
        { id: "1.1", parentId: "1", nombre: "Hija duplicada" },
      ];
      const tree = buildTree(rows);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].nombre).toBe("Hija original");
    });
  });
});

describe("collectExpandedIds", () => {
  const getSubRows = (row: UnidadArbol) => row.children;
  const tree = buildTree<Unidad>([
    { id: "1", nombre: "Raíz" },
    { id: "1.1", parentId: "1", nombre: "Hija" },
    { id: "1.1.1", parentId: "1.1", nombre: "Nieta" },
  ]);

  it("depth 0 no expande nada", () => {
    expect(collectExpandedIds(tree, 0, getSubRows)).toEqual({});
  });

  it("depth 1 expande solo la raíz", () => {
    // Sin `getRowId`, los ids son los mismos índices que usa TanStack por
    // defecto ("0", "0.0"…), no el campo `id` de los datos.
    expect(collectExpandedIds(tree, 1, getSubRows)).toEqual({ "0": true });
  });

  it("depth 2 expande raíz e hija", () => {
    expect(collectExpandedIds(tree, 2, getSubRows)).toEqual({ "0": true, "0.0": true });
  });

  it("con getRowId, usa los ids reales de la fila", () => {
    const getRowId = (row: UnidadArbol) => row.id;
    expect(collectExpandedIds(tree, 1, getSubRows, getRowId)).toEqual({ "1": true });
    expect(collectExpandedIds(tree, 2, getSubRows, getRowId)).toEqual({ "1": true, "1.1": true });
  });
});

describe("collectSearchExpandedIds", () => {
  const getSubRows = (row: UnidadArbol) => row.children;
  const tree = buildTree<Unidad>([
    { id: "1", nombre: "Edificio A" },
    { id: "1.1", parentId: "1", nombre: "Torre 1" },
    { id: "1.1.1", parentId: "1.1", nombre: "Apto 101" },
    { id: "2", nombre: "Edificio B" },
  ]);

  it("expande solo la rama que contiene la coincidencia", () => {
    const getRowId = (row: UnidadArbol) => row.id;
    const ids = collectSearchExpandedIds(tree, "101", ["nombre"], getSubRows, getRowId);
    expect(ids).toEqual({ "1": true, "1.1": true });
  });

  it("sin coincidencias no expande nada", () => {
    expect(collectSearchExpandedIds(tree, "no existe", ["nombre"], getSubRows)).toEqual({});
  });

  it("consulta vacía no expande nada", () => {
    expect(collectSearchExpandedIds(tree, "", ["nombre"], getSubRows)).toEqual({});
  });
});
