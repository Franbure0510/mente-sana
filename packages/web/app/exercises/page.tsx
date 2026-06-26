'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: '📋' },
  { key: 'breathing', label: 'Respiración', icon: '🫁' },
  { key: 'meditation', label: 'Meditación', icon: '🧘' },
  { key: 'cbt', label: 'TCC', icon: '🧠' },
  { key: 'grounding', label: 'Grounding', icon: '🌍' },
  { key: 'relaxation', label: 'Relajación', icon: '💆' },
];

export default function ExercisesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.exercises.list().then(setExercises).catch(() => {});
    api.exercises.history().then(setHistory).catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;

  const filtered = category === 'all' ? exercises : exercises.filter((e: any) => e.category === category);
  const completedIds = new Set(history.map((s: any) => s.exerciseId));

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px 16px' }}>
      <div style={{ marginBottom: 24, paddingTop: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>🧘 Ejercicios guiados</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Técnicas basadas en TCC, mindfulness y respiración</p>
      </div>

      {history.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            Has completado <strong style={{ color: '#a855f7' }}>{history.length}</strong> ejercicios
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12,
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: category === cat.key ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
              color: category === cat.key ? '#fff' : 'rgba(255,255,255,0.5)',
              boxShadow: category === cat.key ? '0 4px 16px rgba(168,85,247,0.25)' : 'none',
            }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div>
        {filtered.map((ex: any) => (
          <Link key={ex.id} href={`/exercises/${ex.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 20,
              border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'flex-start', gap: 16,
            }}>
              <span style={{ fontSize: 32, marginTop: 2 }}>{ex.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 15, color: '#fff', margin: 0 }}>{ex.title}</h3>
                  {completedIds.has(ex.id) && (
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>Completado</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0 0', lineHeight: 1.5 }}>{ex.description}</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  <span>⏱ {ex.duration} min</span>
                  <span>📋 {ex.steps?.length || 0} pasos</span>
                  <span style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{ex.category}</span>
                </div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, marginTop: 8 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
