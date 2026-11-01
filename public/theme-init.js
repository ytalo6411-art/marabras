/**
 * Resolve o tema antes do primeiro paint (evita flash de tema errado).
 *
 * Carregado de forma síncrona no <head>, antes do CSS. É um arquivo externo
 * para não precisar de hash na Content-Security-Policy — script-src 'self'
 * já o autoriza, e o Service Worker o pré-cacheia.
 *
 * Espelha src/lib/theme.ts. Manter os dois em sincronia.
 */
(function () {
  try {
    var choice = localStorage.getItem('athletix-theme');
    if (choice !== 'light' && choice !== 'dark') choice = 'system';
    var resolved =
      choice === 'system'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : choice;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'light' ? '#f7f8fa' : '#05070a');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
