import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AvatarPicker } from "../components/ui/avatar-picker";
import { DEFAULT_AVATAR_COLOR_LABELS, DEFAULT_AVATAR_COLORS } from "../lib/avatar-colors";
import { contrastRatio, parseHsl } from "../lib/color";

/** El nombre accesible que produce `AvatarPicker` para la muestra `index` de `total`. */
const nombreDeMuestra = (label: string | undefined, index: number, total: number) =>
  label ? `${label}, color ${index + 1} de ${total}` : `Color ${index + 1} de ${total}`;

beforeAll(() => {
  // jsdom no implementa `URL.createObjectURL`; basta con que devuelva algo
  // reconocible y que revocar no explote.
  Object.assign(URL, {
    createObjectURL: vi.fn(() => "blob:vista-previa"),
    revokeObjectURL: vi.fn(),
  });
});

const imagen = (nombre = "foto.png", tamanoKb = 100, tipo = "image/png") =>
  new File([new Uint8Array(tamanoKb * 1024)], nombre, { type: tipo });

const montar = (props: Partial<React.ComponentProps<typeof AvatarPicker>> = {}) => {
  const onChange = vi.fn();
  render(<AvatarPicker name="Andrés Montoya" onChange={onChange} {...props} />);
  return { onChange };
};

/**
 * Lo único del perfil que de verdad se repite entre aplicaciones es elegir el
 * avatar: MiDivisa tenía un selector de ocho colores escrito a mano y no
 * permitía subir foto (#99). Foto o iniciales sobre color, una sola elección.
 */
describe("AvatarPicker · iniciales y colores", () => {
  it("las iniciales salen de la misma regla que SidebarBrand y UserMenu", () => {
    montar({ name: "Distribuidora El Poblado S.A.S." });
    const nombre = nombreDeMuestra(DEFAULT_AVATAR_COLOR_LABELS[0], 0, DEFAULT_AVATAR_COLORS.length);
    expect(screen.getByRole("radio", { name: nombre })).toHaveTextContent("DE");
  });

  it.each(DEFAULT_AVATAR_COLORS)("el color por defecto %s pasa contraste AA con texto blanco", (color) => {
    // Se comprueba, no se mira: un ámbar necesita ser mucho más oscuro que un
    // azul para el mismo contraste, y a ojo se dan por buenos los que no lo son.
    expect(contrastRatio(parseHsl(color), parseHsl("0 0% 100%"))).toBeGreaterThanOrEqual(4.5);
  });

  it("ofrece los ocho colores y marca el elegido", () => {
    montar({ value: { color: DEFAULT_AVATAR_COLORS[3] } });
    const grupo = screen.getByRole("radiogroup", { name: "Color de las iniciales" });
    const nombre = nombreDeMuestra(DEFAULT_AVATAR_COLOR_LABELS[3], 3, DEFAULT_AVATAR_COLORS.length);
    expect(within(grupo).getAllByRole("radio")).toHaveLength(8);
    expect(within(grupo).getByRole("radio", { name: nombre })).toHaveAttribute("aria-checked", "true");
  });

  it("elegir un color notifica el estado completo", async () => {
    const { onChange } = montar({ value: { color: DEFAULT_AVATAR_COLORS[0] } });
    const nombre = nombreDeMuestra(DEFAULT_AVATAR_COLOR_LABELS[5], 5, DEFAULT_AVATAR_COLORS.length);
    await userEvent.click(screen.getByRole("radio", { name: nombre }));
    expect(onChange).toHaveBeenCalledWith({ file: null, color: DEFAULT_AVATAR_COLORS[5], src: undefined });
  });

  it("admite una lista de colores propia", () => {
    montar({ colors: ["200 50% 40%", "100 50% 30%"] });
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});

/**
 * #161: cada muestra es un radio cuyo nombre accesible anunciaba el HSL
 * crudo ("350 75% 45%"), inelegible con lector de pantalla. Estas pruebas
 * afirman el nombre accesible real —comprobado por mutación: revertir
 * `aria-label` en `avatar-picker.tsx` a `option` (el HSL) las hace fallar—
 * y que quien pasa `colors` propios sigue teniendo algo elegible, con o sin
 * nombres propios.
 */
describe("AvatarPicker · nombre accesible de cada muestra", () => {
  it("ninguna muestra por defecto anuncia su HSL crudo", () => {
    montar();
    DEFAULT_AVATAR_COLORS.forEach((hsl) => {
      expect(screen.queryByRole("radio", { name: hsl })).not.toBeInTheDocument();
    });
  });

  it("cada muestra por defecto lleva su nombre en español y su posición", () => {
    montar();
    DEFAULT_AVATAR_COLOR_LABELS.forEach((label, index) => {
      const nombre = nombreDeMuestra(label, index, DEFAULT_AVATAR_COLOR_LABELS.length);
      expect(screen.getByRole("radio", { name: nombre })).toBeInTheDocument();
    });
  });

  it("colores propios sin nombre siguen siendo elegibles, por posición y no por HSL", () => {
    const colores = ["200 50% 40%", "100 50% 30%"];
    montar({ colors: colores });
    expect(screen.getByRole("radio", { name: "Color 1 de 2" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Color 2 de 2" })).toBeInTheDocument();
    colores.forEach((hsl) => {
      expect(screen.queryByRole("radio", { name: hsl })).not.toBeInTheDocument();
    });
  });

  it("colores propios con `colorLabels` anuncian ese nombre, no HSL ni posición sola", () => {
    montar({
      colors: ["30 60% 40%", "260 40% 45%"],
      colorLabels: ["Canela", "Berenjena"],
    });
    expect(screen.getByRole("radio", { name: "Canela, color 1 de 2" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Berenjena, color 2 de 2" })).toBeInTheDocument();
  });

  it("un color propio que coincide con uno de fábrica hereda su nombre sin pasar `colorLabels`", () => {
    montar({ colors: [DEFAULT_AVATAR_COLORS[6], "10 50% 40%"] });
    expect(
      screen.getByRole("radio", { name: `${DEFAULT_AVATAR_COLOR_LABELS[6]}, color 1 de 2` }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Color 2 de 2" })).toBeInTheDocument();
  });
});

describe("AvatarPicker · foto", () => {
  it("subir una foto la entrega como File, con vista previa, y oculta los colores", async () => {
    const { onChange } = montar();
    const archivo = imagen();
    await userEvent.upload(screen.getByLabelText("Subir foto"), archivo);
    expect(onChange).toHaveBeenCalledWith({ file: archivo, color: DEFAULT_AVATAR_COLORS[0], src: "blob:vista-previa" });
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar foto" })).toBeInTheDocument();
  });

  it("con foto guardada muestra la foto y el botón de quitarla", () => {
    montar({ value: { src: "https://example.test/foto.png" } });
    expect(document.querySelector("img")).toHaveAttribute("src", "https://example.test/foto.png");
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("quitar la foto devuelve los colores y notifica sin archivo", async () => {
    const { onChange } = montar({ value: { src: "https://example.test/foto.png", color: DEFAULT_AVATAR_COLORS[2] } });
    await userEvent.click(screen.getByRole("button", { name: "Quitar foto" }));
    expect(onChange).toHaveBeenCalledWith({ file: null, color: DEFAULT_AVATAR_COLORS[2], src: undefined });
  });

  it("un archivo que no es imagen se rechaza con mensaje y sin notificar", async () => {
    const { onChange } = montar();
    await userEvent.upload(screen.getByLabelText("Subir foto"), imagen("cv.pdf", 10, "application/pdf"), { applyAccept: false });
    expect(screen.getByText("Solo se admiten imágenes.")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("una imagen que pasa del máximo se rechaza con el límite en el mensaje", async () => {
    const { onChange } = montar({ maxSizeMb: 1 });
    await userEvent.upload(screen.getByLabelText("Subir foto"), imagen("grande.png", 1500));
    expect(screen.getByText("La imagen no puede pasar de 1 MB.")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("dice en texto qué acepta", () => {
    montar({ maxSizeMb: 2 });
    expect(screen.getByText("Imagen, hasta 2 MB.")).toBeInTheDocument();
  });
});
