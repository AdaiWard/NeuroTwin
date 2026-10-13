'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  ArrowRight,
  Download,
  Focus,
  Layers,
  Sparkles,
  Wind,
  ChevronRight,
  Info,
  Timer,
  Grid3X3,
  Lightbulb,
  Plus,
  FlaskConical,
} from 'lucide-react';
import { useNeuroStore } from '@/store/useNeuroStore';
import { regions, regionKeys } from '@/lib/brainRegions';
import { median, memoryEvidence, rating, reactionIndex } from '@/lib/scoring';
import { recommendations } from '@/lib/recommendations';
import { demoSession } from '@/lib/demo';
import type { Region, Session } from '@/types/neuro';
import BrainViewer from '@/components/brain/BrainViewer';
import Disclaimer from '@/components/Disclaimer';
import HistoryChart from '@/components/dashboard/HistoryChart';
const icons = { attention: Focus, memory: Layers, executive: Sparkles, stress: Wind };
function DashboardContent() {
  const query = useSearchParams(),
    store = useNeuroStore();
  const [sessionId, setSessionId] = useState<string | null>(null),
    [selected, setSelected] = useState<Region>('attention'),
    [exported, setExported] = useState(false);
  const isDemo = sessionId === 'demo' || (sessionId === null && query.get('demo') === '1');
  const session: Session | undefined = isDemo
    ? demoSession
    : (store.sessions.find((s) => s.id === sessionId) ?? store.sessions[0]);
  const exportData = () => {
    if (!session) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...session,
            notice:
              'Illustrative heuristic indices; not clinically validated; generic anatomy, not a brain scan.',
            scoringVersion: '1.0',
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = `neurotwin-${session.demo ? 'demo' : session.id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  };
  if (!store.hydrated)
    return (
      <div className="page-container skeleton-page" role="status">
        Открываем ваш профиль…
      </div>
    );
  if (!session || Object.values(session.scores).every((v) => v === null))
    return (
      <div id="content" className="page-container empty-dashboard">
        <div className="eyebrow">A NEW PERSPECTIVE AWAITS</div>
        <h1>
          Ваш профиль
          <br />
          начинается с <em>любопытства.</em>
        </h1>
        <p>
          {session
            ? 'В этой сессии все наблюдения пропущены: рассчитывать индексы не из чего. Можно добавить ответы в новом исследовании или изучить демо.'
            : 'Пройдите короткое исследование, чтобы здесь появились ваши ответы и результаты. Или изучите явно обозначенный демо-профиль.'}
        </p>
        <div className="hero-actions">
          <Link href="/assessment" className="button primary">
            Начать исследование <ArrowRight size={18} />
          </Link>
          <button className="button secondary" onClick={() => setSessionId('demo')}>
            Открыть демо
          </button>
          {store.sessions.find((s) => Object.values(s.scores).some((v) => v !== null)) && (
            <button
              className="text-link"
              onClick={() =>
                setSessionId(
                  store.sessions.find((s) => Object.values(s.scores).some((v) => v !== null))!.id,
                )
              }
            >
              Предыдущий профиль <ArrowRight size={16} />
            </button>
          )}
        </div>
        <BrainViewer hero />
        <Disclaimer />
      </div>
    );
  const info = regions[selected],
    score = session.scores[selected],
    evidence = memoryEvidence(session.memory),
    rt = median(session.reaction),
    tips = recommendations(session.intake);
  return (
    <div id="content" className="dashboard page-container">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">YOUR MIND, IN PERSPECTIVE</div>
          <h1>
            Когнитивный <em>профиль.</em>
          </h1>
          <p>
            {session.demo
              ? 'Демонстрационные ответы и результаты · не ваши данные'
              : `Ваше наблюдение · ${new Date(session.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="button secondary" onClick={exportData}>
            <Download size={16} />
            {exported ? 'Экспортировать ещё' : 'Экспорт JSON'}
          </button>
          <Link className="button primary" href="/assessment">
            <Plus size={17} /> Новое исследование
          </Link>
        </div>
      </div>
      <div className="session-toolbar">
        <div>
          <span className={`pill ${isDemo ? 'demo-pill' : ''}`}>
            {isDemo ? (
              <>
                <FlaskConical size={13} /> DEMO PROFILE
              </>
            ) : (
              'LOCAL PROFILE'
            )}
          </span>
          <span className="toolbar-note">Иллюстративные индексы · 0–100</span>
        </div>
        <label>
          Сессия{' '}
          <select
            aria-label="Выбрать сессию"
            value={session.id}
            onChange={(e) => {
              setSessionId(e.target.value);
              setExported(false);
            }}
          >
            <option value="demo">Демо · пример</option>
            {store.sessions.map((s, i) => (
              <option key={s.id} value={s.id}>
                {i === 0 ? 'Последняя · ' : ''}
                {new Date(s.createdAt).toLocaleString('ru-RU')}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="score-grid">
        {regionKeys.map((r) => {
          const Icon = icons[r],
            value = session.scores[r];
          return (
            <button
              key={r}
              className={`score-card ${selected === r ? 'selected' : ''}`}
              aria-pressed={selected === r}
              style={{ '--region-color': regions[r].color } as React.CSSProperties}
              onClick={() => setSelected(r)}
            >
              <div className="score-label">
                <Icon size={18} />
                <span>{regions[r].title}</span>
                <ArrowUpRight size={15} />
              </div>
              <div className="score-value">
                {value ?? '—'}
                <span>{value === null ? 'нет данных' : '/ 100'}</span>
              </div>
              <div className="score-track">
                <i style={{ width: `${value ?? 0}%` }} />
              </div>
              <span className="score-caption">
                {r === 'stress'
                  ? 'Сообщённая нагрузка · больше = выше'
                  : r === 'executive'
                    ? 'Иллюстративный композит'
                    : 'Демонстрационный индекс'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="brain-workspace">
        <div className="dashboard-viewer">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">THE ANATOMICAL VIEW</span>
              <h2>Исследуйте связи.</h2>
            </div>
            <span className="subtle-badge">Общая модель мозга</span>
          </div>
          <BrainViewer selected={selected} onSelect={setSelected} />
          <div className="region-legend">
            {regionKeys.map((r) => (
              <button
                key={r}
                aria-pressed={selected === r}
                className={selected === r ? 'selected' : ''}
                onClick={() => setSelected(r)}
              >
                <i style={{ background: regions[r].color }} />
                {regions[r].title}
              </button>
            ))}
          </div>
        </div>
        <aside
          className="region-panel"
          style={{ '--region-color': info.color } as React.CSSProperties}
        >
          <div className="eyebrow">ILLUSTRATIVE ASSOCIATION</div>
          <div className="region-detail-title">
            <span className="region-icon">
              {(() => {
                const Icon = icons[selected];
                return <Icon size={25} />;
              })()}
            </span>
            <span>0{regionKeys.indexOf(selected) + 1} / 04</span>
          </div>
          <h2>{info.title}</h2>
          <p className="english-name">{info.english}</p>
          <div className="region-detail-score">
            <strong>{score ?? '—'}</strong>
            <span>{score === null ? 'Недостаточно данных' : 'иллюстративный индекс'}</span>
          </div>
          <h3>{info.area}</h3>
          <p className="region-description">{info.description}</p>
          <details className="formula-details" key={selected}>
            <summary>
              <Info size={15} /> Как получен индекс <ChevronRight size={15} />
            </summary>
            <p>{info.formula}</p>
            <p>
              Самооценка 1–10: (ответ − 1) / 9 × 100. Пропущенные компоненты исключаются, оставшиеся
              веса нормируются. Нет компонентов — нет индекса.
            </p>
          </details>
          <div className="region-bottom-note">
            Подсветка не зависит от баллов и не показывает измеренную активность.
          </div>
        </aside>
      </div>
      <Disclaimer compact />
      <div className="insights-grid">
        <section className="evidence-panel card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">BEHIND THE NUMBERS</span>
              <h2>Ваши наблюдения</h2>
            </div>
            <span className="subtle-badge">Исходные данные</span>
          </div>
          <div className="evidence-tasks">
            <div>
              <span>
                <Timer size={17} /> Реакция · задание
              </span>
              <strong>
                {rt === null ? '—' : Math.round(rt)}
                <small>{rt === null ? 'пропущено' : 'мс · медиана'}</small>
              </strong>
              <div className="mini-bars">
                {session.reaction.map((v, i) => (
                  <div key={i} title={`Попытка ${i + 1}: ${Math.round(v)} мс`}>
                    <i style={{ height: `${Math.min(70, v / 7)}px` }} />
                    <span>{Math.round(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span>
                <Grid3X3 size={17} /> Память · задание
              </span>
              <strong>
                {session.memory.length ? `${Math.round(evidence.accuracy * 100)}%` : '—'}
                <small>верные позиции</small>
              </strong>
              <div className="evidence-span">
                Максимальная длина <b>{session.memory.length ? `${evidence.span} / 7` : '—'}</b>
              </div>
              <div className="span-dots">
                {Array.from({ length: 7 }, (_, i) => (
                  <i key={i} className={i < evidence.span ? 'filled' : ''} />
                ))}
              </div>
            </div>
          </div>
          <div className="self-report">
            <span className="eyebrow">САМООЦЕНКА · ОТДЕЛЬНО ОТ ЗАДАНИЙ</span>
            <dl>
              {[
                ['Фокус', session.intake.focus === undefined ? '—' : `${session.intake.focus}/10`],
                [
                  'Память',
                  session.intake.memory === undefined ? '—' : `${session.intake.memory}/10`,
                ],
                [
                  'Нагрузка',
                  session.intake.stress === undefined ? '—' : `${session.intake.stress}/10`,
                ],
                ['Сон', session.intake.sleep === undefined ? '—' : `${session.intake.sleep} ч`],
              ].map(([label, v]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <details className="evidence-calculations">
            <summary>Нормированные компоненты и пропуски</summary>
            <p>
              Фокус: {rating(session.intake.focus)?.toFixed(1) ?? 'нет ответа'}. Память:{' '}
              {rating(session.intake.memory)?.toFixed(1) ?? 'нет ответа'}. Реакция:{' '}
              {reactionIndex(session.reaction)?.toFixed(1) ?? 'нет задания'}. Мини-задание памяти:{' '}
              {evidence.index?.toFixed(1) ?? 'нет задания'}. Возрастная группа не используется в
              формулах.
            </p>
          </details>
        </section>
        <section className="history-panel card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">A LONGER PERSPECTIVE</span>
              <h2>История наблюдений</h2>
            </div>
            <span className="subtle-badge">{store.sessions.length} сессий</span>
          </div>
          <HistoryChart sessions={store.sessions} />
          <p className="history-note">
            Изменения могут отражать условия, практику и задержку устройства. Это не динамика
            состояния мозга.
          </p>
        </section>
      </div>
      <section className="tips-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">SMALL, EVERYDAY IDEAS</div>
            <h2>Место для хороших привычек.</h2>
          </div>
          <Lightbulb size={25} />
        </div>
        <div className="tips-grid">
          {tips.map((tip, i) => (
            <article key={tip.title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </div>
              <ArrowUpRight size={19} />
            </article>
          ))}
        </div>
      </section>
      <details className="about-model">
        <summary>
          <Info size={18} /> Об этой модели, данных и ограничениях <ChevronRight size={18} />
        </summary>
        <div>
          <p>
            NeuroTwin использует детерминированные демонстрационные формулы. Машинное обучение для
            этого MVP не требуется. Низкий индекс не свидетельствует о нарушении, заболевании или
            повреждении мозга.
          </p>
          <p>
            3D-мозг — общий анатомический референс Z-Anatomy / BodyParts3D (DBCLS), распространённый
            в{' '}
            <a href="https://github.com/itayinbarr/brainproject" target="_blank" rel="noreferrer">
              Brain Project
            </a>{' '}
            под CC BY-SA 4.0. Это не ваша анатомия; MRI-режима в приложении нет. Подсветка
            обозначает приблизительные функциональные ассоциации.
          </p>
          <p>
            Все компоненты округляются только в финальных индексах. Недостающие значения не
            заменяются выдуманными ответами. Результаты доступны в локальном JSON-экспорте.{' '}
            <Link href="/privacy">Хранение и удаление данных →</Link>
          </p>
        </div>
      </details>
    </div>
  );
}
export default function Dashboard() {
  return (
    <Suspense fallback={<div className="page-container skeleton-page">Открываем профиль…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
