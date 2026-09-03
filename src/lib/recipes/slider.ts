import { cva } from "class-variance-authority";

export const sliderTrackSizeVariants = cva("w-full overflow-hidden rounded-full bg-secondary shadow-inner", {
  variants: {
    size: {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

export const sliderThumbSizeVariants = cva("rounded-full border-2 border-primary bg-raised shadow-md", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
    },
  },
  defaultVariants: { size: "md" },
});
