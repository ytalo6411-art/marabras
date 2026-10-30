import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/**
 * Setup global dos testes.
 *
 * Simula as APIs de navegador que o jsdom não implementa e que o app usa
 * (matchMedia, IntersectionObserver, ResizeObserver, scrollIntoView).
 */

// `vi` precisa estar disponível globalmente para o `vi.mock` em arquivos de teste.
(globalThis as unknown as { vi: typeof vi }).vi = vi;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
}

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
