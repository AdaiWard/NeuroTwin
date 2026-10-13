import { Info } from 'lucide-react';
export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`disclaimer ${compact ? 'compact' : ''}`}>
      <Info size={17} />
      <p>
        Иллюстративный когнитивный профиль, а не сканирование мозга.{' '}
        {compact
          ? 'Области показывают концептуальные связи, не вашу нейронную активность.'
          : 'Анкета и задания не определяют вашу анатомию, нейронные связи, IQ или диагноз. Индексы демонстрационные и не имеют клинической валидации.'}
      </p>
    </div>
  );
}
