'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.push('/dashboard');
  }, [user, isLoading, router]);

  if (isLoading) return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (user) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: '#08080f', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>
      
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))',
            border: '1px solid rgba(168,85,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, backdropFilter: 'blur(12px)',
            boxShadow: '0 0 40px rgba(168,85,247,0.15)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            🌿
          </div>
        </div>
        
        <h1 style={{ fontSize: 44, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-1px', lineHeight: 1.1 }}>
          <span style={{ color: '#fff' }}>Mente</span>{' '}
          <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' as any }}>Sana</span>
        </h1>
        
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 36px auto' }}>
          Tu espacio seguro para el bienestar emocional
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { emoji: '📖', label: 'Diario', desc: 'Expresa emociones' },
            { emoji: '🧘', label: 'Ejercicios', desc: 'Técnicas guiadas' },
            { emoji: '💬', label: 'Comunidad', desc: 'Espacio seguro' },
          ].map(f => (
            <div key={f.label} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 18, padding: '18px 10px',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{f.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/register" style={{
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: '#fff', borderRadius: 18, padding: '16px 32px',
            fontWeight: 700, fontSize: 17, textAlign: 'center',
            boxShadow: '0 4px 24px rgba(168,85,247,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span>🌱</span> Comenzar gratis
          </Link>
          <Link href="/login" style={{
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: '16px 32px',
            fontWeight: 600, fontSize: 15, textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
          }}>
            Ya tengo cuenta
          </Link>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 40, lineHeight: 1.5, maxWidth: 300, margin: '40px auto 0' }}>
          Herramienta de apoyo emocional. No reemplaza ayuda profesional.
          En crisis llama al 911.
        </p>
      </div>
    </div>
  );
}
