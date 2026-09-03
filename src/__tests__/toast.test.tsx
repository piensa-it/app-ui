import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Toaster, toast } from "../components/ui/toast";

describe("toast — duración por defecto", () => {
  it("usa 4000 ms si no se indica duración", async () => {
    render(<Toaster />);
    act(() => {
      toast.success({ summary: "Guardado" });
    });
    const status = await screen.findByRole("status", { name: "Guardado" });
    expect(status.style.getPropertyValue("--duration")).toBe("4000ms");
  });

  it("respeta la duración indicada", async () => {
    render(<Toaster />);
    act(() => {
      toast.info({ summary: "Sincronizando", duration: 9000 });
    });
    const status = await screen.findByRole("status", { name: "Sincronizando" });
    expect(status.style.getPropertyValue("--duration")).toBe("9000ms");
  });
});
