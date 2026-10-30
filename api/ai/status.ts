/**
 * GET /api/ai/status
 *
 * Informa se o servidor tem um provedor de IA configurado. Não expõe a chave,
 * a URL interna nem qualquer credencial — apenas o nome do modelo público.
 */

import type { ApiRequest, ApiResponse } from '../_lib/http';
import { readProviderConfig } from '../_lib/provider';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  const config = readProviderConfig();

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    configured: Boolean(config),
    model: config?.model ?? null,
  });
}
