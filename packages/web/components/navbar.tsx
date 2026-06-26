'use client';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard', icon: '🌙', label: 'Inicio' },
  { href: '/diary', icon: '📖', label: 'Diario' },
  { href: '/exercises', icon: '🧘', label: 'Ejercicios' },
  { href: '/community', icon: '💬', label: 'Comunidad' },
  { href: '/chat', icon: '🤖', label: 'Chat' },
  { href: '/profile', icon: '✨', label: 'Perfil' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(8,8,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
      }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>
            {NAV.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} style={{
                  textDecoration: 'none', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2, padding: '8px 10px', borderRadius: 16,
                  position: 'relative', transition: 'all 0.2s',
                  background: isActive ? 'rgba(168,85,247,0.08)' : 'transparent',
                }}>
                  <span style={{
                    fontSize: 22,
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(168,85,247,0.4))' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {item.icon}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#a855f7' : 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.3px',
                    transition: 'all 0.2s',
                  }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      width: 20, height: 2.5, background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                      borderRadius: '0 0 4px 4px',
                      boxShadow: '0 0 10px rgba(168,85,247,0.4)',
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div style={{ height: 64 }} />
    </>
  );
}
