'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, ShieldCheck, Check, Fingerprint } from 'lucide-react';
import { useNeuroStore } from '@/store/useNeuroStore';
import { computeScores, median, memoryEvidence } from '@/lib/scoring';
import type { Intake } from '@/types/neuro';
import Disclaimer from '@/components/Disclaimer';
import ReactionTask from '@/components/assessment/ReactionTask';
import MemoryTask from '@/components/assessment/MemoryTask';
const steps = ['О себе', 'Реакция', 'Память', 'Ваш профиль'];
function IntakeForm({ initial, onSave }: { initial: Intake; onSave: (v: Intake) => void }) {
  const [values, setValues] = useState<Intake>(initial);
  const set = (k: keyof Intake, v: string) =>
    setValues((s) => ({
      ...s,
      [k]:
        v === '' ? undefined : ['sleep', 'stress', 'focus', 'memory'].includes(k) ? Number(v) : v,
    }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
      }}
    >
      <div className="task-heading">
        <div className="eyebrow">YOUR EVERYDAY CONTEXT</div>
        <h2>Начнём с вашего дня.</h2>
        <p>
          Здесь нет правильных ответов. Все поля необязательны: оставьте пустым то, чем не хотите
          делиться.
        </p>
      </div>
      <div className="intake-grid">
        <label>
          Возрастная группа <span>Необязательно</span>
          <select value={values.age ?? ''} onChange={(e) => set('age', e.target.value)}>
            <option value="">Не указывать</option>
            {['18–24', '25–34', '35–44', '45–54', '55+'].map((a) => (
              <option key={a}>{a}</option>
            ))}
            <option value="under18">Младше 18</option>
          </select>
        </label>
        <label>
          Обычно сплю, часов <span>От 0 до 12</span>
          <input
            aria-label="Обычно сплю, часов"
            type="number"
            min="0"
            max="12"
            step="0.5"
            placeholder="Например, 7.5"
            value={values.sleep ?? ''}
            onChange={(e) => set('sleep', e.target.value)}
          />
        </label>
      </div>
      <div className="rating-fields">
        {[
          { key: 'focus', title: 'Насколько легко удерживать фокус?', lo: 'Сложно', hi: 'Легко' },
          {
            key: 'memory',
            title: 'Как ощущается ваша память?',
            lo: 'Нужно больше усилий',
            hi: 'Легко вспоминаю',
          },
          { key: 'stress', title: 'Сколько нагрузки ощущаете сейчас?', lo: 'Мало', hi: 'Много' },
        ].map(({ key, title, lo, hi }) => (
          <fieldset key={key}>
            <legend>
              {title}
              <span>Самооценка · необязательно</span>
            </legend>
            <div className="rating-options">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={values[key as 'focus' | 'memory' | 'stress'] === i + 1}
                  aria-label={`${title} ${i + 1} из 10`}
                  className={
                    values[key as 'focus' | 'memory' | 'stress'] === i + 1 ? 'selected' : ''
                  }
                  onClick={() =>
                    setValues((s) => ({
                      ...s,
                      [key]: s[key as 'focus' | 'memory' | 'stress'] === i + 1 ? undefined : i + 1,
                    }))
                  }
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="rating-captions">
              <span>{lo}</span>
              <span>{hi}</span>
            </div>
          </fieldset>
        ))}
      </div>
      <fieldset className="activity-field">
        <legend>
          Повседневная физическая активность <span>Необязательно</span>
        </legend>
        <div className="activity-options">
          {(['low', 'moderate', 'high'] as const).map((a, i) => (
            <button
              key={a}
              type="button"
              aria-pressed={values.activity === a}
              className={values.activity === a ? 'selected' : ''}
              onClick={() =>
                setValues((s) => ({ ...s, activity: s.activity === a ? undefined : a }))
              }
            >
              {['Невысокая', 'Умеренная', 'Высокая'][i]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="form-bottom">
        <span>
          <ShieldCheck size={16} /> Ответы сохраняются только здесь
        </span>
        <button className="button primary" type="submit">
          Дальше <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
export default function Assessment() {
  const router = useRouter(),
    store = useNeuroStore(),
    [memoryKey, setMemoryKey] = useState(0),
    [reactionKey, setReactionKey] = useState(0);
  const { draft } = store;
  const finalize = () => {
    const s = {
      schemaVersion: 1 as const,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      demo: false,
      intake: draft.intake,
      reaction: draft.reaction,
      memory: draft.memory,
      scores: computeScores(draft.intake, draft.reaction, draft.memory),
    };
    store.saveSession(s);
    router.push('/dashboard');
  };
  if (!store.hydrated)
    return (
      <div id="content" className="page-container skeleton-page" role="status">
        Подготавливаем исследование…
      </div>
    );
  return (
    <div id="content" className="assessment-page page-container">
      <div className="page-topline">
        <Link href="/" className="text-link">
          <ArrowLeft size={15} /> На главную
        </Link>
        <span className="eyebrow">A MOMENT FOR YOUR MIND</span>
      </div>
      <div className="assessment-layout">
        <aside className="assessment-aside">
          <div className="eyebrow">SELF EXPLORATION</div>
          <h1>
            Познакомьтесь
            <br />с собой <em>ближе.</em>
          </h1>
          <p>
            Несколько наблюдений.
            <br />
            Два коротких задания.
            <br />
            Ваш новый ракурс.
          </p>
          <ol className="step-list">
            {steps.map((title, i) => (
              <li
                key={title}
                className={`${draft.step === i ? 'current' : ''} ${draft.step > i ? 'finished' : ''}`}
              >
                <span>{draft.step > i ? <Check size={16} /> : `0${i + 1}`}</span>
                <div>
                  {title}
                  <small>
                    {
                      [
                        'Ваш повседневный контекст',
                        'Пять коротких сигналов',
                        'Пять визуальных последовательностей',
                        'Проверить и создать',
                      ][i]
                    }
                  </small>
                </div>
              </li>
            ))}
          </ol>
          <div className="aside-privacy">
            <Fingerprint size={25} />
            <strong>Приватность по умолчанию</strong>
            <p>Без аккаунта. Без отправки ответов. Вы можете удалить данные в любой момент.</p>
            <Link href="/privacy">Как это работает ↗</Link>
          </div>
        </aside>
        <div className="assessment-panel">
          <div className="progress-header">
            <span>ШАГ {draft.step + 1} ИЗ 4</span>
            <span>{Math.round(((draft.step + 1) / 4) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <i style={{ width: `${(draft.step + 1) * 25}%` }} />
          </div>
          {!store.consent ? (
            <div className="consent-card">
              <ShieldCheck size={44} />
              <h2>
                Ваши данные.
                <br />
                Ваш браузер.
              </h2>
              <p>
                Разрешите сохранять ответы, завершённые задания и до 20 сессий в localStorage этого
                браузера. Вы сможете продолжить анкету после перезагрузки. Незавершённое задание
                начинается заново.
              </p>
              <Disclaimer />
              <button className="button primary" onClick={store.allowStorage}>
                Разрешить локальное сохранение <ArrowRight size={18} />
              </button>
              <Link className="text-link" href="/dashboard?demo=1">
                Сначала посмотреть демо
              </Link>
            </div>
          ) : (
            <div className="step-content">
              {draft.step === 0 && (
                <IntakeForm
                  initial={draft.intake}
                  onSave={(intake) => store.setDraft({ intake, step: 1 })}
                />
              )}
              {draft.step === 1 &&
                (draft.reaction.length === 5 ? (
                  <div className="saved-task">
                    <Check />
                    <h2>Результат реакции сохранён</h2>
                    <p>Медиана {Math.round(median(draft.reaction) ?? 0)} мс</p>
                    <button className="button primary" onClick={() => store.setDraft({ step: 2 })}>
                      Продолжить →
                    </button>
                    <button
                      className="text-link"
                      onClick={() => {
                        store.setDraft({ reaction: [] });
                        setReactionKey((k) => k + 1);
                      }}
                    >
                      Повторить задание
                    </button>
                  </div>
                ) : (
                  <ReactionTask
                    key={reactionKey}
                    onComplete={(reaction) =>
                      store.setDraft({ reaction, reactionSkipped: false, step: 2 })
                    }
                  />
                ))}
              {draft.step === 2 &&
                (draft.memory.length === 5 ? (
                  <div className="saved-task">
                    <Check />
                    <h2>Результат памяти сохранён</h2>
                    <p>Максимальная длина {memoryEvidence(draft.memory).span} плиток</p>
                    <button className="button primary" onClick={() => store.setDraft({ step: 3 })}>
                      Продолжить →
                    </button>
                    <button
                      className="text-link"
                      onClick={() => {
                        store.setDraft({ memory: [] });
                        setMemoryKey((k) => k + 1);
                      }}
                    >
                      Повторить задание
                    </button>
                  </div>
                ) : (
                  <MemoryTask
                    key={memoryKey}
                    onComplete={(memory) =>
                      store.setDraft({ memory, memorySkipped: false, step: 3 })
                    }
                  />
                ))}
              {draft.step === 3 && (
                <div className="review">
                  <div className="task-heading">
                    <div className="eyebrow">YOUR OBSERVATIONS, TOGETHER</div>
                    <h2>Всё готово к новому ракурсу.</h2>
                    <p>
                      Проверьте исходные данные. Индексы рассчитываются по открытым формулам, без
                      ИИ-предсказаний.
                    </p>
                  </div>
                  <div className="review-block">
                    <h3>
                      Ваши ответы <span>Самооценка</span>
                    </h3>
                    <dl>
                      {[
                        [
                          'Сон',
                          draft.intake.sleep === undefined
                            ? 'Не указано'
                            : `${draft.intake.sleep} ч`,
                        ],
                        ['Фокус', draft.intake.focus ?? 'Не указано'],
                        ['Память', draft.intake.memory ?? 'Не указано'],
                        ['Нагрузка', draft.intake.stress ?? 'Не указано'],
                        [
                          'Активность',
                          draft.intake.activity
                            ? { low: 'Невысокая', moderate: 'Умеренная', high: 'Высокая' }[
                                draft.intake.activity
                              ]
                            : 'Не указано',
                        ],
                        [
                          'Возраст',
                          draft.intake.age === 'under18'
                            ? 'Младше 18'
                            : (draft.intake.age ?? 'Не указано'),
                        ],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="review-block">
                    <h3>
                      Результаты заданий <span>Наблюдения</span>
                    </h3>
                    <dl>
                      <div>
                        <dt>Медиана реакции</dt>
                        <dd>
                          {draft.reaction.length === 5
                            ? `${Math.round(median(draft.reaction) ?? 0)} мс`
                            : 'Пропущено'}
                        </dd>
                      </div>
                      <div>
                        <dt>Память · верные позиции</dt>
                        <dd>
                          {draft.memory.length
                            ? `${Math.round(memoryEvidence(draft.memory).accuracy * 100)}%`
                            : 'Пропущено'}
                        </dd>
                      </div>
                      <div>
                        <dt>Максимальная верная длина</dt>
                        <dd>
                          {draft.memory.length ? `${memoryEvidence(draft.memory).span} / 7` : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Disclaimer />
                  <button className="button primary wide" onClick={finalize}>
                    Создать мой профиль <ArrowRight size={18} />
                  </button>
                </div>
              )}
              <div className="step-navigation">
                {draft.step > 0 && (
                  <button
                    className="text-link"
                    onClick={() => store.setDraft({ step: draft.step - 1 })}
                  >
                    <ArrowLeft size={15} /> Назад
                  </button>
                )}
                {[1, 2].includes(draft.step) && (
                  <button
                    className="text-link skip-task"
                    onClick={() =>
                      store.setDraft(
                        draft.step === 1
                          ? { step: 2, reaction: [], reactionSkipped: true }
                          : { step: 3, memory: [], memorySkipped: true },
                      )
                    }
                  >
                    Пропустить задание
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="assessment-disclaimer">
        <Disclaimer compact />
      </div>
    </div>
  );
}
