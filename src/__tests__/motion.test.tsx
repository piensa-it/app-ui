import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Motion } from "@/components/ui/motion";

describe("Motion", () => {
  it("aplica el preset y sus valores predeterminados", () => {
    render(<Motion preset="float">Contenido</Motion>);

    const motion = screen.getByText("Contenido");
    expect(motion).toHaveAttribute("data-ui-motion", "float");
    expect(motion).toHaveStyle({
      "--ui-motion-duration": "3200ms",
      "--ui-motion-iterations": "infinite",
    });
  });

  it("expone pausa, duración y repetición controladas", () => {
    render(
      <Motion preset="warn" duration={900} repeat={2} paused>
        Advertencia
      </Motion>,
    );

    const motion = screen.getByText("Advertencia");
    expect(motion).toHaveAttribute("data-paused", "true");
    expect(motion).toHaveStyle({
      "--ui-motion-duration": "900ms",
      "--ui-motion-iterations": "3",
    });
  });
});
