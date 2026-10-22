'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/lib/utils/formatters';

export type RestTimerState = 'idle' | 'running' | 'paused' | 'warning' | 'completed';

export interface RestTimerProps {
  /** Duración total en segundos */
  duration: number;
  /** Tiempo restante actual en segundos (controlado externamente si se pasa) */
  remaining?: number;
  /** Estado actual del timer */
  state?: RestTimerState;
  /** Etiqueta descriptiva */
  label?: string;
  /** Próximo ejercicio para mostrar contexto */
  nextExercise?: string;
  /** Configuración de descanso inteligente */
  smartSuggestion?: {
    seconds: number;
    reason: string;
  } | null;
  /** Callbacks */
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onSkip?: () => void;
  onExtend?: (seconds: number) => void;
  onEdit?: (newDuration: number) => void;
  onComplete?: () => void;
  onStateChange?: (state: RestTimerState) => void;
  /** Modo compacto para inline en ExerciseGroup */
  compact?: boolean;
  /** Tamaño del timer: 'sm' | 'md' | 'lg' | 'xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Si el timer debe auto-iniciar al montar */
  autoStart?: boolean;
  /** ID único para persistencia */
  timerId?: string;
}

const SIZE_CONFIG = {
  sm: { ringSize: 80, strokeWidth: 4, fontSize: 'text-2xl', iconSize: 20 },
  md: { ringSize: 120, strokeWidth: 6, fontSize: 'text-4xl', iconSize: 24 },
  lg: { ringSize: 180, strokeWidth: 8, fontSize: 'text-6xl', iconSize: 32 },
  xl: { ringSize: 280, strokeWidth: 10, fontSize: 'text-timer', iconSize: 40 },
} as const;

const STATE_COLORS: Record<RestTimerState, string> = {
  idle: 'var(--primary)',
  running: 'var(--primary)',
  paused: 'var(--accent-warning)',
  warning: 'var(--accent-warning)',
  completed: 'var(--accent-success)',
};

const WARNING_THRESHOLD = 5;

export function RestTimer({
  duration,
  remaining: controlledRemaining,
  state: controlledState,
  label = 'Descanso',
  nextExercise,
  smartSuggestion,
  onStart,
  onPause,
  onResume,
  onSkip,
  onExtend,
  onEdit,
  onComplete,
  onStateChange,
  compact = false,
  size = 'lg',
  autoStart = false,
}: RestTimerProps) {
  const { ringSize, strokeWidth, fontSize, iconSize } = SIZE_CONFIG[size];

  const [internalState, setInternalState] = useState<{
    remaining: number;
    state: RestTimerState;
    isUserPaused: boolean;
    progress: number;
  }>({
    remaining: controlledRemaining ?? duration,
    state: controlledState ?? (autoStart ? 'running' : 'idle'),
    isUserPaused: false,
    progress: 0,
  });
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const durationAdjustmentRef = useRef(0);
  const isMountedRef = useRef(true);
  const warningTriggeredRef = useRef(false);
  const autoStartNotifiedRef = useRef(false);
  const callbacksRef = useRef({ onStateChange, onComplete });

  const remaining = controlledRemaining ?? internalState.remaining;
  const state = controlledState ?? internalState.state;
  const isControlled = controlledRemaining !== undefined || controlledState !== undefined;
  const timerIsActive = !isControlled && (state === 'running' || state === 'warning');
  const isPaused = state === 'paused';
  const remainingRef = useRef(remaining);
  const stopTimer = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, []);

  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = isControlled
    ? duration <= 0 ? 0 : Math.max(0, Math.min(1, 1 - remaining / duration))
    : internalState.progress;

  const isWarning = timerIsActive && remaining <= WARNING_THRESHOLD && remaining > 0;
  const currentColor = STATE_COLORS[isWarning ? 'warning' : state];
  const suggestionKey = smartSuggestion
    ? `${smartSuggestion.seconds}:${smartSuggestion.reason}`
    : null;
  const isSuggestionDismissed = suggestionKey !== null && dismissedSuggestionKey === suggestionKey;

  useEffect(() => {
    callbacksRef.current = { onStateChange, onComplete };
  }, [onStateChange, onComplete]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    if (!isMountedRef.current) return;

    const runTimer = () => {
      if (!timerIsActive) return;
      const now = Date.now();
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000 + pausedTimeRef.current;
      const adjustedDuration = duration + durationAdjustmentRef.current;
      const newRemaining = Math.max(0, adjustedDuration - elapsed);

      setInternalState(prev => ({ ...prev, remaining: newRemaining, progress: Math.max(0, Math.min(1, 1 - newRemaining / adjustedDuration)) }));

      if (newRemaining <= WARNING_THRESHOLD && newRemaining > 0 && !warningTriggeredRef.current) {
        warningTriggeredRef.current = true;
        setInternalState(prev => ({ ...prev, state: 'warning' }));
        callbacksRef.current.onStateChange?.('warning');
      }

      if (newRemaining <= 0) {
        stopTimer();
        setInternalState(prev => ({ ...prev, state: 'completed', remaining: 0, progress: 1 }));
        callbacksRef.current.onStateChange?.('completed');
        callbacksRef.current.onComplete?.();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(runTimer);
    };

    if (timerIsActive) {
      startTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(runTimer);
    } else {
      if (isPaused) pausedTimeRef.current = duration + durationAdjustmentRef.current - remainingRef.current;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }

    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [timerIsActive, isPaused, duration, stopTimer]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, []);

  useEffect(() => {
    if (!autoStart || isControlled || state !== 'running' || autoStartNotifiedRef.current) return;
    autoStartNotifiedRef.current = true;
    onStateChange?.('running');
    onStart?.();
  }, [autoStart, isControlled, state, onStart, onStateChange]);

  const handleStart = useCallback(() => {
    if (state === 'idle' || state === 'paused' || state === 'completed') {
      if (state === 'completed') {
        durationAdjustmentRef.current = 0;
        pausedTimeRef.current = 0;
        startTimeRef.current = null;
        setInternalState(prev => ({ ...prev, remaining: duration, progress: 0 }));
      }
      warningTriggeredRef.current = false;
      setInternalState(prev => ({ ...prev, state: 'running', isUserPaused: false }));
      onStateChange?.('running');
      onStart?.();
    }
  }, [state, duration, onStart, onStateChange]);

  const handlePause = useCallback(() => {
    if (state === 'running' || state === 'warning') {
      setInternalState(prev => ({ ...prev, state: 'paused', isUserPaused: true }));
      onStateChange?.('paused');
      onPause?.();
    }
  }, [state, onPause, onStateChange]);

  const handleResume = useCallback(() => {
    if (state === 'paused') {
      setInternalState(prev => ({ ...prev, state: 'running', isUserPaused: false }));
      onStateChange?.('running');
      onResume?.();
    }
  }, [state, onResume, onStateChange]);

  const handleSkip = useCallback(() => {
    stopTimer();
    setInternalState(prev => ({ ...prev, state: 'completed', remaining: 0, progress: 1 }));
    onStateChange?.('completed');
    onSkip?.();
    onComplete?.();
  }, [onSkip, onComplete, onStateChange, stopTimer]);

  const handleExtend = useCallback((seconds: number) => {
    const newRemaining = remaining + seconds;
    durationAdjustmentRef.current += seconds;
    const adjustedDuration = duration + durationAdjustmentRef.current;
    setInternalState(prev => ({
      ...prev,
      remaining: newRemaining,
      progress: Math.max(0, Math.min(1, 1 - newRemaining / adjustedDuration)),
    }));
    onExtend?.(seconds);
  }, [remaining, duration, onExtend]);

  const handleEdit = useCallback((newDuration: number) => {
    if (state === 'running') handlePause();
    durationAdjustmentRef.current = newDuration - duration;
    setInternalState(prev => ({ ...prev, remaining: newDuration, progress: 0 }));
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
    onEdit?.(newDuration);
  }, [state, duration, handlePause, onEdit]);

  const handleSmartApply = useCallback(() => {
    if (smartSuggestion) {
      handleExtend(smartSuggestion.seconds);
      setDismissedSuggestionKey(`${smartSuggestion.seconds}:${smartSuggestion.reason}`);
    }
  }, [smartSuggestion, handleExtend]);

  if (compact) return <RestTimerCompact {...{ remaining, state, progress, currentColor, label, nextExercise, smartSuggestion, onStart: handleStart, onPause: handlePause, onResume: handleResume, onSkip: handleSkip, onExtend: handleExtend, onSmartApply: handleSmartApply }} />;

  return (
    <div className="rest-timer w-full max-w-xl mx-auto" role="timer" aria-live="polite" aria-label={`${label}: ${formatTime(remaining)} restantes`}>
      <div className="relative flex flex-col items-center gap-5 sm:gap-6">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="transform -rotate-90" aria-hidden="true">
            <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="var(--border-subtle)" strokeWidth={strokeWidth} fill="none" className="transition-opacity duration-300" opacity={state === 'idle' ? 0.8 : 0.35} />
            <motion.circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke={currentColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference * (1 - progress) }} transition={state === 'running' ? { duration: 1, ease: 'linear' } : { duration: 0.3, ease: 'easeOut' }} style={{ filter: state === 'running' ? 'drop-shadow(0 0 10px color-mix(in srgb, var(--primary) 45%, transparent))' : 'none' }} />
            <AnimatePresence mode="wait">{isWarning && <motion.circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke={currentColor} strokeWidth={strokeWidth * 1.5} fill="none" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference, opacity: 0.6 }} animate={{ strokeDashoffset: circumference * (1 - progress), opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="pointer-events-none" />}</AnimatePresence>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className={`font-mono tabular-nums ${fontSize} font-semibold tracking-tight`} key={remaining} initial={false} animate={{ scale: isWarning ? 1.05 : 1 }} transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0, ease: 'easeInOut' }}>{formatTime(remaining)}</motion.span>
            {state === 'completed' && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-success)' }}>¡Listo!</motion.span>}
            {state === 'idle' && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Toca para iniciar</motion.span>}
          </div>
        </div>

        <div className="px-4 text-center">
          <p className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{label}</p>
          {nextExercise && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Próximo: {nextExercise}</motion.p>}
        </div>

        <AnimatePresence mode="wait">{smartSuggestion && state !== 'completed' && !isSuggestionDismissed && <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} className="w-full max-w-sm px-1 sm:px-0"><div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-left" role="status" aria-live="polite"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500" aria-hidden="true">✦</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Descanso sugerido <span className="text-emerald-500">+{smartSuggestion.seconds}s</span></p><p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{smartSuggestion.reason}</p></div><button onClick={handleSmartApply} className="flex-shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label={`Aplicar sugerencia de ${smartSuggestion.seconds} segundos`}>Aplicar</button><button onClick={() => suggestionKey && setDismissedSuggestionKey(suggestionKey)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Descartar sugerencia">×</button></div></motion.div>}</AnimatePresence>

        <div className="flex flex-wrap items-center justify-center gap-2 px-2 sm:gap-3 sm:px-4">
          {state === 'idle' && <button onClick={handleStart} className="btn-primary px-6 py-3 text-base font-medium gap-2" style={{ minWidth: 160 }} aria-label="Iniciar descanso"><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Iniciar</button>}
          {state === 'running' && <> <button onClick={() => handleExtend(-10)} disabled={remaining <= 10} className="btn-secondary px-4 py-2" aria-label="Restar 10 segundos" aria-disabled={remaining <= 10}>−10s</button> <button onClick={handlePause} className="btn-primary px-6 py-3 text-base font-medium gap-2" style={{ minWidth: 140 }} aria-label="Pausar descanso"><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pausa</button> <button onClick={() => handleExtend(30)} className="btn-secondary px-4 py-2 font-medium" aria-label="Añadir 30 segundos">+30s</button> </>}
          {state === 'paused' && <> <button onClick={handleResume} className="btn-primary px-6 py-3 text-base font-medium gap-2" style={{ minWidth: 140 }} aria-label="Reanudar descanso"><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Reanudar</button> <button onClick={() => handleEdit(duration)} className="btn-secondary px-4 py-2" aria-label="Reiniciar temporizador">Reiniciar</button> <button onClick={() => handleEdit(Math.max(10, remaining))} className="btn-secondary px-4 py-2" aria-label="Editar tiempo">✎ Editar</button> </>}
          {state === 'warning' && <><button onClick={handlePause} className="btn-secondary px-4 py-2" aria-label="Pausar descanso">Pausa</button><button onClick={() => handleExtend(30)} className="btn-warning px-5 py-2 font-medium gap-1" style={{ background: 'var(--accent-warning)', color: 'var(--text-inverse)' }} aria-label="Extender descanso 30 segundos"><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>Extender</button></>}
          {state === 'completed' && <button onClick={handleStart} className="btn-primary px-6 py-3 text-base font-medium gap-2" style={{ minWidth: 180 }} aria-label="Iniciar siguiente serie"><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 18l8-6-8-6v12zm10 0l8-6-8-6v12z"/></svg>Siguiente serie</button>}
          {(state === 'running' || state === 'paused' || state === 'warning') && <button onClick={handleSkip} className="btn-ghost px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }} aria-label="Saltar descanso">Saltar</button>}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 pt-4">
          <button onClick={() => handleEdit(duration)} className="btn-ghost gap-2 rounded-xl px-4 py-2 text-sm" aria-label="Editar duración del descanso"><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar</button>
          {smartSuggestion && state !== 'completed' && <button onClick={handleSmartApply} className="btn-ghost text-sm gap-1" style={{ color: 'var(--accent-info)' }} aria-label={`Aplicar sugerencia inteligente: +${smartSuggestion.seconds}s`}><svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 10V5L10 2l-4 4v5H3v2h2v5h2V7h5V5z"/></svg>Aplicar IA</button>}
        </div>
      </div>
      <style jsx>{`
        .rest-timer { --ring-size: ${ringSize}px; }
        .btn-primary { display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-xl); font-weight:600; transition:all var(--transition-fast); background:var(--accent-primary); color:var(--text-inverse); border:none; cursor:pointer; touch-action:manipulation; } .btn-primary:active{transform:scale(0.96)} .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
        .btn-secondary { display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-lg); font-weight:500; transition:all var(--transition-fast); background:var(--bg-elevated); color:var(--text-primary); border:1px solid var(--border-subtle); cursor:pointer; touch-action:manipulation; } .btn-secondary:active{transform:scale(0.96)} .btn-secondary:disabled{opacity:0.4;cursor:not-allowed}
        .btn-warning { display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-lg); font-weight:600; transition:all var(--transition-fast); border:none; cursor:pointer; touch-action:manipulation; } .btn-warning:active{transform:scale(0.96)}
        .btn-ghost { display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-lg); font-weight:500; transition:all var(--transition-fast); background:transparent; border:none; cursor:pointer; touch-action:manipulation; } .btn-ghost:hover{background:var(--bg-input)}
      `}</style>
    </div>
  );
}

interface RestTimerCompactProps {
  remaining: number;
  state: RestTimerState;
  progress: number;
  currentColor: string;
  label: string;
  nextExercise?: string;
  smartSuggestion?: RestTimerProps['smartSuggestion'];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onExtend: (seconds: number) => void;
  onSmartApply: () => void;
}

function RestTimerCompact({
  remaining,
  state,
  progress,
  currentColor,
  label,
  nextExercise,
  smartSuggestion,
  onStart,
  onPause,
  onResume,
  onSkip,
  onExtend,
  onSmartApply,
}: RestTimerCompactProps) {
  const isWarning = (state === 'running' || state === 'warning') && remaining <= WARNING_THRESHOLD && remaining > 0;
  return (
    <div className="rest-timer-compact w-full p-3" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-xl)' }} role="timer" aria-live="polite" aria-label={`${label}: ${formatTime(remaining)}`}>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
          <svg width={56} height={56} className="transform -rotate-90" aria-hidden="true">
            <circle cx={28} cy={28} r={24} stroke="var(--border-subtle)" strokeWidth={4} fill="none" opacity={0.3} />
            <motion.circle cx={28} cy={28} r={24} stroke={currentColor} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={2*Math.PI*24} initial={{ strokeDashoffset: 2*Math.PI*24 }} animate={{ strokeDashoffset: 2*Math.PI*24*(1-progress) }} transition={state==='running'?{duration:1,ease:'linear'}:{duration:0.3}} style={{filter:state==='running'?'drop-shadow(0 0 6px currentColor)':'none'}} />
            {isWarning && <motion.circle cx={28} cy={28} r={24} stroke={currentColor} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={2*Math.PI*24} initial={{strokeDashoffset:2*Math.PI*24,opacity:0.5}} animate={{strokeDashoffset:2*Math.PI*24*(1-progress),opacity:0}} transition={{duration:1,repeat:Infinity,ease:'linear'}} />}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"><span className={`font-mono tabular-nums text-lg font-semibold ${state==='completed'?'text-accent-success':''}`}>{formatTime(remaining)}</span></div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div><p className="text-sm font-medium truncate" style={{color:'var(--text-primary)'}}>{label}</p>{nextExercise&&<p className="text-xs truncate" style={{color:'var(--text-muted)'}}>→ {nextExercise}</p>}</div>
            <div className="flex items-center gap-1">
              {state==='idle'&&<button onClick={onStart} className="btn-primary px-3 py-1.5 text-xs gap-1" aria-label="Iniciar"><svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Iniciar</button>}
              {state==='running'&&<><button onClick={onPause} className="btn-primary px-3 py-1.5 text-xs gap-1" aria-label="Pausar"><svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pausa</button><button onClick={()=>onExtend(30)} className="btn-secondary px-2 py-1.5 text-xs" aria-label="+30s">+30s</button></>}
              {state==='paused'&&<button onClick={onResume} className="btn-primary px-3 py-1.5 text-xs gap-1" aria-label="Reanudar"><svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Continuar</button>}
              {state==='warning'&&<><button onClick={onPause} className="btn-primary px-3 py-1.5 text-xs gap-1" aria-label="Pausar"><svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pausa</button><button onClick={()=>onExtend(30)} className="btn-warning px-3 py-1.5 text-xs gap-1" style={{background:'var(--accent-warning)',color:'var(--text-inverse)'}} aria-label="Extender"><svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>+30s</button></>}
              {state==='completed'&&<button onClick={onStart} className="btn-primary px-3 py-1.5 text-xs gap-1" aria-label="Siguiente"><svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8-6-8-6v12zm10 0l8-6-8-6v12z"/></svg>Siguiente</button>}
              {(state==='running'||state==='paused'||state==='warning')&&<button onClick={onSkip} className="btn-ghost px-2 py-1.5 text-xs" style={{color:'var(--text-muted)'}} aria-label="Saltar">Saltar</button>}
            </div>
          </div>
          {smartSuggestion&&state!=='completed'&&<button onClick={onSmartApply} className="w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-1" style={{backgroundColor:'color-mix(in srgb, var(--accent-info) 10%, transparent)',border:'1px solid',borderColor:'var(--accent-info)',color:'var(--accent-info)'}} aria-label={`Aplicar +${smartSuggestion.seconds}s: ${smartSuggestion.reason}`}><span>⚡</span><span>+{smartSuggestion.seconds}s</span><span className="flex-1 truncate">{smartSuggestion.reason}</span><span className="font-medium">Aplicar</span></button>}
        </div>
      </div>
    </div>
  );
}

export default RestTimer;