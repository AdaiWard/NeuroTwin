import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import './globals.css';
export const metadata: Metadata = {
  title: 'NeuroTwin — исследуйте свой когнитивный профиль',
  description:
    'Интерактивный когнитивный профиль с анатомической 3D-визуализацией. Локально, прозрачно, без клинических обещаний.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#content">
          Перейти к содержимому
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
