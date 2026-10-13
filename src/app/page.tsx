import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Focus,
  Layers,
  ShieldCheck,
  Timer,
  MoveUpRight,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import BrainViewer from '@/components/brain/BrainViewer';
import Disclaimer from '@/components/Disclaimer';
export default function Home() {
  return (
    <div id="content" className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-line" /> COGNITIVE EXPLORATION, REIMAGINED
          </div>
          <h1>
            Ваш разум.
            <br />
            Новый <em>ракурс.</em>
          </h1>
          <p className="hero-description">
            Превратите привычные ощущения в понятный когнитивный профиль. Исследуйте внимание,
            память и нагрузку — в объёме.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/assessment">
              Исследовать свой профиль <ArrowUpRight size={20} />
            </Link>
            <Link className="text-link" href="/dashboard?demo=1">
              Посмотреть демо <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-trust">
            <span>
              <Timer size={15} /> Около 5 минут
            </span>
            <span>
              <ShieldCheck size={15} /> Без регистрации
            </span>
          </div>
          <div className="hero-footnote">Не диагностика. Пространство для самонаблюдения.</div>
        </div>
        <div className="hero-visual">
          <div className="visual-caption">
            <span className="pill">INTERACTIVE ANATOMY</span>
            <span>01 / EXPLORE</span>
          </div>
          <BrainViewer hero />
          <div className="visual-bottom">
            <span>
              Два полушария. Тысячи деталей.
              <br />
              <strong>Один новый взгляд.</strong>
            </span>
            <span className="visual-arrow">
              <MoveUpRight size={26} />
            </span>
          </div>
        </div>
      </section>
      <div className="feature-strip">
        <div>
          <Focus />
          <span>
            Внимание и реакция<small>От ощущений к наблюдениям</small>
          </span>
        </div>
        <div>
          <Layers />
          <span>
            Память в действии<small>Короткое визуальное задание</small>
          </span>
        </div>
        <div>
          <ScanLine />
          <span>
            Анатомия в 3D<small>Исследуйте под любым углом</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            Только ваш браузер<small>Без сервера и трекеров</small>
          </span>
        </div>
      </div>
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE PROCESS</div>
            <h2>Любопытство — первый шаг.</h2>
          </div>
          <p>
            Три небольших шага, чтобы заметить
            <br />
            свои привычки и увидеть общую картину.
          </p>
        </div>
        <div className="process-grid">
          {[
            {
              n: '01',
              icon: Sparkles,
              title: 'Расскажите о себе',
              text: 'Сон, субъективный фокус и повседневная нагрузка. Любой ответ можно пропустить.',
            },
            {
              n: '02',
              icon: Timer,
              title: 'Попробуйте два задания',
              text: 'Пять сигналов на реакцию и пять последовательностей на память. Без соревнования и оценочных ярлыков.',
            },
            {
              n: '03',
              icon: Layers,
              title: 'Исследуйте свой профиль',
              text: 'Прозрачные индексы, история наблюдений и интерактивная анатомическая модель.',
            },
          ].map(({ n, icon: Icon, title, text }) => (
            <article key={n}>
              <div className="process-top">
                <span>{n}</span>
                <Icon size={23} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <Disclaimer />
      <div className="landing-attribution">
        Анатомический референс: Z-Anatomy / BodyParts3D, DBCLS ·{' '}
        <a href="/models/SOURCE_LICENSE.txt" target="_blank" rel="noreferrer">
          CC BY-SA 4.0 <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  );
}
