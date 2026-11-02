/**
 * Tradução de erros do Postgres/PostgREST em mensagens acionáveis.
 *
 * Regra do projeto: nunca esconder a causa real. Antes, qualquer falha ao
 * iniciar uma sessão virava "verifique os exercícios e a migração V10" — o que
 * mandava o usuário procurar um problema de migração que não existia, enquanto
 * a causa real (uma coluna NOT NULL não preenchida) ficava invisível.
 *
 * Aqui o código SQLSTATE decide a mensagem. O erro original é sempre preservado
 * no console em desenvolvimento, para diagnóstico, e nunca vai cru para a tela
 * (pode conter nome de coluna/constraint, que não ajuda quem está treinando).
 */

export interface DatabaseErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

function asError(error: unknown): DatabaseErrorLike {
  if (error && typeof error === 'object') return error as DatabaseErrorLike;
  return { message: typeof error === 'string' ? error : '' };
}

/** true quando o banco confirma que falta tabela/coluna (migração pendente). */
export function isSchemaMissing(error: unknown): boolean {
  const { code, message = '' } = asError(error);
  return (
    code === '42P01' ||
    code === '42703' ||
    code === 'PGRST205' ||
    code === 'PGRST204' ||
    /does not exist|schema cache|could not find the table/i.test(message ?? '')
  );
}

/** true quando é bloqueio de permissão/RLS, e não dado inválido. */
export function isPermissionDenied(error: unknown): boolean {
  const { code, message = '' } = asError(error);
  return code === '42501' || code === 'PGRST301' || /permission denied|row-level security/i.test(message ?? '');
}

/** true quando uma escrita concorrente violou uma chave única. */
export function isUniqueViolation(error: unknown): boolean {
  return asError(error).code === '23505';
}

/**
 * Mensagem para o usuário. `fallback` é usado quando não reconhecemos o erro —
 * nesse caso dizemos que a operação falhou e que a causa foi registrada, sem
 * inventar um diagnóstico.
 */
export function databaseErrorMessage(error: unknown, fallback: string): string {
  const parsed = asError(error);

  if (import.meta.env?.DEV) {
    console.error('[ATHLETIX] Falha de banco', {
      code: parsed.code,
      message: parsed.message,
      details: parsed.details,
    });
  }

  if (isSchemaMissing(error)) {
    return 'O banco de dados está com o schema desatualizado. Avise o suporte: uma migração precisa ser aplicada.';
  }
  if (isPermissionDenied(error)) {
    return 'Você não tem permissão para alterar este registro. Entre novamente e confirme que ele é da sua conta.';
  }
  if (parsed.code === '23502') {
    return 'Faltou um dado obrigatório para salvar. Atualize a página e tente novamente; se persistir, avise o suporte.';
  }
  if (parsed.code === '23503') {
    return 'O registro relacionado não existe mais. Atualize a página para ver os dados atuais.';
  }
  if (parsed.code === '23514') {
    return 'Algum valor informado não é aceito. Revise os campos e tente novamente.';
  }
  if (parsed.code === '23505') {
    return 'Este registro já existe. Atualize a página para continuar de onde parou.';
  }
  if (/failed to fetch|networkerror|load failed|timeout/i.test(parsed.message ?? '')) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente — nada foi perdido.';
  }
  return fallback;
}
