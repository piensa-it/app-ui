import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppearanceSettings, type AppearanceValue } from "../components/ui/appearance-settings";
import { createPalette } from "../lib/palette";

const base: AppearanceValue = { theme: "system", palette: "indigo", font: "geist", density: "default" };

const montar = (props: Partial<React.ComponentProps<typeof AppearanceSettings>> = {}) => {
  const onChange = vi.fn();
  render(<AppearanceSettings value={base} onChange={onChange} {...props} />);
  return { onChange };
};

const grupo = (nombre: string) => screen.getByRole("radiogroup", { name: nombre });

/**
 * Los cuatro conmutadores del sistema de diseño ya existían; el panel donde
 * la persona los elige lo construía cada aplicación a mano y cada una decidía
 * por su cuenta qué ofrecer (#98). Lo que se fija: qué se ofrece, que cada
 * opción se vea como lo que es, y que el panel no persista ni toque el DOM.
 */
describe("AppearanceSettings · qué ofrece", () => {
  it("las cuatro secciones, con sus opciones", () => {
    montar();
    expect(within(grupo("Tema")).getAllByRole("radio")).toHaveLength(3);
    expect(within(grupo("Color")).getAllByRole("radio")).toHaveLength(8);
    expect(within(grupo("Tipografía")).getAllByRole("radio")).toHaveLength(4);
    expect(within(grupo("Densidad")).getAllByRole("radio")).toHaveLength(3);
  });

  it("el estilo visual se ofrece solo al pedirlo, con los cuatro estilos y su miniatura real", () => {
    montar();
    expect(screen.queryByRole("radiogroup", { name: "Estilo" })).not.toBeInTheDocument();

    montar({ sections: ["look"], value: { ...base, look: "soft" } });
    const estilos = within(grupo("Estilo")).getAllByRole("radio");
    expect(estilos).toHaveLength(4);
    expect(within(grupo("Estilo")).getByRole("radio", { name: /Suave/ })).toHaveAttribute("aria-checked", "true");
    // La miniatura lleva el estilo puesto: es el estilo real, no una copia.
    expect(within(grupo("Estilo")).getByRole("radio", { name: /Plano/ }).querySelector('[data-ui-look="flat"]')).not.toBeNull();
    // `classic` es no tener atributo, también en la miniatura.
    expect(within(grupo("Estilo")).getByRole("radio", { name: /Clásico/ }).querySelector("[data-ui-look]")).toBeNull();
  });

  it("sin `look` en el valor, el estilo marcado es el clásico", () => {
    montar({ sections: ["look"] });
    expect(within(grupo("Estilo")).getByRole("radio", { name: /Clásico/ })).toHaveAttribute("aria-checked", "true");
  });

  it("`sections` deja fuera lo que no se quiere ofrecer", () => {
    montar({ sections: ["theme", "density"] });
    expect(screen.queryByRole("radiogroup", { name: "Color" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Tipografía" })).not.toBeInTheDocument();
    expect(grupo("Tema")).toBeInTheDocument();
  });

  it("solo ofrece lo tematizable: no hay control para el gris de interacción", () => {
    montar();
    expect(screen.queryByText(/accent|acento|interacci/i)).not.toBeInTheDocument();
  });

  it("marca la opción elegida en cada sección", () => {
    montar({ value: { theme: "dark", palette: "ruby", font: "inter", density: "compact" } });
    expect(within(grupo("Tema")).getByRole("radio", { name: /Oscuro/ })).toHaveAttribute("aria-checked", "true");
    expect(within(grupo("Color")).getByRole("radio", { name: /Rubí/ })).toHaveAttribute("aria-checked", "true");
    expect(within(grupo("Tipografía")).getByRole("radio", { name: /Inter/ })).toHaveAttribute("aria-checked", "true");
    expect(within(grupo("Densidad")).getByRole("radio", { name: /Compacta/ })).toHaveAttribute("aria-checked", "true");
  });
});

describe("AppearanceSettings · cada opción se ve como lo que es", () => {
  it("la muestra de color lleva la paleta puesta, no una copia del color", () => {
    montar();
    const rubi = within(grupo("Color")).getByRole("radio", { name: /Rubí/ });
    expect(rubi.querySelector('[data-ui-palette="ruby"]')).not.toBeNull();
  });

  it("una paleta propia se pinta con los tokens que construye createPalette", () => {
    montar({ palettes: ["indigo", { id: "marca", label: "Marca", primary: "158 64% 32%" }] });
    const marca = within(grupo("Color")).getByRole("radio", { name: /Marca/ });
    const muestra = marca.querySelector("span[style]") as HTMLElement;
    expect(muestra.style.getPropertyValue("--primary")).toBe(createPalette({ primary: "158 64% 32%" })["--primary"]);
    expect(muestra.style.getPropertyValue("--accent")).toBe("");
  });

  it("la tipografía se escribe en sí misma", () => {
    montar();
    const inter = within(grupo("Tipografía")).getByRole("radio", { name: /Inter/ });
    expect(inter.querySelector('[data-ui-font="inter"]')).not.toBeNull();
  });

  it("la densidad se muestra con sus propias medidas", () => {
    montar();
    const compacta = within(grupo("Densidad")).getByRole("radio", { name: /Compacta/ });
    expect(compacta.querySelector('[data-ui-density="compact"]')).not.toBeNull();
  });
});

describe("AppearanceSettings · controlado", () => {
  it("cambiar una opción entrega el objeto completo", async () => {
    const { onChange } = montar();
    await userEvent.click(within(grupo("Color")).getByRole("radio", { name: /Esmeralda/ }));
    expect(onChange).toHaveBeenCalledWith({ ...base, palette: "emerald" });
    await userEvent.click(within(grupo("Densidad")).getByRole("radio", { name: /Cómoda/ }));
    expect(onChange).toHaveBeenLastCalledWith({ ...base, density: "comfortable" });
  });

  it("no toca la raíz del documento", async () => {
    montar();
    await userEvent.click(within(grupo("Tema")).getByRole("radio", { name: /Oscuro/ }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-ui-palette")).toBeNull();
  });

  it("los textos se pueden sustituir", () => {
    montar({ labels: { theme: "Theme", dark: "Dark" } });
    expect(within(grupo("Theme")).getByRole("radio", { name: /Dark/ })).toBeInTheDocument();
  });
});
