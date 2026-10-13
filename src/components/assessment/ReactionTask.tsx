'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { RotateCcw, Timer, MousePointer2 } from 'lucide-react';
import { reactionReducer, type ReactionState, type ReactionEvent } from '@/lib/tasks';
import { median } from '@/lib/scoring';
export default function ReactionTask({ onComplete }: { onComplete: (trials: number[]) => void }) {
  const [state, setState] = useState<ReactionState>({ phase: 'idle', trials: [] });
  const live = useRef(state),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    cueTime = useRef(0),
    frame = useRef(0);
  const transition = useCallback((event: ReactionEvent) => {
    live.current = reactionReducer(live.current, event);
    setState(live.current);
  }, []);
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
  }, []);
  useEffect(() => clear, [clear]);
  const start = useCallback(() => {
    clear();
    transition({ type: 'start' });
    timer.current = setTimeout(
      () => {
        frame.current = requestAnimationFrame(() => {
          if (live.current.phase !== 'waiting') return;
          flushSync(() => transition({ type: 'cue' }));
          cueTime.current = performance.now();
        });
      },
      1500 + Math.random() * 2500,
    );
  }, [clear, transition]);
  const hit = useCallback(() => {
    const phase = live.current.phase;
    if (phase === 'idle' || phase === 'early' || phase === 'result') {
      start();
      return;
    }
    if (phase === 'waiting') {
      clear();
      transition({ type: 'hit' });
    } else if (phase === 'ready') {
      const ms = performance.now() - cueTime.current;
      if (ms > 10000) {
        clear();
        live.current = { ...live.current, phase: 'early' };
        setState(live.current);
      } else transition({ type: 'hit', ms });
    }
  }, [start, clear, transition]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !e.repeat &&
        (e.target === document.body || (e.target as HTMLElement).closest('[data-reaction-pad]'))
      ) {
        e.preventDefault();
        hit();
      }
    };
    window.addEventListener('keydown', listener);
    const visibility = () => {
      if (document.hidden && ['waiting', 'ready'].includes(live.current.phase)) {
        clear();
        live.current = { ...live.current, phase: 'early' };
        setState(live.current);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', listener);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [hit, clear]);
  const texts = {
    idle: ['Готовы поймать момент?', 'Нажмите, чтобы начать'],
    waiting: ['Дождитесь зелёного сигнала', 'Пока не нажимайте'],
    ready: ['Сейчас!', 'Нажмите или используйте пробел'],
    early: ['Попробуем ещё раз', 'Ранний клик или пауза не учитываются'],
    result: [`${Math.round(state.trials.at(-1) ?? 0)} мс`, 'Нажмите для следующего сигнала'],
    done: ['Пять сигналов пойманы', 'Медиана — устойчивый итог задания'],
  };
  return (
    <div className="task-content">
      <div className="task-heading">
        <div className="eyebrow">01 / REACTION TIME</div>
        <h2>Поймайте момент.</h2>
        <p>
          Дождитесь смены цвета и нажмите на поле. Можно использовать пробел. Нужно пять корректных
          попыток.
        </p>
      </div>
      <button
        data-reaction-pad
        data-testid="reaction-pad"
        className={`reaction-pad ${state.phase}`}
        onClick={hit}
        disabled={state.phase === 'done'}
      >
        <span className="reaction-symbol">
          {state.phase === 'ready' ? <span className="ready-dot" /> : <MousePointer2 size={32} />}
        </span>
        <strong>{texts[state.phase][0]}</strong>
        <span>{texts[state.phase][1]}</span>
      </button>
      <div aria-live="polite" className="sr-only">
        {texts[state.phase].join('. ')}
      </div>
      <div className="trial-row">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={state.trials[i] ? 'completed' : ''}>
            <span>0{i + 1}</span>
            <strong>{state.trials[i] ? `${Math.round(state.trials[i])} мс` : '—'}</strong>
          </div>
        ))}
      </div>
      <p className="task-note">
        <Timer size={16} /> Задержка устройства, способ ввода и усталость влияют на время. Это не
        медицинское измерение.
      </p>
      <div className="task-bottom">
        <button
          className="text-link"
          onClick={() => {
            clear();
            transition({ type: 'reset' });
          }}
        >
          <RotateCcw size={16} /> Начать заново
        </button>
        {state.phase === 'done' && (
          <button className="button primary" onClick={() => onComplete(state.trials)}>
            Сохранить · {Math.round(median(state.trials) ?? 0)} мс →
          </button>
        )}
      </div>
    </div>
  );
}
