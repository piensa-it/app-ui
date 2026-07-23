import * as React from "react";
import { Slider as ArkSlider } from "@ark-ui/react/slider";

import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<ArkSlider.RootProps, "value" | "onValueChange" | "children"> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
}

/** Control deslizante sobre Ark UI (headless), con el tema Tailwind de la librería. Soporta uno o varios thumbs. */
const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <ArkSlider.Root
      ref={ref}
      className={cn("relative flex w-full flex-col gap-2 py-1", className)}
      value={value}
      onValueChange={(details) => onValueChange?.(details.value)}
      {...props}
    >
      <ArkSlider.Control className="relative flex h-control-default w-full touch-none items-center">
        <ArkSlider.Track className="h-2 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
          <ArkSlider.Range className="h-full rounded-full bg-primary" />
        </ArkSlider.Track>
        {(value ?? [0]).map((_, index) => (
          <ArkSlider.Thumb
            key={index}
            index={index}
            className={cn(
              "block size-5 rounded-full border-2 border-primary bg-background shadow-md transition-transform duration-normal hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
