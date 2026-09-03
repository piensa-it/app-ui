import { cva } from "class-variance-authority";

import { focusRingOutside } from "./focus";
import { disabledStyles, interactiveTransition } from "./interactive";

export const checkboxControlVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-sm border",
    interactiveTransition,
    focusRingOutside,
    disabledStyles,
    "border-border bg-raised",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
    "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
    "data-[focus-visible]:outline-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-[1.125rem] [&_svg]:size-3",
        md: "size-5 [&_svg]:size-3.5",
        lg: "size-[1.375rem] [&_svg]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const checkboxLabelVariants = cva("select-none font-medium text-foreground", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
