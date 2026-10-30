import { Link, useParams } from 'react-router-dom';

/**
 * Termos de Uso e Política de Privacidade.
 *
 * Conteúdo jurídico real (não placeholder), conforme a LGPD (Lei 13.709/2018)
 * e o Marco Civil da Internet. Deve ser revisado por um advogado antes do
 * lançamento público — isso está registrado no README.
 */
export default function LegalPage() {
  const { doc } = useParams<{ doc: string }>();
  const isPrivacy = doc === 'privacy';

  return (
    <div className="container" style={{ paddingBlock: 'var(--sp-6)', maxWidth: 760 }}>
      <Link to="/app" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        ← Voltar
      </Link>

      <h1 className="page-title">{isPrivacy ? 'Política de Privacidade' : 'Termos de Uso'}</h1>
      <p className="page-subtitle">Última atualização: outubro de 2026.</p>

      {isPrivacy ? <PrivacyContent /> : <TermsContent />}

      <div className="divider" />
      <p className="text-xs text-dim">
        <strong>Aviso:</strong> este documento é uma base de trabalho redigida para o
        produto. Antes da publicação pública, submeta-o à revisão de um advogado
        especializado em direito digital e LGPD.
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="stack stack-5">
      <section>
        <h2 className="section-title">1. Quem somos e o que coletamos</h2>
        <p className="text-muted">
          O ATHLETIX é uma plataforma de acompanhamento de treino, nutrição e evolução
          esportiva. Coletamos apenas o necessário para o funcionamento do serviço:
          endereço de e-mail, nome e foto de perfil (quando fornecidos pelo provedor de
          login ou pelo próprio usuário), e os registros de atividade que você opta por
          criar — treinos, séries, medidas corporais, diário alimentar e hidratação.
        </p>
      </section>

      <section>
        <h2 className="section-title">2. Finalidades e base legal</h2>
        <p className="text-muted">
          Tratamos dados para executar o contrato com você (LGPD, art. 7º, V), para
          cumprir obrigações legais (art. 7º, II) e, quando necessário, com base no seu
          consentimento (art. 7º, I) — por exemplo, comunicações de lembrete de treino,
          que podem ser desativadas a qualquer momento nas Configurações.
        </p>
      </section>

      <section>
        <h2 className="section-title">3. Login com Google</h2>
        <p className="text-muted">
          Ao entrar com Google, recebemos da Google as informações basicadas no escopo
          solicitado: endereço de e-mail, nome e foto de perfil. Não temos acesso aos seus
          contatos, e-mails ou histórico de navegação. A sessão é gerenciada pelo
          Supabase Auth, com tokens de curta duração e rotação automática.
        </p>
      </section>

      <section>
        <h2 className="section-title">4. Dados de menores de idade</h2>
        <p className="text-muted">
          O ATHLETIX pode ser usado por adolescentes. Para esse público, ativamos
          proteções adicionais: não oferecemos restrição calórica automática nem metas
          agressivas de emagrecimento, e orientamos acompanhamento profissional. Não
          exibimos conteúdo de publicidade infantil e não vendemos dados de menores para
          terceiros.
        </p>
      </section>

      <section>
        <h2 className="section-title">5. Onde seus dados ficam</h2>
        <p className="text-muted">
          Os dados são armazenados em banco PostgreSQL hospedado no Supabase, com
          criptografia em trânsito e em repouso. O acesso é controlado por políticas de
          Row Level Security (RLS): cada usuário só consegue ler e escrever os próprios
          registros, verificados no próprio banco — não apenas na interface. Dados
          nutritional públicos vêm de USDA FoodData Central e Open Food Facts, sob suas
          respectivas licenças.
        </p>
      </section>

      <section>
        <h2 className="section-title">6. Compartilhamento</h2>
        <p className="text-muted">
          Não vendemos seus dados. Compartilhamos apenas com operadores necessários ao
          funcionamento do serviço (hospedagem, e-mail transacional, autenticação), todos
          submetidos a contratos de tratamento de dados. Podemos ser obrigados a
          disponibilizar dados por ordem judicial ou legal vigente.
        </p>
      </section>

      <section>
        <h2 className="section-title">7. Seus direitos</h2>
        <p className="text-muted">
          Você pode, a qualquer momento: acessar e corrigir seus dados; exportar tudo em
          formato JSON (página Perfil); excluir sua conta permanentemente (página
          Configurações); revogar consentimentos (a qualquer momento, nas Configurações).
          Solicitações podem ser feitas pelo canal de suporte, e respondemos em prazo
          razoável, nos termos do art. 18 da LGPD.
        </p>
      </section>

      <section>
        <h2 className="section-title">8. Retenção</h2>
        <p className="text-muted">
          Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão, os
          registros são removidos ou anonimizados conforme a obrigação legal aplicável.
        </p>
      </section>

      <section>
        <h2 className="section-title">9. Segurança</h2>
        <p className="text-muted">
          Adotamos RLS, validação de entrada, sanitização, limitação de taxa de requisições
          e registro de auditoria para ações administrativas. Nenhum segredo de serviço
          é enviado ao navegador. Em caso de incidente relevante, comunicamos os
          afetados e as autoridades competentes conforme a legislação.
        </p>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="stack stack-5">
      <section>
        <h2 className="section-title">1. Aceitação</h2>
        <p className="text-muted">
          Ao criar uma conta ou usar o ATHLETIX, você concorda com estes Termos e com a
          Política de Privacidade. Se não concordar, não utilize o serviço.
        </p>
      </section>

      <section>
        <h2 className="section-title">2. Natureza do serviço</h2>
        <p className="text-muted">
          O ATHLETIX é uma ferramenta de registro e acompanhamento. As informações,
          exercícios, rótulos nutricionais e sugestões exibidas são informativos. O
          serviço <strong>não é</strong> prescrição médica, avaliação nutricional ou
          orientação de treinamento personalizada.
        </p>
      </section>

      <section>
        <h2 className="section-title">3. Responsabilidade do usuário</h2>
        <p className="text-muted">
          Você é responsável pela veracidade dos dados registrados, pela segurança das
          suas credenciais e pelo uso que faz do serviço. Não é permitido usar a
          plataforma para atividades ilegais, para assédio ou para violar direitos de
          terceiros.
        </p>
      </section>

      <section>
        <h2 className="section-title">4. Conteúdo de terceiros</h2>
        <p className="text-muted">
          Exercícios e dados nutricionais são obtidos de fontes abertas e licenciadas
          (Free Exercise DB, wger, USDA FoodData Central, Open Food Facts), com
          atribuição exibida no produto. Uma eventual indisponibilidade dessas fontes
          não configura falha do ATHLETIX.
        </p>
      </section>

      <section>
        <h2 className="section-title">5. Saúde e segurança</h2>
        <p className="text-muted">
          Inicie qualquer programa de treino de forma progressiva e sob orientação
          profissional quando houver dúvida. Relate qualquer dor, lesão ou condição de
          saúde antes de aumentar intensidade. Usuentes menores de idade devem fazer isso
          com acompanhamento de profissional habilitado.
        </p>
      </section>

      <section>
        <h2 className="section-title">6. Disponibilidade e alterações</h2>
        <p className="text-muted">
          Worked on free-tier infrastructure; some features may be limited. Podemos
          alterar ou descontinuar funcionalidades, sempre com aviso razoável. Podemos
          suspender contas que violem estes Termos.
        </p>
      </section>

      <section>
        <h2 className="section-title">7. Limitação de responsabilidade</h2>
        <p className="text-muted">
          Na máxima extensão permitida por lei, a responsabilidade do ATHLETIX por
          danos indiretos, perda de dados ou lucro cessante é limitada ao valor pago
          pelo usuário nos 12 meses anteriores ao evento, ou ao mínimo exigido pela
          legislação aplicável.
        </p>
      </section>

      <section>
        <h2 className="section-title">8. Foro</h2>
        <p className="text-muted">
          Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro do domicílio
          do consumidor para dirimir controvérsias, conforme o Código de Defesa do
          Consumidor.
        </p>
      </section>
    </div>
  );
}
