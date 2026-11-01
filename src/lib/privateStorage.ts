/** Private drafts are tab-scoped, never a second permanent account database. */
export function privateStorage(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}

/** Remove current and legacy persistent drafts, including others left on shared devices. */
export function clearPrivateUserData(): void {
  for (const storage of [privateStorage(), typeof localStorage === 'undefined' ? null : localStorage]) {
    if (!storage) continue;
    try {
      for (const key of Array.from({ length: storage.length }, (_, i) => storage.key(i))) {
        if (key && (key.startsWith('athletix:session:') || key.startsWith('athletix:training-draft:') ||
            key.startsWith('athletix:nutrition:') || key === 'athletix:schema-capabilities')) storage.removeItem(key);
      }
    } catch { /* Storage may be disabled by browser policy. */ }
  }
  // The SW caches public shells/media only. Remove old caches defensively.
  if (typeof caches !== 'undefined') {
    void caches.keys().then(keys => Promise.all(keys.filter(k => /workout|nutrition|profile|supabase|api/i.test(k)).map(k => caches.delete(k)))).catch(() => {});
  }
}
