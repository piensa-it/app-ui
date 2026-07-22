import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload } from "./file-upload";

const meta = {
  title: "UI/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Carga de archivos (drag & drop) sobre PrimeReact FileUpload." } },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    customUpload: true,
    uploadHandler: (e) => e.options.clear(),
    multiple: true,
    accept: "image/*,.pdf",
  },
};
