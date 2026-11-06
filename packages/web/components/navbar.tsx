'use client';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/dashboard', icon: '🌙', label: 'Inicio' },
  { href: '/diary', icon: '📖', label: 'Diario' },
  { href: '/exercises', icon: '🧘', label: 'Ejercicios' },
  { href: '/community', icon: '💬', label: 'Comunidad' },
  { href: '/chat', icon: '🤖', label: 'Chat' },
  { href: '/subscribe', icon: '⭐', label: 'Premium' },
  { href: '/profile', icon: '✨', label: 'Perfil' },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY && y > 80) setVisible(false);
        else setVisible(true);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!user || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-50 liquid-glass transition-transform duration-300"
        style={{
          position: 'fixed',
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div className="max-w-[840px] mx-auto px-2">
          <div className="flex justify-around items-center h-16">
            {NAV.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav={item.label.toLowerCase()}
                  className={`relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-[1rem] transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="text-[10px] font-body tracking-wide">{item.label}</span>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white rounded-b-full shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
