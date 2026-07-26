import '@testing-library/jest-dom'

class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock

Object.defineProperty(Element.prototype, "scrollTo", {
  configurable: true,
  value: () => {},
})
