import { useEffect, useState } from 'react';
import { getSchemaCapabilities, type SchemaCapabilities } from '@/services/dbCapabilities';

/**
 * Resolve (uma vez por sessão) quais partes do schema existem no banco.
 *
 * Devolve `null` enquanto a checagem está em andamento — assim a UI não mostra
 * aviso antes de saber o resultado (evita "piscar" um alerta falso).
 */
export function useSchemaCapabilities(): SchemaCapabilities | null {
  const [capabilities, setCapabilities] = useState<SchemaCapabilities | null>(null);

  useEffect(() => {
    let alive = true;

    void getSchemaCapabilities().then((result) => {
      if (alive) setCapabilities(result.capabilities);
    });

    return () => {
      alive = false;
    };
  }, []);

  return capabilities;
}
