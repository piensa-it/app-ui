import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AutoComplete } from "../components/ui/autocomplete";
import { DatePicker } from "../components/ui/date-picker";
import { MultiSelect } from "../components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Select } from "../components/ui/select";

const options = [
  { label: "Colombia", value: "co" },
  { label: "México", value: "mx" },
];

function OutsideTarget() {
  return <button type="button">Siguiente control</button>;
}

describe("cierre intuitivo de paneles flotantes", () => {
  it("cierra Select al hacer clic fuera", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select aria-label="Seleccionar país" options={options} />
        <OutsideTarget />
      </>,
    );

    const trigger = screen.getByRole("combobox", { name: "Seleccionar país" });
    await user.click(trigger);
    expect(await screen.findByRole("option", { name: "Colombia" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Siguiente control" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  });

  it("cierra MultiSelect al hacer clic fuera", async () => {
    const user = userEvent.setup();
    render(
      <>
        <MultiSelect aria-label="Seleccionar mercados" options={options} />
        <OutsideTarget />
      </>,
    );

    const trigger = screen.getByRole("combobox", { name: "Seleccionar mercados" });
    await user.click(trigger);
    expect(await screen.findByRole("option", { name: "México" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Siguiente control" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  });

  it("cierra AutoComplete al pasar a otro control", async () => {
    const user = userEvent.setup();

    function Demo() {
      const [value, setValue] = useState("");
      return (
        <>
          <AutoComplete
            aria-label="Buscar ciudad"
            value={value}
            suggestions={["Bogotá", "Medellín"]}
            onChange={setValue}
            onQueryChange={() => {}}
          />
          <OutsideTarget />
        </>
      );
    }

    render(<Demo />);
    const input = screen.getByRole("combobox", { name: "Buscar ciudad" });
    await user.click(input);
    expect(await screen.findByRole("option", { name: "Bogotá" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Siguiente control" }));
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));

    await user.click(input);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));

    await user.click(input);
    await user.tab();
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
  });

  it("cierra DatePicker al pasar a otro control", async () => {
    const user = userEvent.setup();
    render(
      <>
        <DatePicker aria-label="Fecha de entrega" />
        <OutsideTarget />
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Abrir calendario" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Siguiente control" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  });

  it("cierra Popover al hacer clic fuera", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Popover>
          <PopoverTrigger><button type="button">Ver detalles</button></PopoverTrigger>
          <PopoverContent>Información contextual</PopoverContent>
        </Popover>
        <OutsideTarget />
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Ver detalles" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Siguiente control" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  });
});
