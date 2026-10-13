import type { Session } from '@/types/neuro';
import { regionKeys, regions } from '@/lib/brainRegions';
export default function HistoryChart({ sessions }: { sessions: Session[] }) {
  const history = sessions
    .filter((s) => !s.demo)
    .slice(0, 8)
    .reverse();
  if (history.length < 2)
    return (
      <div className="history-empty">
        <span className="history-line" />
        <p>История появится после второго исследования.</p>
        <small>Демо никогда не добавляется к вашим наблюдениям.</small>
      </div>
    );
  return (
    <>
      <svg
        className="history-chart"
        viewBox="0 0 500 160"
        role="img"
        aria-label={`Динамика индексов за ${history.length} сессий. Точные значения доступны в таблице ниже.`}
      >
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line
              x1="36"
              y1={140 - v * 1.15}
              x2="480"
              y2={140 - v * 1.15}
              stroke="#2a2d39"
              strokeDasharray="3 5"
            />
            <text x="0" y={144 - v * 1.15} fill="#9ba0b5" fontSize="12">
              {v}
            </text>
          </g>
        ))}
        {regionKeys.map((r) => (
          <g key={r}>
            {history.map((s, i) => {
              const value = s.scores[r],
                prev = history[i - 1]?.scores[r];
              return value === null ? null : (
                <g key={s.id}>
                  {i > 0 && prev !== null && prev !== undefined && (
                    <line
                      x1={36 + ((i - 1) * 440) / (history.length - 1)}
                      y1={140 - prev * 1.15}
                      x2={36 + (i * 440) / (history.length - 1)}
                      y2={140 - value * 1.15}
                      stroke={regions[r].color}
                      strokeWidth="2"
                    />
                  )}
                  <circle
                    cx={36 + (i * 440) / (history.length - 1)}
                    cy={140 - value * 1.15}
                    r="3"
                    fill={regions[r].color}
                  />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <details className="history-table">
        <summary>Точные значения сессий</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                {regionKeys.map((r) => (
                  <th key={r}>{regions[r].title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.createdAt).toLocaleString('ru-RU')}</td>
                  {regionKeys.map((r) => (
                    <td key={r}>{s.scores[r] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
