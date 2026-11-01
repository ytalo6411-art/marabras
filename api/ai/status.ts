/**
 * GET /api/ai/status
 *
 * Informa se o servidor tem um provedor de IA configurado. Não expõe a chave,
 * a URL interna nem qualquer credencial — apenas o nome do modelo público.
 */

import { securityHeaders } from '../_lib/security';
import type { ApiRequest, ApiResponse } from '../_lib/http';
import { readProviderConfig } from '../_lib/provider';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  securityHeaders(res);
  if (_req.method && _req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({error:'Método não permitido.'}); }
  const config = readProviderConfig();

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    configured: Boolean(config),
    model: config?.model ?? null,
  });
}
