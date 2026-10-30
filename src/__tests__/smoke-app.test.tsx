import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';

/**
 * Teste de fumaça do app inteiro.
 *
 * Garante que o roteador, os lazy chunks e a tela inicial montam sem
 * explodir — é o que quebraria de forma silenciosa se um import ou um
 * chunk fosse corrompido num deploy.
 *
 * A tela de login tem dois modos legítimos de renderização:
 *
 *  1. **Com Supabase configurado** — formulário completo, com o botão
 *     "Entrar com Google".
 *  2. **Sem as variáveis `VITE_SUPABASE_*`** — o CI roda sem `.env`, e aí
 *     o app mostra um aviso de configuração em vez do formulário. É o
 *     comportamento correto: nada de tela quebrada nem erro 401 fantasma.
 *
 * O teste cobre os dois, para não depender do ambiente em que roda.
 */
describe('smoke: o app monta e renderiza a tela de login', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/app/login');
  });

  it('renderiza a rota protegida sem sessão', async () => {
    render(<App />);

    // A tela de login carrega de forma lazy. A marca "ATHLETIX" aparece
    // na página e no shell, então esperamos por qualquer uma das ocorrências.
    await waitFor(
      () => {
        expect(screen.getAllByText(/ATHLETIX/i).length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    const bodyText = document.body.textContent ?? '';
    const googleButton = screen.queryByRole('button', { name: /entrar com google/i });
    const setupNotice = /ainda não está conectado ao Supabase/i.test(bodyText);

    if (googleButton) {
      // Modo 1: configurado — o formulário de login está de pé.
      expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
    } else {
      // Modo 2: sem configuração — o app avisa em vez de quebrar.
      expect(setupNotice).toBe(true);
    }
  });
});
