import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../components/ui/checkbox";

describe("Checkbox", () => {
  it("invoca onCheckedChange al hacer click", async () => {
    let checked = false;
    render(<Checkbox checked={checked} onCheckedChange={(value) => (checked = value)} />);

    await userEvent.click(screen.getByRole("checkbox"));
    expect(checked).toBe(true);
  });

  it("refleja el estado checked", () => {
    render(<Checkbox checked readOnly />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
