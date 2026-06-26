'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.profile.get().then(setProfile).catch(() => {});
    api.profile.resources().then(setResources).catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px 16px' }}>
      <div style={{ textAlign: 'center', paddingTop: 20, marginBottom: 28 }}>
        <div style={{ width: 80, height: 80, borderRadius: 28, background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 12 }}>
          👤
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>{profile?.nickname || user.nickname}</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 }}>{user.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { emoji: '🔥', value: profile?.streakDays || 0, label: 'días seguidos', bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.1)' },
          { emoji: '📖', value: profile?.diaryCount || 0, label: 'entradas', bg: 'rgba(168,85,247,0.08)', color: '#a855f7', border: 'rgba(168,85,247,0.1)' },
          { emoji: '🧘', value: profile?.exerciseCount || 0, label: 'ejercicios', bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 18, padding: '22px 12px', textAlign: 'center', border: `1px solid ${s.border}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 600, fontSize: 16, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          📚 Recursos de ayuda
        </h2>
        <div>
          {resources.map((r: any) => (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 24, marginTop: 2 }}>
                {r.category === 'article' ? '📄' : r.category === 'video' ? '🎬' : '🎵'}
              </span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 500, fontSize: 14, color: '#fff', margin: '0 0 2px 0' }}>{r.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{r.description}</p>
              </div>
              <span style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{r.category}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 18, padding: 20, marginBottom: 28, border: '1px solid rgba(239,68,68,0.08)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 24 }}>🚨</span>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: '#ef4444', margin: '0 0 4px 0' }}>Líneas de ayuda</h3>
            <p style={{ fontSize: 13, color: 'rgba(239,68,68,0.6)', marginBottom: 8 }}>
              Si estás pasando por una crisis, contacta ayuda profesional inmediatamente:
            </p>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#ef4444', margin: 0 }}>Línea de Prevención del Suicidio: 911</p>
            <p style={{ fontSize: 12, color: 'rgba(239,68,68,0.4)', marginTop: 4 }}>No estás solo. Hay personas que quieren ayudarte.</p>
          </div>
        </div>
      </div>

      <button onClick={logout}
        style={{
          width: '100%', padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
        }}>
        🚪 Cerrar sesión
      </button>
    </div>
  );
}
