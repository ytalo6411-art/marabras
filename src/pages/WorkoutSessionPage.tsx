import { t } from '@/i18n/runtime';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/useToast';
import { Alert, Button, Card, ConfirmDialog, SkeletonList } from '@/components/ui';
import { IconCheck, IconChevronLeft, IconTimer } from '@/components/icons';
import VideoPlayer from '@/components/VideoPlayer';
import { formatClock, formatNumber } from '@/utils/format';
import { completeSession, initialProgress, progressStorageKey, restoreProgress, saveSessionProgress, saveSet, sessionExercises, type SessionProgress, type SessionExercise } from '@/services/workoutSession';
import type { WorkoutSession, WorkoutSet } from '@/types/database';

type LocalSet = { reps: number | null; weight: number | null; done: boolean };
export default function WorkoutSessionPage() {
  const { id } = useParams<{id: string}>();
  const user = useAuthStore(s => s.user);
  const toast = useToast();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [items, setItems] = useState<SessionExercise[]>([]);
  const [sets, setSets] = useState<Record<string, LocalSet>>({});
  const [progress, setProgress] = useState<SessionProgress>(initialProgress);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmExit, setConfirmExit] = useState(false);
  const [now, setNow] = useState(()=>Date.now());
  const revision = useRef(0);
  const [syncAttempt,setSyncAttempt] = useState(0);
  const key = (exercise: string, n: number) => `${exercise}:${n}`;

  useEffect(() => {
    if (!id || !user) return;
    let active = true;
    setLoading(true); setError('');
    void (async () => {
      try {
        const {data: row, error: e} = await supabase.from('workout_sessions').select('*').eq('id',id).eq('user_id',user.id).maybeSingle();
        if (e) throw e;
        if (!row) throw new Error('Sessão não encontrada ou não pertence à sua conta.');
        let plan: SessionExercise[] = [];
        if (row.plan_id) {
          const {data, error: pe} = await supabase.from('workout_exercises').select('*, exercise:exercises(*)').eq('plan_id',row.plan_id).order('position');
          if (pe) throw pe;
          plan = (data ?? []) as SessionExercise[];
        }
        const exercises = sessionExercises(row.exercise_snapshot,plan);
        if (!exercises.length) throw new Error('Esta sessão não contém exercícios válidos.');
        const {data: records,error: se} = await supabase.from('workout_sets').select('*').eq('session_id',id);
        if (se) throw se;
        const restored: Record<string,LocalSet> = {};
        for (const item of exercises) for(let n=1;n<=item.sets;n++) {
          const saved = records?.find(r => r.exercise_id === item.exercise_id && r.set_number === n);
          restored[key(item.exercise_id,n)] = {reps: saved?.reps ?? null,weight: saved?.weight_kg ?? item.weight_kg,done: saved?.completed ?? false};
        }
        const p = restoreProgress(JSON.stringify(row.client_state ?? {}),exercises.length);
        if (active) {setSession(row);setItems(exercises);setSets(restored);setProgress(p);setLoading(false);}
      } catch { if(active) {setError('Não foi possível carregar a sessão. Verifique a conexão e se a migração V10 foi aplicada.');setLoading(false);} }
    })();
    return () => {active=false;};
  },[id,user]);

  useEffect(() => {
    if (!id || !user || loading || session?.status !== 'in_progress') return;
    try {localStorage.setItem(progressStorageKey(user.id,id),JSON.stringify(progress));} catch { /* Nonessential mirror. */ }
    let retry: number | undefined;
    const timer = window.setTimeout(() => {void saveSessionProgress(id,user.id,progress).then(()=>setError(previous=>previous.startsWith('Progresso salvo')?'':previous)).catch(() => {setError('Progresso salvo neste dispositivo; a sincronização será tentada novamente.');retry=window.setTimeout(()=>setSyncAttempt(n=>n+1),5000);});},350);
    return () => {clearTimeout(timer);if(retry)clearTimeout(retry);};
  },[progress,id,user,loading,session?.status,syncAttempt]);
  useEffect(() => {const timer=setInterval(() => setNow(Date.now()),500);return () => clearInterval(timer);},[]);
  const current = items[Math.min(progress.current,items.length-1)];
  const remaining = progress.restUntil === null ? 0 : progress.paused ? progress.remaining : Math.max(0,Math.ceil((progress.restUntil-now)/1000));
  const completed = Object.values(sets).filter(s => s.done && (s.reps ?? 0)>0);
  const volume = completed.reduce((sum,s) => sum+(s.reps ?? 0)*(s.weight ?? 0),0);
  const update = (n:number,patch:Partial<LocalSet>) => {revision.current++;if(current)setSets(s => ({...s,[key(current.exercise_id,n)]:{...s[key(current.exercise_id,n)]!,...patch}}));};
  const navigate = (index:number) => setProgress(p => ({...p,current:Math.max(0,Math.min(items.length-1,index))}));
  const startRest = () => {const seconds=current?.rest_seconds ?? 90;setNow(Date.now());setProgress(p => ({...p,paused:false,remaining:seconds,restUntil:Date.now()+seconds*1000}));};
  function togglePause() {setProgress(p => p.paused ? {...p,paused:false,restUntil:Date.now()+p.remaining*1000} : {...p,paused:true,remaining:Math.max(0,Math.ceil(((p.restUntil ?? Date.now())-Date.now())/1000)),restUntil:null});}
  async function record(n:number) {
    if(!current || !id || busy) return;
    const set = sets[key(current.exercise_id,n)];
    if(!set) return;
    const reps=set.reps ?? parseInt(current.reps,10);
    if(!set.done && (!Number.isInteger(reps) || reps<1 || reps>1000 || (set.weight !== null && (!Number.isFinite(set.weight) || set.weight<0)))) {setError('Informe de 1 a 1000 repetições e uma carga válida antes de concluir.');return;}
    setBusy(true);setError('');const token=revision.current;
    try {
      const payload: Omit<WorkoutSet,'id'|'created_at'> & {id?:string} = {session_id:id,exercise_id:current.exercise_id,set_number:n,reps:Number.isFinite(reps)?reps:null,weight_kg:set.weight,duration_seconds:current.duration_seconds,rir:null,completed:!set.done};
      await saveSet(payload);
      if(token===revision.current) update(n,{done:!set.done,reps:payload.reps});
      if(!set.done) startRest();
      toast.show(set.done?'Série desmarcada e salva.':'Série salva. Bom descanso!','success');
    } catch {setError('A série não foi salva. Sua edição foi mantida; tente novamente.');}
    finally {setBusy(false);}
  }
  async function finish() {
    if(!id || !completed.length || busy) return;
    setBusy(true);setError('');
    try {await saveSessionProgress(id,user!.id,progress);const result=await completeSession(id);setSession(result);toast.show('Treino concluído e salvo!','success');}
    catch {setError('Não foi possível concluir. As séries continuam salvas. Aplique a migração V10 se necessário e tente novamente.');}
    finally {setBusy(false);}
  }
  if(loading)return <SkeletonList count={3} height={150}/>;
  if(!session || !items.length || !current)return <><Alert variant="error">{error || 'Sessão indisponível.'}</Alert><Link className="btn btn-secondary" to="/app/workouts">Voltar aos treinos</Link></>;
  if(session.status==='completed')return <Card className="session-summary"><span className="eyebrow">SESSÃO SALVA</span><h1 className="page-title">Treino concluído!</h1><p className="text-muted">Seu histórico foi atualizado com as séries que você concluiu e salvou.</p><div className="metric-grid"><div><strong>{completed.length}</strong><span>séries concluídas</span></div><div><strong>{formatClock(session.duration_seconds ?? 0)}</strong><span>tempo total</span></div><div><strong>{formatNumber(session.total_volume_kg)} kg</strong><span>volume com carga</span></div></div><div className="row row-wrap"><Link className="btn btn-primary" to="/app">Ir para o painel</Link><Link className="btn btn-secondary" to="/app/progress">Ver evolução</Link></div></Card>;
  return <div className="stack stack-4">
    <div className="row-between"><div><span className="eyebrow">Exercício {progress.current+1} de {items.length}</span><h1 className="page-title">{t(current.exercise?.name ?? '')}</h1></div><Button variant="ghost" onClick={()=>setConfirmExit(true)}>Sair</Button></div>
    {error && <Alert variant="error">{error}</Alert>}
    <div className="session-grid">
      <div className="stack stack-4"><VideoPlayer src={current.exercise?.video_url} poster={current.exercise?.thumbnail_url ?? current.exercise?.image_url} title={t(current.exercise?.name ?? 'Exercício')}/><Card><h2 className="card-title">Como executar</h2><p className="text-muted" style={{whiteSpace:'pre-line'}}>{t(current.exercise?.instructions || 'Consulte a ficha do exercício antes de executar.')}</p><Link to={`/app/exercises/${current.exercise_id}`} className="text-sm">Ver músculos, equipamentos e alternativas</Link></Card></div>
      <div className="stack stack-4">
        <Card className="rest-card"><div className="row-between"><span className="row"><IconTimer size={20}/>Descanso</span><strong className="mono" role="timer" aria-label="Tempo de descanso">{formatClock(remaining)}</strong></div><div className="row row-wrap"><Button variant="secondary" onClick={progress.restUntil || progress.paused?togglePause:startRest}>{progress.paused?'Retomar':progress.restUntil?'Pausar':'Iniciar descanso'}</Button><Button variant="ghost" onClick={()=>setProgress(p=>({...p,restUntil:null,paused:false,remaining:0}))}>Pular descanso</Button></div></Card>
        <Card><div className="card-header"><h2 className="card-title">Suas séries</h2><span className="badge">{current.sets} × {current.reps}</span></div><p className="text-sm text-muted">Registre o que realizou. A carga é opcional para exercícios com peso do corpo.</p><div className="stack stack-3">{Array.from({length:current.sets},(_,i)=>i+1).map(n=>{const s=sets[key(current.exercise_id,n)];return <div className="set-row" key={n}><strong aria-label={`Série ${n}`}>{n}</strong><label>Repetições<input aria-label={`Repetições da série ${n}`} type="number" min={1} max={1000} inputMode="numeric" value={s?.reps ?? ''} placeholder={current.reps} disabled={busy || s?.done} onChange={e=>update(n,{reps:e.target.value===''?null:Number(e.target.value)})}/></label><label>Carga (kg)<input aria-label={`Carga da série ${n}`} type="number" min={0} step={0.5} inputMode="decimal" value={s?.weight ?? ''} placeholder="0" disabled={busy || s?.done} onChange={e=>update(n,{weight:e.target.value===''?null:Number(e.target.value)})}/></label><Button variant={s?.done?'secondary':'primary'} loading={busy} onClick={()=>void record(n)} aria-label={`${s?.done?'Desmarcar':'Concluir'} série ${n}`}><IconCheck size={18}/><span>{s?.done?'Feita':'Concluir'}</span></Button></div>;})}</div></Card>
        <div className="row-between"><Button variant="secondary" disabled={progress.current===0} onClick={()=>navigate(progress.current-1)}><IconChevronLeft size={16}/>Anterior</Button><Button variant="secondary" disabled={progress.current===items.length-1} onClick={()=>navigate(progress.current+1)}>Próximo</Button></div>
        <Card><span className="eyebrow">A SEGUIR</span><strong>{t(items[progress.current+1]?.exercise?.name ?? '').trim() || 'Último exercício — revise suas séries'}</strong></Card>
        <p className="text-sm text-muted">{completed.length} séries salvas · {formatNumber(volume)} kg de volume</p><Button block size="lg" disabled={!completed.length} loading={busy} onClick={()=>void finish()}>Encerrar e salvar</Button>{!completed.length&&<p className="field-hint">Conclua pelo menos uma série para encerrar. Iniciar o treino não conta como conclusão.</p>}
      </div>
    </div>
    <ConfirmDialog open={confirmExit} title="Sair da sessão?" message="As séries já salvas serão mantidas. Você poderá retomar este treino depois." confirmLabel="Salvar posição e sair" onConfirm={()=>{void saveSessionProgress(session.id,user!.id,progress).then(()=>{window.location.assign('/app/workouts');}).catch(()=>setError('Não foi possível sincronizar. Tente sair novamente.'));}} onCancel={()=>setConfirmExit(false)}/>
  </div>;
}
