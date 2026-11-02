/**
 * Marca do ATHLETIX.
 *
 * Símbolo: um "A" de ascensão (progresso) cuja travessa é uma barra de
 * halteres — treino e evolução no mesmo desenho. O ponto no ápice marca o
 * próximo degrau, não um troféu: a ideia é continuidade.
 *
 * Geometria em 32×32, traço sólido (não stroke) para continuar legível em
 * 16px de favicon. Usa `currentColor` no corpo, então herda o contraste do
 * contexto e funciona nos temas claro e escuro sem arquivo separado.
 */
export function BrandMark({
  size = 30,
  title,
}: {
  size?: number;
  /** Ausente na maioria dos usos: o link ao lado já nomeia a marca. */
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {/* Corpo do A: two pernas em ascensão. */}
      <path
        d="M16 3.6 27.4 28.4h-6.1L16 15.9l-5.3 12.5H4.6L16 3.6Z"
        fill="currentColor"
      />
      {/* Travessa em forma de barra: hastes nas pontas, barra ao centro. */}
      <path
        d="M10.9 19.3h10.2v3.4H10.9z"
        fill="currentColor"
      />
      <path
        d="M8.2 17.6h2.1v6.8H8.2zM21.7 17.6h2.1v6.8h-2.1z"
        fill="currentColor"
      />
      {/* Ápice: o próximo degrau. */}
      <circle cx="16" cy="6.4" r="2.6" fill="var(--brand-spark, #c6f432)" />
    </svg>
  );
}
