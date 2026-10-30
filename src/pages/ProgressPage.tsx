import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { Card, EmptyState, SkeletonList, Progress as ProgressBar } from '@/components/ui';
import { formatDate, formatDecimal, formatNumber } from '@/utils/format';
import type { WorkoutSession, BodyMeasurement, PersonalRecord, Exercise } from '@/types/database';

/**
 * Evolução: gráficos de treino, medidas corporais e recordes.
 *
 * Os gráficos são SVG desenhados à mão — sem dependência de biblioteca de
 * charts, o que mantém o bundle leve (requisito de performance §14).
 */
export default function ProgressPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [records, setRecords] = useState<(PersonalRecord & { exercise?: Exercise })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: true })
        .limit(60),
      supabase
        .from('body_measurements')
        .select('*')
        .order('measured_at', { ascending: true })
        .limit(30),
      supabase
        .from('personal_records')
        .select('*')
        .order('achieved_at', { ascending: false })
        .limit(10),
    ])
      .then(async ([sessionsRes, measRes, prRes]) => {
        setSessions(sessionsRes.data ?? []);
        setMeasurements(measRes.data ?? []);

        const exerciseIds = (prRes.data ?? []).map((r) => r.exercise_id);
        const { data: exRows } = exerciseIds.length
          ? await supabase.from('exercises').select('*').in('id', exerciseIds)
          : { data: [] as Exercise[] };
        const exMap = new Map((exRows ?? []).map((e) => [e.id, e]));

        setRecords(
          (prRes.data ?? []).map((r) => ({ ...r, exercise: exMap.get(r.exercise_id) })),
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Evolução</h1>
        <SkeletonList count={3} height={180} />
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Evolução</h1>
      <p className="page-subtitle">Seu progresso ao longo do tempo.</p>

      <div className="stack stack-5">
        {/* Volume por sessão */}
        <Card>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
            Volume por sessão
          </h2>
          {sessions.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Sem sessões concluídas"
              text="Finalize treinos para ver seu volume acumulado."
            />
          ) : (
            <VolumeChart sessions={sessions} />
          )}
        </Card>

        {/* Frequência */}
        {sessions.length > 0 && (
          <Card>
            <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Sessões por semana
            </h2>
            <WeeklyChart sessions={sessions} />
          </Card>
        )}

        {/* Medidas */}
        <Card>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
            Medidas corporais
          </h2>
          {measurements.length === 0 ? (
            <EmptyState
              icon="📏"
              title="Nenhuma medida registrada"
              text="Registre peso e medidas para acompanhar a evolução do composição corporal."
            />
          ) : (
            <MeasurementsTable measurements={measurements} />
          )}
        </Card>

        {/* Recordes */}
        <Card>
          <h2 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
            Recordes pessoais
          </h2>
          {records.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="Nenhum recorde ainda"
              text="Seus melhores resultados aparecem aqui automaticamente."
            />
          ) : (
            <ul className="stack stack-2">
              {records.map((r) => (
                <li key={r.id} className="row-between">
                  <span className="truncate">{r.exercise?.name ?? 'Exercício'}</span>
                  <span className="badge badge-lime">
                    {formatDecimal(r.value)} {r.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

/** Gráfico de linha: volume por sessão. */
function VolumeChart({ sessions }: { sessions: WorkoutSession[] }) {
  const width = 600;
  const height = 180;
  const padX = 36;
  const padY = 16;

  const max = Math.max(...sessions.map((s) => s.total_volume_kg), 1);
  const stepX = (width - padX * 2) / Math.max(sessions.length - 1, 1);

  const points = sessions.map((s, i) => {
    const x = padX + i * stepX;
    const y = height - padY - (s.total_volume_kg / max) * (height - padY * 2);
    return { x, y, s };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1]?.x ?? padX} ${height - padY} L ${padX} ${height - padY} Z`;

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Volume por sessão">
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          className="chart-grid-line"
          x1={padX}
          x2={width - padX}
          y1={padY + t * (height - padY * 2)}
          y2={padY + t * (height - padY * 2)}
        />
      ))}

      <path className="chart-area" d={areaPath} />
      <path className="chart-line" d={path} />

      {points.map((p) => (
        <circle key={p.s.id} className="chart-dot" cx={p.x} cy={p.y} r={3.5}>
          <title>{`${p.s.name}: ${formatNumber(p.s.total_volume_kg)} kg`}</title>
        </circle>
      ))}

      <text className="chart-axis-label" x={4} y={padY + 4}>
        {formatNumber(max)}
      </text>
      <text className="chart-axis-label" x={4} y={height - padY + 4}>
        0
      </text>
    </svg>
  );
}

/** Gráfico de barras: sessões por semana. */
function WeeklyChart({ sessions }: { sessions: WorkoutSession[] }) {
  const weeks = new Map<string, number>();

  for (const s of sessions) {
    if (!s.completed_at) continue;
    const d = new Date(s.completed_at);
    // Semana ISO simplificada: lunes como início.
    const day = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);
    const key = monday.toISOString().slice(0, 10);
    weeks.set(key, (weeks.get(key) ?? 0) + 1);
  }

  const entries = [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return <p className="text-sm text-muted">Dados insuficientes para o gráfico.</p>;
  }

  return (
    <div className="stack stack-2">
      {entries.map(([week, count]) => (
        <div key={week}>
          <div className="row-between text-sm" style={{ marginBottom: 4 }}>
            <span className="text-muted">{formatDate(`${week}T12:00:00`)}</span>
            <strong>{count}</strong>
          </div>
          <ProgressBar value={count} max={max} label={`${count} sessões`} />
        </div>
      ))}
    </div>
  );
}

/** Tabela de medidas corporais. */
function MeasurementsTable({ measurements }: { measurements: BodyMeasurement[] }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>Data</th>
            <th>Peso</th>
            <th>Gordura</th>
            <th>Cintura</th>
            <th>Peito</th>
            <th>Braço</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m) => (
            <tr key={m.id}>
              <td>{formatDate(m.measured_at)}</td>
              <td>{m.weight_kg ? `${formatDecimal(m.weight_kg)} kg` : '—'}</td>
              <td>{m.body_fat_percentage ? `${formatDecimal(m.body_fat_percentage)}%` : '—'}</td>
              <td>{m.waist_cm ? `${formatDecimal(m.waist_cm)} cm` : '—'}</td>
              <td>{m.chest_cm ? `${formatDecimal(m.chest_cm)} cm` : '—'}</td>
              <td>{m.arm_cm ? `${formatDecimal(m.arm_cm)} cm` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
