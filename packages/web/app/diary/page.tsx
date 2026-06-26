'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MOOD_EMOJIS, MOOD_LABELS } from '@mentesana/shared';
import Link from 'next/link';

const s = (sel: string) => sel;

export default function DiaryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.diary.list().then(setEntries).catch(() => {});
    api.diary.stats().then(setStats).catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 8 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>📖 Diario emocional</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Registra cómo evolucionan tus emociones</p>
        </div>
        <Link href="/diary/new" style={{
          textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff',
          borderRadius: 14, padding: '10px 20px', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 16px rgba(168,85,247,0.25)',
        }}>
          + Nueva entrada
        </Link>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(168,85,247,0.08)', borderRadius: 18, padding: 22, textAlign: 'center', border: '1px solid rgba(168,85,247,0.1)' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#a855f7' }}>{stats.totalEntries}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Entradas totales</div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 18, padding: 22, textAlign: 'center', border: '1px solid rgba(245,158,11,0.1)' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#f59e0b' }}>{stats.avgMood}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Ánimo promedio</div>
          </div>
        </div>
      )}

      <div>
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, color: '#fff' }}>Aún no hay entradas</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 24 }}>Escribe tu primera entrada para empezar</p>
            <Link href="/diary/new" style={{
              textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff',
              borderRadius: 14, padding: '12px 28px', fontWeight: 600, fontSize: 15,
              boxShadow: '0 4px 20px rgba(168,85,247,0.25)',
            }}>
              ✨ Escribir primera entrada
            </Link>
          </div>
        )}
        {entries.map((entry: any) => (
          <div key={entry.id} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, marginBottom: 12,
            border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{MOOD_EMOJIS[entry.moodLevel as keyof typeof MOOD_EMOJIS]}</span>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{MOOD_LABELS[entry.moodLevel as keyof typeof MOOD_LABELS]}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginLeft: 8 }}>
                    {new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{entry.thought}</p>
            {entry.rationalThought && (
              <div style={{ marginTop: 12, background: 'rgba(16,185,129,0.08)', borderRadius: 14, padding: 14, border: '1px solid rgba(16,185,129,0.1)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#10b981', margin: '0 0 4px 0' }}>🧠 Pensamiento racional</p>
                <p style={{ fontSize: 13, color: 'rgba(16,185,129,0.8)', margin: 0 }}>{entry.rationalThought}</p>
              </div>
            )}
            {entry.emotions && entry.emotions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {(typeof entry.emotions === 'string' ? JSON.parse(entry.emotions) : entry.emotions).map((em: string) => (
                  <span key={em} style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{em}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
