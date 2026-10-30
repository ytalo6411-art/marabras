import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

/**
 * Teste de fumaça do app inteiro.
 *
 * Garante que o roteador, os lazy chunks e a tela inicial montam sem
 * explodir — é o que quebraria de forma silenciosa se um import ou um
 * chunk fosse corrompido num deploy.
 */
describe('smoke: o app monta e renderiza a tela de login', () => {
  it('renderiza a rota protegida sem sessão', async () => {
    window.history.pushState({}, '', '/app/login');
    render(<App />);

    // Sem sessão o usuário deve cair na tela de login, com o botão do Google.
    await screen.findByRole('button', { name: /google/i }, { timeout: 5000 });

    expect(screen.getByRole('button', { name: /google/i })).toBeTruthy();
    expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
    expect(document.body.textContent).toMatch(/ATHLETIX/i);
  });
});
