import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../components/ui/tooltip";
import { Button } from "../components/ui/button";

describe("Tooltip", () => {
  it("no muestra el contenido hasta que se activa", () => {
    render(
      <Tooltip content="Ayuda contextual">
        <Button>Info</Button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("hover sobre el trigger muestra el contenido, con role=tooltip", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Tooltip content="Ayuda contextual" openDelay={0}>
        <Button>Info</Button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Info" }));

    const tooltip = await waitFor(() => screen.getByRole("tooltip"));
    expect(tooltip).toHaveTextContent("Ayuda contextual");
  });

  it("el trigger queda descrito por el tooltip mientras está abierto (aria-describedby)", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Tooltip content="Ayuda contextual" openDelay={0}>
        <Button>Info</Button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Info" });
    await user.hover(trigger);
    const tooltip = await waitFor(() => screen.getByRole("tooltip"));
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("unhover cierra el tooltip", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Tooltip content="Ayuda contextual" openDelay={0} closeDelay={0}>
        <Button>Info</Button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Info" });
    await user.hover(trigger);
    await waitFor(() => screen.getByRole("tooltip"));

    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });
});
