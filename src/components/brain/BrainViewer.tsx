'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useState, type ReactNode } from 'react';
import { RotateCcw, Pause, Play, Layers, Box } from 'lucide-react';
import type { Region } from '@/types/neuro';
import { regionKeys, regions } from '@/lib/brainRegions';
import BrainFallback from './BrainFallback';
const Scene = dynamic(() => import('./BrainScene'), {
  ssr: false,
  loading: () => <BrainFallback />,
});
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? (
      <BrainFallback message="Не удалось открыть 3D. Доступна 2D-иллюстрация." />
    ) : (
      this.props.children
    );
  }
}
export default function BrainViewer({
  selected = null,
  onSelect,
  hero = false,
}: {
  selected?: Region | null;
  onSelect?: (r: Region) => void;
  hero?: boolean;
}) {
  const [resetKey, setResetKey] = useState(0),
    [rotating, setRotating] = useState(true),
    [surface, setSurface] = useState(true),
    [reduced, setReduced] = useState(false),
    [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  const onLoaded = useCallback(() => setLoaded(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const [localSelected, setLocalSelected] = useState<Region | null>(null);
  const effectiveSelected = onSelect ? selected : localSelected;
  const select = (r: Region) => {
    setLocalSelected(r);
    onSelect?.(r);
  };
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduced(q.matches);
      if (q.matches) setRotating(false);
    };
    sync();
    q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);
  return (
    <div
      className={`brain-stage ${hero ? 'hero-stage' : ''}`}
      data-testid="brain-viewer"
      onPointerDown={() => setRotating(false)}
    >
      <div className="stage-orbit orbit-one" />
      <div className="stage-orbit orbit-two" />
      <div className="stage-grid" />
      <div className="stage-top">
        <span>
          <i className="status-dot" /> ANATOMICAL REFERENCE
        </span>
        <span className="stage-tag">
          <Box size={12} /> 3D · GENERIC MODEL
        </span>
      </div>
      <SceneBoundary onFailure={onFailure}>
        <Scene
          selected={effectiveSelected}
          onSelect={select}
          resetKey={resetKey}
          rotating={rotating}
          surface={surface}
          reduced={reduced}
          onLoaded={onLoaded}
          onFailure={onFailure}
        />
      </SceneBoundary>
      {!loaded && !failed && (
        <div className="model-loading" role="status">
          Загрузка анатомии<span className="loading-dots">…</span>
        </div>
      )}
      {!onSelect && (
        <div className="preview-regions" aria-label="Иллюстративные области мозга">
          {regionKeys.map((r) => (
            <button
              key={r}
              aria-pressed={effectiveSelected === r}
              className={effectiveSelected === r ? 'selected' : ''}
              onClick={() => select(r)}
              title={regions[r].area}
            >
              <i style={{ background: regions[r].color }} />
              {regions[r].title}
            </button>
          ))}
        </div>
      )}
      <div className="stage-scale">
        <span>SUPERIOR</span>
        <i />
        <span>INFERIOR</span>
      </div>
      <div className="stage-footer">
        <span>Перетащите для вращения · прокрутите для масштаба</span>
        <div className="viewer-tools">
          <button
            title="Сбросить ракурс"
            aria-label="Сбросить ракурс"
            onClick={() => {
              setLocalSelected(null);
              setResetKey((k) => k + 1);
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            title={rotating ? 'Остановить вращение' : 'Включить вращение'}
            aria-label={rotating ? 'Остановить вращение' : 'Включить вращение'}
            onClick={() => setRotating((v) => !v)}
          >
            {rotating ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            title="Подсветка областей"
            aria-label="Подсветка областей"
            aria-pressed={surface}
            onClick={() => setSurface((v) => !v)}
            className={surface ? 'active' : ''}
          >
            <Layers size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
