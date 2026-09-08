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
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("Andrés Montoya");
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
    await user.type(screen.getByLabelText(/^Nombre/), "!");
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
    expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument();
  });

  it("los campos propios de la aplicación van tras los estándar", () => {
    const { container } = render(
      <ProfileForm value={valor} onChange={vi.fn()}>
        <Field label="Documento">
          <Input defaultValue="1020304050" />
        </Field>
      </ProfileForm>,
    );
    const etiquetas = Array.from(container.querySelectorAll("label")).map((n) => n.textContent);
    expect(etiquetas).toEqual(["Nombre*", "Correo", "Teléfono", "Cargo", "Documento"]);
  });

  it("un error de validación se muestra en su campo", () => {
    montar({ errors: { email: "Ese correo ya está en uso." } });
    expect(screen.getByText("Ese correo ya está en uso.")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "true");
  });

  it("los textos se pueden sustituir", () => {
    montar({ labels: { name: "Full name", email: "Email" } });
    expect(screen.getByLabelText(/^Full name/)).toBeInTheDocument();
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

    it("cambiar solo el color no toca `avatar.src` ni marca `avatarFile` como quitado", async () => {
      const { onChange } = montar();
      const colores = screen.getAllByRole("radio");
      await userEvent.click(colores[2]);
      const ultimo = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(ultimo.avatar.src).toBeUndefined();
      // `avatarFile` es el evento «se subió o se quitó una foto»; elegir un
      // color no es ninguna de las dos, así que la clave no debe aparecer
      // (y mucho menos como `null`, que en el resto del contrato significa
      // «se quitó la foto»: una app que borre la foto guardada cuando
      // `avatarFile === null` haría un borrado espurio).
      expect(ultimo.avatarFile).toBeUndefined();
      expect("avatarFile" in ultimo).toBe(false);
    });

    it("editar un campo tras subir una foto no vuelve a mandar el mismo archivo", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { rerender } = render(<ProfileForm value={valor} onChange={onChange} />);
      const archivo = imagen();
      await userEvent.upload(screen.getByLabelText("Subir foto"), archivo);
      const conFoto = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(conFoto.avatarFile).toBe(archivo);

      // Patrón documentado en el `@example`: la app reenvía el objeto tal
      // cual recibido, `avatarFile` incluido, como parte de `value`.
      onChange.mockClear();
      rerender(<ProfileForm value={conFoto} onChange={onChange} />);
      await user.type(screen.getByLabelText(/^Nombre/), "!");
      const trasTeclear = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(trasTeclear.avatarFile).toBeUndefined();
      expect("avatarFile" in trasTeclear).toBe(false);
    });
  });

  describe("accesibilidad de los campos", () => {
    it("cada campo lleva `name` y `autoComplete` para el autorrelleno", () => {
      montar();
      expect(screen.getByLabelText(/^Nombre/)).toHaveAttribute("autocomplete", "name");
      expect(screen.getByLabelText("Correo")).toHaveAttribute("autocomplete", "email");
      expect(screen.getByLabelText("Teléfono")).toHaveAttribute("autocomplete", "tel");
      expect(screen.getByLabelText("Cargo")).toHaveAttribute("autocomplete", "organization-title");
      expect(screen.getByLabelText(/^Nombre/)).toHaveAttribute("name", "name");
    });
  });

  it("`avatarLabels` traduce los textos del AvatarPicker interno", () => {
    montar({ avatarLabels: { upload: "Upload photo" } });
    expect(screen.getByRole("button", { name: "Upload photo" })).toBeInTheDocument();
  });

  it("un campo repetido en `fields` no se duplica", () => {
    montar({ fields: ["name", "name", "email"] });
    expect(screen.getAllByLabelText(/^Nombre/)).toHaveLength(1);
  });
});
