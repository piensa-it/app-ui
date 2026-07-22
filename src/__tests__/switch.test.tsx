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
