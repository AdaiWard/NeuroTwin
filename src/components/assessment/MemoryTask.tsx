'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Grid3X3 } from 'lucide-react';
import { emptyMemoryState, memoryReducer } from '@/lib/tasks';
import type { MemoryRound } from '@/types/neuro';
type Phase = 'idle' | 'playback' | 'input' | 'feedback' | 'done';
export default function MemoryTask({
  onComplete,
}: {
  onComplete: (rounds: MemoryRound[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle'),
    [active, setActive] = useState<number | null>(null),
    [entered, setEntered] = useState(0),
    [rounds, setRounds] = useState<MemoryRound[]>([]),
    [sequenceLength, setSequenceLength] = useState(3);
  const sequence = useRef<number[]>([]),
    input = useRef<number[]>([]),
    run = useRef(emptyMemoryState()),
    livePhase = useRef<Phase>('idle'),
    liveRounds = useRef<MemoryRound[]>([]),
    timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const updatePhase = useCallback((v: Phase) => {
    livePhase.current = v;
    setPhase(v);
  }, []);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clear, [clear]);
  const later = (f: () => void, ms: number) => {
    timers.current.push(setTimeout(f, ms));
  };
  const start = () => {
    clear();
    input.current = [];
    setEntered(0);
    setActive(null);
    updatePhase('playback');
    sequence.current = Array.from({ length: 3 + liveRounds.current.length }, () =>
      Math.floor(Math.random() * 9),
    );
    setSequenceLength(sequence.current.length);
    run.current = memoryReducer(run.current, { type: 'start', sequence: sequence.current });
    sequence.current.forEach((tile, i) => {
      later(() => setActive(tile), 650 + i * 850);
      later(() => setActive(null), 1200 + i * 850);
    });
    later(
      () => {
        setActive(null);
        run.current = memoryReducer(run.current, { type: 'playbackEnd' });
        updatePhase('input');
      },
      650 + sequence.current.length * 850,
    );
  };
  const enter = useCallback(
    (tile: number) => {
      if (livePhase.current !== 'input' || input.current.length >= sequence.current.length) return;
      run.current = memoryReducer(run.current, { type: 'tile', tile });
      input.current = run.current.input;
      setEntered(input.current.length);
      if (run.current.result) {
        const result = run.current.result,
          all = [...liveRounds.current, result];
        liveRounds.current = all;
        setRounds(all);
        updatePhase(all.length === 5 ? 'done' : 'feedback');
      }
    },
    [updatePhase],
  );
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key) && !e.repeat && livePhase.current === 'input') {
        e.preventDefault();
        enter(Number(e.key) - 1);
      }
    };
    const hidden = () => {
      if (document.hidden && ['playback', 'input'].includes(livePhase.current)) {
        clear();
        setActive(null);
        input.current = [];
        run.current = emptyMemoryState();
        setEntered(0);
        updatePhase('idle');
      }
    };
    window.addEventListener('keydown', keydown);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('keydown', keydown);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [enter, clear, updatePhase]);
  const title =
    phase === 'playback'
      ? 'Запомните последовательность'
      : phase === 'input'
        ? `Ваша очередь · ${entered} / ${sequenceLength}`
        : phase === 'feedback'
          ? rounds.at(-1)?.complete
            ? 'Последовательность совпала'
            : 'Раунд завершён. Продолжим?'
          : phase === 'done'
            ? 'Все пять раундов завершены'
            : 'Сначала наблюдайте, затем повторите';
  return (
    <div className="task-content">
      <div className="task-heading">
        <div className="eyebrow">02 / VISUAL MEMORY</div>
        <h2>Сохраните последовательность.</h2>
        <p>
          Плитки загорятся по очереди. Повторите порядок кликами или клавишами 1–9 слева направо,
          сверху вниз. Длина растёт от 3 до 7.
        </p>
      </div>
      <div className="memory-status" aria-live="polite">
        <Grid3X3 size={18} />
        <strong>{title}</strong>
        <span>Раунд {Math.min(rounds.length + 1, 5)} / 5</span>
      </div>
      <div className="memory-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            aria-label={`Плитка ${i + 1}`}
            className={active === i && phase === 'playback' ? 'lit' : ''}
            disabled={phase !== 'input'}
            onClick={() => enter(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="sr-only" aria-live="assertive">
        {phase === 'playback' && active !== null ? `Плитка ${active + 1}` : ''}
      </div>
      <div className="memory-rounds">
        {rounds.map((r, i) => (
          <span key={i} className={r.complete ? 'correct' : ''}>
            {r.length} плиток · {r.correct}/{r.length}
          </span>
        ))}
      </div>
      <p className="task-note">
        Считаются все введённые позиции и максимальная полностью верная длина. Задание не измеряет
        память в целом.
      </p>
      <div className="task-bottom">
        <button
          className="text-link"
          onClick={() => {
            clear();
            liveRounds.current = [];
            setRounds([]);
            sequence.current = [];
            input.current = [];
            run.current = emptyMemoryState();
            setEntered(0);
            setActive(null);
            updatePhase('idle');
          }}
        >
          <RotateCcw size={16} /> Начать заново
        </button>
        {['idle', 'feedback'].includes(phase) && (
          <button className="button primary" onClick={start}>
            {phase === 'idle' ? 'Показать последовательность' : 'Следующий раунд'} →
          </button>
        )}
        {phase === 'done' && (
          <button className="button primary" onClick={() => onComplete(rounds)}>
            Сохранить результат →
          </button>
        )}
      </div>
    </div>
  );
}
