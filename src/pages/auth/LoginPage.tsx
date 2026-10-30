import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { Button, Field, Alert } from '@/components/ui';
import { IconGoogle, IconEye, IconEyeOff } from '@/components/icons';

/**
 * Página de entrada.
 *
 * Prioridade: Google OAuth (um clique). E-mail + senha como alternativa.
 * A tela de cadastro é separada e acessível por link.
 */
export default function LoginPage() {
  const { user, loading, error, signInGoogle, signInEmail, clearError, configured } =
    useAuthStore();

  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Mensagem vinda de outra tela (ex.: "faça login para continuar").
  const redirectReason = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    clearError();
  }, [mode, clearError]);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  async function handleGoogle() {
    await signInGoogle();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (mode === 'forgot') {
      await useAuthStore.getState().resetPassword(email);
      return;
    }

    if (mode === 'signup') {
      const result = await useAuthStore.getState().signUpEmail(email, password, fullName);
      if (!result.error) setNeedsConfirmation(result.needsEmailConfirmation);
      return;
    }

    await signInEmail(email, password);
  }

  if (!configured) {
    return (
      <div className="auth-page">
        <div className="auth-panel">
          <div className="auth-form">
            <div className="brand" style={{ marginBottom: 'var(--sp-5)' }}>
              <span className="brand-mark">A</span>
              <span>
                ATHLETIX
                <span className="brand-sub">Train. Track. Evolve.</span>
              </span>
            </div>
            <Alert variant="warning">
              O app ainda não está conectado ao Supabase. Copie <code>.env.example</code> para{' '}
              <code>.env</code> e preencha <code>VITE_SUPABASE_URL</code> e{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>.
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const title =
    mode === 'signin'
      ? 'Entrar na ATHLETIX'
      : mode === 'signup'
        ? 'Criar sua conta'
        : 'Recuperar senha';

  const submitLabel =
    mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar e-mail';

  return (
    <div className="auth-page">
      {/* Painel de apresentação — escondido no mobile para focar no formulário */}
      <aside className="auth-hero">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>
            ATHLETIX
            <span className="brand-sub">Train. Track. Evolve.</span>
          </span>
        </div>

        <div className="auth-hero__content">
          <h1 className="auth-hero__title">
            Treino que vira
            <br />
            <span style={{ color: 'var(--accent)' }}>evolução.</span>
          </h1>
          <p className="auth-hero__text">
            Sua plataforma de treino, nutrição e evolução esportiva. Exercises com vídeo,
            planos personalizados e seu histórico completo.
          </p>

          <div style={{ marginTop: 'var(--sp-6)' }}>
            <div className="auth-feature">
              <span className="auth-feature__icon">
                <IconGoogle size={18} />
              </span>
              <div>
                <strong style={{ fontSize: '0.92rem' }}>Login com Google em 1 clique</strong>
                <div className="text-sm text-muted">Sem senha, sem cadastro demorado.</div>
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature__icon">🎬</span>
              <div>
                <strong style={{ fontSize: '0.92rem' }}>Exercícios com vídeo real</strong>
                <div className="text-sm text-muted">Demonstração de execução e erros comuns.</div>
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature__icon">📊</span>
              <div>
                <strong style={{ fontSize: '0.92rem' }}>Progresso mensurável</strong>
                <div className="text-sm text-muted">Cargas, volume, recordes e evolução.</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-dim">
          Dados protegidos por Row Level Security. Seus treinos e dieta são privados por padrão.
        </p>
      </aside>

      {/* Formulário */}
      <main className="auth-panel">
        <div className="auth-form">
          <div
            className="brand"
            style={{ marginBottom: 'var(--sp-6)', justifyContent: 'center' }}
          >
            <span className="brand-mark">A</span>
            <span>
              ATHLETIX
              <span className="brand-sub">Train. Track. Evolve.</span>
            </span>
          </div>

          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">
            {mode === 'signin'
              ? 'Entre para continuar seu treino.'
              : mode === 'signup'
                ? 'Leva menos de um minuto.'
                : 'Enviamos um link para redefinir sua senha.'}
          </p>

          {redirectReason && (
            <Alert variant="info">Entre na sua conta para continuar.</Alert>
          )}

          {needsConfirmation && (
            <Alert variant="success">
              Conta criada! Confira seu e-mail para confirmar o endereço e entrar.
            </Alert>
          )}

          {error && <Alert variant="error">{error.message}</Alert>}

          {/* Botão Google — sempre visível, é o caminho principal */}
          {mode !== 'forgot' && (
            <>
              <Button
                variant="google"
                size="lg"
                block
                onClick={handleGoogle}
                loading={loading}
                type="button"
              >
                <IconGoogle size={19} />
                {mode === 'signin' ? 'Entrar com Google' : 'Cadastrar com Google'}
              </Button>

              <div className="auth-divider">ou com e-mail</div>
            </>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <Field label="Nome" htmlFor="fullName">
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  placeholder="Como quer ser chamado"
                />
              </Field>
            )}

            <Field label="E-mail" htmlFor="email">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="voce@email.com"
                aria-invalid={Boolean(error && !email)}
              />
            </Field>

            {mode !== 'forgot' && (
              <Field
                label="Senha"
                htmlFor="password"
                hint={mode === 'signup' ? 'Mínimo de 6 caracteres.' : undefined}
              >
                <div className="input-group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    aria-invalid={Boolean(error && !password)}
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
            )}

            <Button
              type="submit"
              size="lg"
              block
              loading={loading}
              disabled={!email || (mode !== 'forgot' && password.length < 6)}
            >
              {submitLabel}
            </Button>
          </form>

          <div className="stack stack-2" style={{ marginTop: 'var(--sp-5)' }}>
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMode('forgot')}
                >
                  Esqueci minha senha
                </button>
                <p className="text-sm text-muted center">
                  Não tem conta?{' '}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setMode('signup')}
                  >
                    Criar conta
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-sm text-muted center">
                Já tem conta?{' '}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMode('signin')}
                >
                  Entrar
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p className="text-sm text-muted center">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMode('signin')}
                >
                  Voltar para entrar
                </button>
              </p>
            )}
          </div>

          <p className="text-xs text-dim" style={{ marginTop: 'var(--sp-5)' }}>
            Ao continuar você concorda com os{' '}
            <Link to="/legal/terms" style={{ color: 'var(--text-muted)' }}>
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link to="/legal/privacy" style={{ color: 'var(--text-muted)' }}>
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
