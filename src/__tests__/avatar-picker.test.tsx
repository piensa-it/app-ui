import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AvatarPicker } from "../components/ui/avatar-picker";
import { DEFAULT_AVATAR_COLORS } from "../lib/avatar-colors";
import { contrastRatio, parseHsl } from "../lib/color";

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
    expect(screen.getByRole("radio", { name: DEFAULT_AVATAR_COLORS[0] })).toHaveTextContent("DE");
  });

  it.each(DEFAULT_AVATAR_COLORS)("el color por defecto %s pasa contraste AA con texto blanco", (color) => {
    // Se comprueba, no se mira: un ámbar necesita ser mucho más oscuro que un
    // azul para el mismo contraste, y a ojo se dan por buenos los que no lo son.
    expect(contrastRatio(parseHsl(color), parseHsl("0 0% 100%"))).toBeGreaterThanOrEqual(4.5);
  });

  it("ofrece los ocho colores y marca el elegido", () => {
    montar({ value: { color: DEFAULT_AVATAR_COLORS[3] } });
    const grupo = screen.getByRole("radiogroup", { name: "Color de las iniciales" });
    expect(within(grupo).getAllByRole("radio")).toHaveLength(8);
    expect(within(grupo).getByRole("radio", { name: DEFAULT_AVATAR_COLORS[3] })).toHaveAttribute("aria-checked", "true");
  });

  it("elegir un color notifica el estado completo", async () => {
    const { onChange } = montar({ value: { color: DEFAULT_AVATAR_COLORS[0] } });
    await userEvent.click(screen.getByRole("radio", { name: DEFAULT_AVATAR_COLORS[5] }));
    expect(onChange).toHaveBeenCalledWith({ file: null, color: DEFAULT_AVATAR_COLORS[5], src: undefined });
  });

  it("admite una lista de colores propia", () => {
    montar({ colors: ["200 50% 40%", "100 50% 30%"] });
    expect(screen.getAllByRole("radio")).toHaveLength(2);
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
