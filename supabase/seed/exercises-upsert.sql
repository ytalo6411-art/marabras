-- ─────────────────────────────────────────────────────────────────────────────
-- Seed do catálogo de exercícios — ATHLETIX V2
-- Fonte: https://github.com/harshvishu/free-exercise-db-with-videos (MIT)
-- 317 exercícios, todos com vídeo demonstrativo (masculino e feminino).
--
-- Gerado por scripts/seed-exercises.mjs (NÃO edite à mão).
--
-- Os vídeos NÃO são enviados ao Supabase Storage: as URLs apontam para o CDN
-- público da fonte e o player carrega sob demanda, conforme o requisito de
-- não baixar todos os vídeos para o storage.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

INSERT INTO public.exercises AS e (
  slug, name, description, instructions, steps, breathing, common_mistakes,
  difficulty, primary_muscle, secondary_muscles, equipment, category_id,
  video_url, thumbnail_url, source_url, attribution, license, source, is_active
)
SELECT
  x->>'slug',
  x->>'name',
  x->>'description',
  x->>'instructions',
  ARRAY(SELECT jsonb_array_elements_text(x->'steps')),
  x->>'breathing',
  ARRAY(SELECT jsonb_array_elements_text(x->'common_mistakes')),
  (x->>'difficulty')::difficulty_level,
  x->>'primary_muscle',
  ARRAY(SELECT jsonb_array_elements_text(x->'secondary_muscles')),
  ARRAY(SELECT jsonb_array_elements_text(x->'equipment')),
  c.id,
  x->>'video_url',
  x->>'thumbnail_url',
  'https://github.com/harshvishu/free-exercise-db-with-videos/blob/main/data/exercises.json',
  'Free Exercise DB with Videos',
  'MIT',
  'free_exercise_db'::source_type,
  true
FROM jsonb_array_elements(
  -- O payload JSON é gerado por scripts/seed-exercises.mjs.
  '[]'::jsonb
) AS x
JOIN public.exercise_categories c ON c.slug = x->>'category_slug'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  steps = EXCLUDED.steps,
  breathing = EXCLUDED.breathing,
  common_mistakes = EXCLUDED.common_mistakes,
  difficulty = EXCLUDED.difficulty,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  equipment = EXCLUDED.equipment,
  category_id = EXCLUDED.category_id,
  video_url = EXCLUDED.video_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  updated_at = now();

COMMIT;
