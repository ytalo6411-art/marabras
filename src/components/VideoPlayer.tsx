import { useState } from 'react';
import { IconPlay } from './icons';

/**
 * Player de vídeo sob demanda.
 *
 * O vídeo só é baixado quando o usuário clica — nenhum vídeo é carregado
 * automaticamente. Se o vídeo falhar, mostramos a alternativa visual
 * (poster/imagem ou ilustração), sem quebrar a página.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  fallbackText = 'Demonstração indisponível no momento.',
}: {
  src?: string | null;
  poster?: string | null;
  title: string;
  fallbackText?: string;
}) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="video-frame">
        {poster && !failed ? (
          <img
            src={poster}
            alt={`Ilustração de ${title}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy" width="640" height="360"
          />
        ) : (
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textAlign: 'center',
              padding: 'var(--sp-4)',
            }}
          >
            {fallbackText}
          </div>
        )}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="video-frame">
        <button
          type="button"
          className="video-poster"
          onClick={() => setStarted(true)}
          aria-label={`Reproduzir demonstração de ${title}`}
        >
          {poster && (
            <img src={poster} alt="" loading="lazy" width="640" height="360" referrerPolicy="no-referrer" />
          )}
          <span className="video-play">
            <IconPlay size={24} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="field-hint">Demonstração sem legendas na fonte. As instruções escritas estão abaixo.</p>
      <div className="video-frame">
      <video
        src={src}
        poster={poster ?? undefined}
        controls
        autoPlay
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      >
        {/* The source has no caption track; never fabricate captions. */}
        Seu navegador não suporta vídeo. <a href={src}>Baixe o arquivo.</a>
      </video>
      </div>
    </div>
  );
}

export default VideoPlayer;
