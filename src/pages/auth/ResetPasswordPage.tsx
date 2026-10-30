import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { Button, Field, Alert } from '@/components/ui';
import { IconEye, IconEyeOff } from '@/components/icons';

/**
 * Página de redefinição de senha.
 *
 * O Supabase redireciona aqui com um token de recuperação na URL
 * (hash `#access_token=...&type=recovery`). O SDK detecta e cria uma
 * sessão temporária, permitindo trocar a senha.
 */
export default function ResetPasswordPage() {
  const { setNewPassword, loading, error, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (password.length < 6) {
      setLocalError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    const err = await setNewPassword(password);
    if (!err) {
      setDone(true);
      setTimeout(() => navigate('/app', { replace: true }), 2000);
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <div className="auth-form">
          <div className="brand" style={{ marginBottom: 'var(--sp-6)', justifyContent: 'center' }}>
            <span className="brand-mark">A</span>
            <span>
              ATHLETIX
              <span className="brand-sub">Train. Track. Evolve.</span>
            </span>
          </div>

          <h1 className="page-title">Nova senha</h1>
          <p className="page-subtitle">Defina uma senha que você não vai esquecer.</p>

          {done ? (
            <Alert variant="success">
              Senha atualizada! Redirecionando para o painel…
            </Alert>
          ) : !user ? (
            <Alert variant="warning">
              O link de recuperação expirou ou é inválido. Solicite um novo em{' '}
              <a href="/app/login" style={{ color: 'var(--accent)' }}>
                Entrar
              </a>
              .
            </Alert>
          ) : (
            <>
              {error && <Alert variant="error">{error.message}</Alert>}
              {localError && <Alert variant="error">{localError}</Alert>}

              <form onSubmit={handleSubmit} noValidate>
                <Field label="Nova senha" htmlFor="newPassword">
                  <div className="input-group">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirmar senha" htmlFor="confirmPassword">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </Field>

                <Button type="submit" size="lg" block loading={loading}>
                  Salvar nova senha
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
