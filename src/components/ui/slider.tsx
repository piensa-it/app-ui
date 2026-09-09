import * as React from "react";
import { Slider as ArkSlider } from "@ark-ui/react/slider";

import { cn } from "@/lib/utils";
import { sliderTrackSizeVariants, sliderThumbSizeVariants } from "@/lib/recipes/slider";
import { focusRingOutside } from "@/lib/recipes/focus";

export interface SliderProps extends Omit<ArkSlider.RootProps, "value" | "onValueChange" | "onChange" | "children"> {
  value?: number[];
  onChange?: (value: number[]) => void;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
}

/** Control deslizante sobre Ark UI (headless), con el tema Tailwind de la librería. Soporta uno o varios thumbs. */
const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onChange, size = "md", ...props }, ref) => (
    <ArkSlider.Root
      ref={ref}
      className={cn("relative flex w-full flex-col gap-2 py-1", className)}
      value={value}
      onValueChange={(details) => onChange?.(details.value)}
      {...props}
    >
      <ArkSlider.Control className="relative flex h-control-default w-full touch-none items-center">
        <ArkSlider.Track className={sliderTrackSizeVariants({ size })}>
          <ArkSlider.Range className="h-full rounded-full bg-primary" />
        </ArkSlider.Track>
        {(value ?? [0]).map((_, index) => (
          <ArkSlider.Thumb
            key={index}
            index={index}
            className={cn(
              "block transition-transform duration-normal hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none",
              sliderThumbSizeVariants({ size }),
              focusRingOutside,
              "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            )}
          >
            <ArkSlider.HiddenInput />
          </ArkSlider.Thumb>
        ))}
      </ArkSlider.Control>
    </ArkSlider.Root>
  ),
);
Slider.displayName = "Slider";

export { Slider };
