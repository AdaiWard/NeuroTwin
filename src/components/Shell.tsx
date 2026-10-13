'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUpRight, Fingerprint, BrainCircuit } from 'lucide-react';
import { useNeuroStore } from '@/store/useNeuroStore';
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="NeuroTwin — главная">
      <span className="logo-icon">
        <BrainCircuit size={23} />
      </span>
      neuro<span className="logo-thin">twin</span>
      <span className="logo-dot">.</span>
    </Link>
  );
}
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    hydrate = useNeuroStore((s) => s.hydrate),
    error = useNeuroStore((s) => s.storageError);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return (
    <>
      <header className="site-header">
        <Logo />
        <nav aria-label="Основная навигация">
          <Link href="/" className={path === '/' ? 'nav-active' : ''}>
            Обзор
          </Link>
          <Link href="/dashboard" className={path === '/dashboard' ? 'nav-active' : ''}>
            Мой профиль
          </Link>
          <Link href="/privacy" className={path === '/privacy' ? 'nav-active' : ''}>
            Приватность
          </Link>
        </nav>
        <Link href="/assessment" className="header-cta">
          Начать исследование <ArrowUpRight size={16} />
        </Link>
      </header>
      {error && (
        <div className="storage-notice" role="alert">
          Браузер не разрешил сохранить данные. Эта сессия работает в памяти; экспортируйте
          результат перед закрытием.
        </div>
      )}
      <main>{children}</main>
      <footer className="site-footer">
        <Logo />
        <span>Немного любопытства. Новый взгляд на себя.</span>
        <Link href="/privacy">
          <Fingerprint size={15} /> Данные остаются у вас
        </Link>
        <span className="footer-note">ILLUSTRATIVE · NOT CLINICAL</span>
      </footer>
    </>
  );
}
