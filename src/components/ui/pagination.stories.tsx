import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./pagination";

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Barra de paginación independiente de la fuente de datos — no depende de TanStack Table ni de ningún fetcher, solo recibe `pageIndex`/`pageCount` y notifica cambios. `DataTable` la usa internamente, pero también sirve para paginar listas propias del consumidor (ej. resultados server-side).",
      },
    },
  },
  argTypes: {
    onPageIndexChange: { action: "onPageIndexChange" },
    onPageSizeChange: { action: "onPageSizeChange" },
  },
  args: {
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
    onPageIndexChange: () => {},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Caso completo: rango de elementos + selector de filas por página. */
export const Default: Story = {
  render: function Render(args) {
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const totalItems = 42;
    return (
      <Pagination
        {...args}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        onPageIndexChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

/** Sin `onPageSizeChange` ni `totalItems` — solo navegación entre páginas conocidas. */
export const Minima: Story = {
  render: function Render(args) {
    const [pageIndex, setPageIndex] = React.useState(0);
    return <Pagination {...args} pageIndex={pageIndex} pageCount={5} pageSize={10} onPageIndexChange={setPageIndex} />;
  },
};
