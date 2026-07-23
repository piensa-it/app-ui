import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: { className: "h-10 w-full" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tarjeta: Story = {
  render: () => <div className="grid max-w-sm gap-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /></div>,
};
