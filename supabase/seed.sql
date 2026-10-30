-- ══════════════════════════════════════════════════════════════════════════════
-- ATHLETIX — Seed de categorias e conquistas
-- Idempotente: pode rodar quantas vezes quiser.
-- ══════════════════════════════════════════════════════════════════════════════

-- Categorias de exercício (upsert por slug).
insert into public.exercise_categories (slug, name_pt, name_en, muscle_group, icon, display_order) values
  ('chest', 'Peito', 'Chest', 'chest', 'dumbbell', 1),
  ('back', 'Costas', 'Back', 'back', 'layers', 2),
  ('shoulders', 'Ombros', 'Shoulders', 'shoulders', 'move-up', 3),
  ('biceps', 'Bíceps', 'Biceps', 'biceps', 'dumbbell', 4),
  ('triceps', 'Tríceps', 'Triceps', 'triceps', 'dumbbell', 5),
  ('abs', 'Abdômen', 'Abs', 'core', 'circle-dot', 6),
  ('quads', 'Quadríceps', 'Quadriceps', 'quads', 'footprints', 7),
  ('hamstrings', 'Posterior de coxa', 'Hamstrings', 'hamstrings', 'footprints', 8),
  ('glutes', 'Glúteos', 'Glutes', 'glutes', 'footprints', 9),
  ('calves', 'Panturrilhas', 'Calves', 'calves', 'footprints', 10),
  ('cardio', 'Cardio', 'Cardio', 'cardio', 'heart-pulse', 11),
  ('mobility', 'Mobilidade', 'Mobility', 'mobility', 'wind', 12),
  ('stretching', 'Alongamento', 'Stretching', 'stretching', 'wind', 13)
on conflict (slug) do update
  set name_pt = excluded.name_pt,
      name_en = excluded.name_en,
      muscle_group = excluded.muscle_group,
      icon = excluded.icon,
      display_order = excluded.display_order;

-- Conquistas (upsert por slug).
insert into public.achievements (slug, name, description, icon, tier, criteria_type, criteria_value, points) values
  ('first_session', 'Primeiro Passo', 'Complete sua primeira sessão de treino.', '🏋️', 'bronze', 'sessions', 1, 10),
  ('sessions_10', 'Dez Sessões', 'Complete 10 sessões de treino.', '💪', 'bronze', 'sessions', 10, 25),
  ('sessions_50', 'Meio Caminho', 'Complete 50 sessões de treino.', '🔥', 'silver', 'sessions', 50, 75),
  ('sessions_100', 'Cem', 'Complete 100 sessões de treino.', '⚡', 'gold', 'sessions', 100, 150),
  ('streak_7', 'Semana Perfeita', 'Treine 7 dias seguidos.', '📅', 'silver', 'streak', 7, 50),
  ('streak_30', 'Mês Consistente', 'Treine 30 dias seguidos.', '🏆', 'gold', 'streak', 30, 200),
  ('volume_10000', '10 Toneladas', 'Move 10.000 kg no total.', '🏗️', 'silver', 'volume', 10000, 60),
  ('volume_50000', '50 Toneladas', 'Move 50.000 kg no total.', '⛰️', 'gold', 'volume', 50000, 180),
  ('first_pr', 'Primeiro Recorde', 'Estabeleça seu primeiro recorde pessoal.', '🎯', 'bronze', 'pr', 1, 20),
  ('hydration_week', 'Hidratação Consistente', 'Beba sua meta de água por 7 dias.', '💧', 'bronze', 'hydration', 7, 30),
  ('nutrition_log_7', 'Diário Consistente', 'Registre refeições por 7 dias.', '🥗', 'bronze', 'nutrition', 7, 30)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      icon = excluded.icon,
      tier = excluded.tier,
      criteria_type = excluded.criteria_type,
      criteria_value = excluded.criteria_value,
      points = excluded.points;
