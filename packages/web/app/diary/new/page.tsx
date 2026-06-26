'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MOOD_EMOJIS, MOOD_LABELS, EMOTIONS } from '@mentesana/shared';

export default function NewDiaryEntry() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [moodLevel, setMoodLevel] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [thought, setThought] = useState('');
  const [rationalThought, setRationalThought] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [saving, setSaving] = useState(false);

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) { router.push('/'); return null; }

  const toggleEmotion = (id: string) => {
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.diary.create({ moodLevel, emotions: selectedEmotions, thought, rationalThought, gratitude });
      router.push('/diary');
    } catch { alert('Error al guardar. Intenta de nuevo.'); }
    finally { setSaving(false); }
  };

  const cardStyle = { background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, border: '1px solid rgba(255,255,255,0.06)' };

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 16px 100px 16px' }}>
      <button onClick={() => router.back()} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Volver al diario
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 24 }}>📝 Nueva entrada</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>¿Cómo te sientes hoy?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setMoodLevel(n)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 4px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                  background: moodLevel === n ? 'rgba(168,85,247,0.12)' : 'transparent',
                  border: moodLevel === n ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(255,255,255,0.04)',
                  transform: moodLevel === n ? 'scale(1.05)' : 'scale(1)',
                  opacity: moodLevel === n ? 1 : 0.5,
                }}>
                <span style={{ fontSize: 26 }}>{MOOD_EMOJIS[n]}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: moodLevel === n ? '#a855f7' : 'rgba(255,255,255,0.35)' }}>{MOOD_LABELS[n]}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Emociones que identificas</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOTIONS.map(em => (
              <button key={em.id} type="button" onClick={() => toggleEmotion(em.id)}
                style={{
                  padding: '8px 16px', borderRadius: 12, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  background: selectedEmotions.includes(em.id) ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
                  border: selectedEmotions.includes(em.id) ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  color: selectedEmotions.includes(em.id) ? '#a855f7' : 'rgba(255,255,255,0.5)',
                  fontWeight: selectedEmotions.includes(em.id) ? 600 : 400,
                }}>
                {em.emoji} {em.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>¿Qué pensamiento tienes en mente?</label>
          <textarea value={thought} onChange={e => setThought(e.target.value)}
            style={{ width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Escribe lo que estás pensando..." required />
        </div>

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            🧠 Perspectiva más equilibrada (opcional)
          </label>
          <textarea value={rationalThought} onChange={e => setRationalThought(e.target.value)}
            style={{ width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Reestructura tu pensamiento de forma más objetiva..." />
        </div>

        <div style={{ ...cardStyle, marginBottom: 28 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✨ ¿Por qué estás agradecido hoy? (opcional)
          </label>
          <textarea value={gratitude} onChange={e => setGratitude(e.target.value)}
            style={{ width: '100%', minHeight: 60, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Tres cosas por las que estás agradecido..." />
        </div>

        <button type="submit" disabled={saving}
          style={{
            width: '100%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 16,
            padding: '16px 24px', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            boxShadow: '0 4px 20px rgba(168,85,247,0.25)',
          }}>
          {saving ? 'Guardando...' : '💾 Guardar entrada'}
        </button>
      </form>
    </div>
  );
}
