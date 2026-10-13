import type { Region } from '../types/neuro';
export const regions: Record<
  Region,
  {
    title: string;
    english: string;
    color: string;
    area: string;
    description: string;
    formula: string;
  }
> = {
  attention: {
    title: 'Внимание',
    english: 'Attention',
    color: '#8dbbff',
    area: 'Дорсальная теменная кора',
    description:
      'Теменные области участвуют в распределении внимания. Подсветка — иллюстрация этой связи, а не измерение активности вашего мозга.',
    formula:
      '45% самооценки фокуса + 55% индекса реакции. Реакция: 100 × (600 − медиана в мс) / 420, в пределах 0–100. Это условная шкала интерфейса, а не возрастная норма.',
  },
  memory: {
    title: 'Память',
    english: 'Memory',
    color: '#b8a0ff',
    area: 'Височная область · приблизительно',
    description:
      'Память связана с распределёнными системами, включая медиальные височные структуры. Гиппокамп находится внутри мозга; подсветка внешней коры только указывает на приблизительное расположение.',
    formula:
      '35% самооценки памяти + 65% задания. Задание: 100 × (0,6 × доля правильно воспроизведённых позиций + 0,4 × максимальная полностью верная длина / 7). Пять раундов длиной 3–7.',
  },
  executive: {
    title: 'Контроль',
    english: 'Executive composite',
    color: '#7cddcb',
    area: 'Латеральная префронтальная кора',
    description:
      'Префронтальная кора участвует в планировании. Наш иллюстративный композит объединяет другие индексы; он не является тестом исполнительных функций.',
    formula:
      '45% внимания + 45% памяти + 10% активности (25 / 60 / 100). За самооценку стресса выше 5 вычитается до 10 баллов: 10 × (стресс − 5) / 5.',
  },
  stress: {
    title: 'Нагрузка',
    english: 'Reported load',
    color: '#efb78b',
    area: 'Распределённая концептуальная сеть',
    description:
      'У стресса нет отдельного «центра», который измеряет это приложение. Несколько участков выделены как концептуальная сеть. Индекс отражает только ваши ответы.',
    formula:
      '75% самооценки стресса + 25% компонента короткого сна: 100 × (8 − часы сна) / 4, в пределах 0–100. Большое значение означает больше сообщённой нагрузки, а не лучший результат.',
  },
};
export const regionKeys = Object.keys(regions) as Region[];
export function regionForLabel(label: string): Region | null {
  if (/superior parietal|intraparietal|precuneus/i.test(label)) return 'attention';
  if (/parahippocampal|inferior temporal|fusiform|occipitotemporal/i.test(label)) return 'memory';
  if (/middle frontal|inferior frontal/i.test(label)) return 'executive';
  if (/cingulate|superior frontal|insula/i.test(label)) return 'stress';
  return null;
}
