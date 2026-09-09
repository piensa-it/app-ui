import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import * as React from "react";
import { useSidebar } from "../components/layout/sidebar-context";
import { SidebarProvider } from "../components/layout/sidebar-context";
import type { SidebarState } from "../components/layout/sidebar-context";

describe("useSidebar", () => {
  it("fuera de un SidebarProvider devuelve un estado neutro (collapsed=false, sin romperse)", () => {
    const { result } = renderHook(() => useSidebar());
    expect(result.current.collapsed).toBe(false);
    expect(result.current.rail).toBe(false);
    expect(result.current.inMobilePanel).toBe(false);
    expect(result.current.closedGroups).toEqual([]);
    // No deben lanzar: son no-ops fuera de AppShell.
    expect(() => result.current.closeMobile()).not.toThrow();
    expect(() => result.current.toggleGroup("grupo", true)).not.toThrow();
  });

  it("dentro de un SidebarProvider expone el valor provisto", () => {
    const valor: SidebarState = {
      collapsed: true,
      rail: true,
      closeMobile: () => {},
      inMobilePanel: true,
      closedGroups: ["reportes"],
      toggleGroup: () => {},
    };
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(SidebarProvider, { value: valor }, children);
    const { result } = renderHook(() => useSidebar(), { wrapper });
    expect(result.current).toEqual(valor);
  });
});
