'use client';
import { useState } from 'react';
import { ShieldCheck, Fingerprint, Trash2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useNeuroStore } from '@/store/useNeuroStore';
export default function Privacy() {
  const store = useNeuroStore(),
    [confirm, setConfirm] = useState(false),
    [deleted, setDeleted] = useState(false);
  return (
    <div id="content" className="privacy-page page-container">
      <div className="eyebrow">PRIVATE BY DESIGN</div>
      <h1>
        Ваш разум.
        <br />
        Ваши <em>данные.</em>
      </h1>
      <p className="privacy-intro">
        Самонаблюдение должно оставаться личным.
        <br />
        NeuroTwin работает прямо в вашем браузере.
      </p>
      <div className="privacy-grid">
        <article>
          <Fingerprint size={27} />
          <h2>Что сохраняется</h2>
          <p>
            Только с вашего разрешения: необязательная возрастная группа, ответы о сне, нагрузке,
            фокусе, памяти и активности, время реакции, результаты последовательностей и
            рассчитанные индексы.
          </p>
          <p>
            Черновик и до 20 последних сессий хранятся в localStorage этого браузера под ключом{' '}
            <code>neurotwin:v1</code>. Незавершённые задания при обновлении начинаются заново.
          </p>
        </article>
        <article>
          <ShieldCheck size={27} />
          <h2>Куда идут ответы</h2>
          <p>
            Ответы и результаты не отправляются на сервер. В приложении нет аналитики, рекламы,
            аккаунтов или внешних API. Модель мозга, декодер и шрифты обслуживаются локально.
          </p>
          <p>
            Браузер запрашивает у сервера только файлы приложения. JSON-экспорт скачивается на ваше
            устройство и может содержать ваши ответы — храните его там, где вам удобно.
          </p>
        </article>
      </div>
      <div className="delete-card">
        <div>
          <h2>Удалить локальные данные</h2>
          <p>
            Удаляет черновик, историю и разрешение на хранение в этом браузере. Уже скачанные
            JSON-файлы удаляются вами отдельно.
          </p>
          <small>
            {store.hydrated ? `Сохранено сессий: ${store.sessions.length}` : 'Загрузка…'}
          </small>
        </div>
        <div className="delete-actions">
          {deleted ? (
            <span role="status" className="deleted-message">
              <ShieldCheck size={19} /> Локальные данные удалены
            </span>
          ) : confirm ? (
            <>
              <button
                className="button danger"
                onClick={() => {
                  store.removeAll();
                  setDeleted(true);
                  setConfirm(false);
                }}
              >
                Удалить данные
              </button>
              <button className="text-link" onClick={() => setConfirm(false)}>
                Отмена
              </button>
            </>
          ) : (
            <button className="button secondary" onClick={() => setConfirm(true)}>
              <Trash2 size={17} /> Удалить мои данные
            </button>
          )}
        </div>
      </div>
      <div className="privacy-limit">
        <h2>Прозрачность важнее обещаний.</h2>
        <p>
          Индексы иллюстративны и не имеют клинической валидации. Анкета и браузерные задания не
          восстанавливают индивидуальную анатомию, нейронные связи или мозговую активность. Не
          используйте их для диагноза, оценки IQ или медицинских решений.
        </p>
        <p>
          Локальное хранение доступно программам и людям с доступом к вашему браузерному профилю.
          Используйте отдельный профиль на общем устройстве. Если браузер запрещает localStorage,
          приложение работает в памяти и показывает уведомление.
        </p>
        <Link href="/assessment" className="text-link">
          К исследованию <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
