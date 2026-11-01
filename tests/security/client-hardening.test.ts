import { describe, expect, it, beforeEach } from 'vitest';
import { clearPrivateUserData } from '../../src/lib/privateStorage';
import { authAttemptCooldown, clearAuthAttemptCooldowns } from '../../src/services/auth';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => map.clear(),
  };
}

describe('private local data', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: memoryStorage(), configurable: true });
  });
  it('removes current and legacy personal drafts but keeps nonpersonal prefs', () => {
    localStorage.setItem('athletix:training-draft:user-a', '{"weightKg":80}');
    localStorage.setItem('athletix:session:user-a', '{}');
    sessionStorage.setItem('athletix:training-draft:user-b', '{}');
    sessionStorage.setItem('athletix:schema-capabilities', '{}');
    localStorage.setItem('athletix:locale', 'pt-BR');
    clearPrivateUserData();
    expect(localStorage.getItem('athletix:training-draft:user-a')).toBeNull();
    expect(localStorage.getItem('athletix:session:user-a')).toBeNull();
    expect(sessionStorage.getItem('athletix:training-draft:user-b')).toBeNull();
    expect(sessionStorage.getItem('athletix:schema-capabilities')).toBeNull();
    expect(localStorage.getItem('athletix:locale')).toBe('pt-BR');
  });
});

describe('auth cooldown (UX only, not a security boundary)', () => {
  beforeEach(() => clearAuthAttemptCooldowns());
  it('throttles repeated login/recovery per subject and action', () => {
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(authAttemptCooldown('login', 'User@Example.com', t + i)).toBe(0);
    expect(authAttemptCooldown('login', 'user@example.com', t + 10)).toBeGreaterThan(0);
    expect(authAttemptCooldown('recovery', 'user@example.com', t + 10)).toBe(0);
    expect(authAttemptCooldown('login', 'other@example.com', t + 10)).toBe(0);
    expect(authAttemptCooldown('login', 'user@example.com', t + 16 * 60_000)).toBe(0);
  });
});
