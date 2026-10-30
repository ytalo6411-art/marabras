import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Field, Alert } from '@/components/ui';
import { IconChevronLeft } from '@/components/icons';

/** Página de suporte com FAQ e canal de contato. */
export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="container" style={{ paddingBlock: 'var(--sp-6)' }}>
      <Link to="/app" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        <IconChevronLeft size={16} />
        Voltar
      </Link>

      <h1 className="page-title">Suporte</h1>
      <p className="page-subtitle">Dúvidas frequentes e canal de atendimento.</p>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack stack-4">
          <Card>
            <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
              Perguntas frequentes
            </h2>

            <Faq
              question="Como entro na minha conta?"
              answer="Clique em “Entrar com Google” na tela inicial. Se preferir, use e-mail e senha. A sessão fica salva no dispositivo, então você não precisa entrar toda vez."
            />
            <Faq
              question="Quem pode ver meus treinos?"
              answer="Ninguém além de você. As políticas de Row Level Security no banco garantem que cada usuário só consiga ler e escrever os próprios registros — isso vale mesmo se alguém tentar alterar a URL ou a requisição."
            />
            <Faq
              question="De onde vêm os dados dos exercícios?"
              answer="De fontes abertas e licenciadas: Free Exercise DB (MIT, com vídeos) e wger (AGPL-3.0). Cada exercício mostra a origem e a licença. Para Nutrição, usamos USDA FoodData Central e Open Food Facts."
            />
            <Faq
              question="Posso usar no celular?"
              answer="Sim. O ATHLETIX é instalável como aplicativo (PWA) e foi construído mobile-first, com navegação inferior e alvos de toque adequados."
            />
            <Faq
              question="Meus dados podem ser apagados?"
              answer="Sim. Em Configurações você pode excluir a conta, o que remove permanentemente todos os dados relacionados. Também é possível exportar tudo em JSON."
            />
          </Card>
        </div>

        <div className="stack stack-4">
          <Card>
            <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
              Falar com a gente
            </h2>

            {sent ? (
              <Alert variant="success">
                Mensagem registrada! Nossa equipe responde por e-mail.
              </Alert>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <Field label="Seu e-mail" htmlFor="support-email">
                  <input
                    id="support-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="voce@email.com"
                  />
                </Field>

                <Field label="Mensagem" htmlFor="support-message">
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                    placeholder="Descreva o que aconteceu…"
                  />
                </Field>

                <Button type="submit" block disabled={!email || message.length < 10}>
                  Enviar mensagem
                </Button>
              </form>
            )}
          </Card>

          <Card>
            <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>
              Aviso importante
            </h2>
            <p className="text-sm text-muted">
              O ATHLETIX é uma ferramenta de acompanhamento. As informações exibidas não
              substituem avaliação médica ou nutricional profissional. Se você é menor de
              idade, ou tem alguma condição de saúde, procure um profissional habilitado
              antes de iniciar um plano de treino ou dieta.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBlock: 'var(--sp-3)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          textAlign: 'left',
          fontWeight: 600,
          gap: 'var(--sp-3)',
          minHeight: 32,
        }}
      >
        {question}
        <span aria-hidden="true" style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-2)' }}>
          {answer}
        </p>
      )}
    </div>
  );
}
