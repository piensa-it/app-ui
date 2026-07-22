import * as React from "react";
import { Slider as PrimeSlider, type SliderProps as PrimeSliderProps } from "primereact/slider";

import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<PrimeSliderProps, "onChange"> {
  onValueChange?: (value: number | [number, number]) => void;
}

/** Control deslizante sobre PrimeReact Slider, con el tema Tailwind de la librería. */
const Slider = React.forwardRef<PrimeSlider, SliderProps>(
  ({ className, onValueChange, ...props }, ref) => (
    <PrimeSlider
      ref={ref}
      className={cn(className)}
      onChange={(e) => onValueChange?.(e.value)}
      {...props}
    />
  ),
);
Slider.displayName = "Slider";

export { Slider };
