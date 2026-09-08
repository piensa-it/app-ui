import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { ProfileForm } from "../components/ui/profile-form";

beforeAll(() => {
  // jsdom no implementa `URL.createObjectURL`; basta con que devuelva algo
  // reconocible y que revocar no explote.
  Object.assign(URL, {
    createObjectURL: vi.fn(() => "blob:vista-previa"),
    revokeObjectURL: vi.fn(),
  });
});

const valor = { name: "Andrés Montoya", email: "andres@piensait.com", phone: "3001234567", jobTitle: "Cajera" };

const montar = (props: Partial<React.ComponentProps<typeof ProfileForm>> = {}) => {
  const onChange = vi.fn();
  render(<ProfileForm value={valor} onChange={onChange} {...props} />);
  return { onChange };
};

const imagen = (nombre = "foto.png", tipo = "image/png") => new File([new Uint8Array(100)], nombre, { type: tipo });

/**
 * Lo único del perfil que de verdad se repite entre aplicaciones (#124): el
 * avatar y los cuatro datos de la persona. Todo lo demás —documento, sede,
 * contraseña— es negocio y entra por `children`.
 */
describe("ProfileForm", () => {
  it("ofrece el avatar y los cuatro campos, rellenos", () => {
    montar();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Andrés Montoya");
    expect(screen.getByLabelText("Correo")).toHaveValue("andres@piensait.com");
    expect(screen.getByLabelText("Teléfono")).toHaveValue("3001234567");
    expect(screen.getByLabelText("Cargo")).toHaveValue("Cajera");
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeInTheDocument();
  });

  it("las iniciales del avatar salen del nombre", () => {
    const { container } = render(<ProfileForm value={valor} onChange={vi.fn()} />);
    expect(container.querySelector("[data-scope='avatar']")).toHaveTextContent("AM");
  });

  it("escribir en un campo entrega el objeto completo, no solo el campo", async () => {
    const user = userEvent.setup();
    const { onChange } = montar();
    await user.type(screen.getByLabelText("Nombre"), "!");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      name: "Andrés Montoya!",
      email: "andres@piensait.com",
      phone: "3001234567",
      jobTitle: "Cajera",
    }));
  });

  it("elegir un color del avatar también entrega el objeto completo", async () => {
    const user = userEvent.setup();
    const { onChange } = montar();
    const colores = screen.getAllByRole("radio");
    await user.click(colores[1]);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      name: "Andrés Montoya",
      avatar: expect.objectContaining({ color: expect.any(String) }),
    }));
  });

  it("`fields` decide qué campos se ofrecen", () => {
    montar({ fields: ["name", "email"] });
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument();
  });

  it("los campos propios de la aplicación van tras los estándar", () => {
    montar({
      children: (
        <Field label="Documento">
          <Input defaultValue="1020304050" />
        </Field>
      ),
    });
    const etiquetas = screen.getAllByText(/Nombre|Correo|Teléfono|Cargo|Documento/).map((n) => n.textContent);
    expect(etiquetas[etiquetas.length - 1]).toBe("Documento");
  });

  it("un error de validación se muestra en su campo", () => {
    montar({ errors: { email: "Ese correo ya está en uso." } });
    expect(screen.getByText("Ese correo ya está en uso.")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "true");
  });

  it("los textos se pueden sustituir", () => {
    montar({ labels: { name: "Full name", email: "Email" } });
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  /**
   * La fusión del avatar en `onChange` (#124): tres casos que la expresión
   * del plan original mezclaba de forma confusa — subir foto, quitarla, y
   * cambiar solo el color. Cada uno se prueba por separado.
   */
  describe("fusión del avatar en onChange", () => {
    it("subir una foto entrega su vista previa como `avatar.src` y el `File` en `avatarFile`", async () => {
      const { onChange } = montar();
      const archivo = imagen();
      await userEvent.upload(screen.getByLabelText("Subir foto"), archivo);
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
        avatar: expect.objectContaining({ src: "blob:vista-previa" }),
        avatarFile: archivo,
      }));
    });

    it("quitar la foto deja `avatar.src` sin definir y `avatarFile` en null", async () => {
      const { onChange } = montar({ value: { ...valor, avatar: { src: "https://example.test/foto.png" } } });
      await userEvent.click(screen.getByRole("button", { name: "Quitar foto" }));
      const ultimo = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(ultimo.avatar.src).toBeUndefined();
      expect(ultimo.avatarFile).toBeNull();
    });

    it("cambiar solo el color no toca `avatar.src` (no hay foto que preservar)", async () => {
      const { onChange } = montar();
      const colores = screen.getAllByRole("radio");
      await userEvent.click(colores[2]);
      const ultimo = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(ultimo.avatar.src).toBeUndefined();
      expect(ultimo.avatarFile).toBeNull();
    });
  });
});
