import '@testing-library/jest-dom/vitest'

class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock

// Las pruebas de render de servidor corren en entorno `node`, sin DOM.
if (typeof Element !== "undefined") {
  Object.defineProperty(Element.prototype, "scrollTo", {
    configurable: true,
    value: () => {},
  })
}
