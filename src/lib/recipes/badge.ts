import { cva } from "class-variance-authority";

export const badgeSizeVariants = cva("", {
  variants: {
    size: {
      sm: "px-2 py-0.5 text-[0.6875rem]",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: { size: "md" },
});
