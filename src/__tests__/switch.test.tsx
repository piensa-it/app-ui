import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "../components/ui/switch";

describe("Switch", () => {
  it("invoca onCheckedChange al hacer click", async () => {
    let checked = false;
    render(<Switch checked={checked} onCheckedChange={(value) => (checked = value)} />);

    await userEvent.click(screen.getByRole("switch"));
    expect(checked).toBe(true);
  });
});

describe("Switch — input oculto utilizable por herramientas de automatización", () => {
  it("el input cubre todo el control y conserva role=switch", () => {
    render(<Switch aria-label="Notificaciones" />);
    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input.style.clip).toBe("auto");
    expect(input.style.width).toBe("100%");
    expect(input.style.height).toBe("100%");
    expect(input).toHaveClass("opacity-0", "cursor-pointer");
    expect(input.closest("label")).toHaveClass("relative");
  });

  it("aria-label da nombre al input", () => {
    render(<Switch aria-label="Notificaciones" />);
    const input = screen.getByRole("switch", { name: "Notificaciones" });
    expect(input).not.toHaveAttribute("aria-labelledby");
    expect(input.closest("label")).not.toHaveAttribute("aria-label");
  });

  it("`id` va al input para que un <label htmlFor> externo lo asocie", () => {
    render(
      <>
        <label htmlFor="notif">Notificaciones</label>
        <Switch id="notif" />
      </>,
    );
    expect(screen.getByLabelText("Notificaciones")).toHaveAttribute("id", "notif");
  });
});
