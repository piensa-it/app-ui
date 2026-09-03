import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabPanel } from "../components/ui/tabs";

function renderTabs(props: React.ComponentProps<typeof Tabs> = {}) {
  return render(
    <Tabs {...props}>
      <TabPanel value="a" header="Pestaña A">
        Contenido A
      </TabPanel>
      <TabPanel value="b" header="Pestaña B">
        Contenido B
      </TabPanel>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("abre la primera pestaña cuando no se indica valor inicial", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Pestaña A" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Contenido A")).toBeVisible();
  });

  it("respeta defaultValue al montar en modo no controlado", () => {
    renderTabs({ defaultValue: "b" });
    expect(screen.getByRole("tab", { name: "Pestaña B" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Contenido B")).toBeVisible();
    expect(screen.getByText("Contenido A")).not.toBeVisible();
  });

  it("el valor controlado tiene prioridad sobre defaultValue", () => {
    renderTabs({ value: "a", defaultValue: "b" });
    expect(screen.getByRole("tab", { name: "Pestaña A" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Contenido A")).toBeVisible();
  });
});

describe("Tabs — valor inicial explícito undefined", () => {
  it("cae en la primera pestaña cuando defaultValue llega como undefined", () => {
    // Caso típico: `defaultValue={pestañaInicial}` con la variable aún sin resolver.
    renderTabs({ defaultValue: undefined });
    expect(screen.getByRole("tab", { name: "Pestaña A" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Contenido A")).toBeVisible();
  });
});

describe("Tabs — clases de la lista y de cada pestaña", () => {
  it("listClassName va al tablist y className de TabPanel al tab", () => {
    render(
      <Tabs listClassName="justify-center">
        <TabPanel value="a" header="Pestaña A" className="uppercase">
          Contenido A
        </TabPanel>
        <TabPanel value="b" header="Pestaña B" contentClassName="pt-0">
          Contenido B
        </TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveClass("justify-center");
    expect(screen.getByRole("tab", { name: "Pestaña A" })).toHaveClass("uppercase");
    expect(screen.getByText("Contenido B")).toHaveClass("pt-0");
  });
});
