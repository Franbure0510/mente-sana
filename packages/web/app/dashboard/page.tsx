'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

// 🌟 COSMIC THEME — Dark mode + Starry night + Neon
const theme = {
  bg: '#08080f',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
  borderGlow: 'rgba(168,85,247,0.3)',
  text: '#ffffff',
  textSoft: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.35)',
  purple: '#a855f7',
  purpleGlow: 'rgba(168,85,247,0.25)',
  pink: '#ec4899',
  pinkGlow: 'rgba(236,72,153,0.25)',
  cyan: '#06b6d4',
  cyanGlow: 'rgba(6,182,212,0.25)',
  gold: '#f59e0b',
  goldGlow: 'rgba(245,158,11,0.25)',
  green: '#10b981',
  greenGlow: 'rgba(16,185,129,0.25)',
  radius: 20,
  shadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const MOODS = [
  { val: 1, emoji: '😞', label: 'Muy mal', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  { val: 2, emoji: '😔', label: 'Mal', color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  { val: 3, emoji: '😐', label: 'Regular', color: '#eab308', glow: 'rgba(234,179,8,0.3)' },
  { val: 4, emoji: '🙂', label: 'Bien', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
  { val: 5, emoji: '😊', label: 'Muy bien', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
];

const ANXIETY = [
  { val: 1, emoji: '😌', label: 'Muy baja', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { val: 2, emoji: '🙂', label: 'Baja', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
  { val: 3, emoji: '😐', label: 'Normal', color: '#eab308', glow: 'rgba(234,179,8,0.3)' },
  { val: 4, emoji: '😟', label: 'Alta', color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  { val: 5, emoji: '😰', label: 'Muy alta', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
];

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checkin, setCheckin] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [moodLevel, setMoodLevel] = useState(3);
  const [anxietyLevel, setAnxietyLevel] = useState(3);
  const [profile, setProfile] = useState<any>(null);
  const [stars] = useState(() => 
    Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  );

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.checkin.today().then(setCheckin).catch(() => {});
    api.diary.stats().then(setStats).catch(() => {});
    api.profile.get().then(setProfile).catch(() => {});
    api.profile.streak().catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div style={{ padding: 60, textAlign: 'center', color: theme.textMuted }}>Cargando...</div>;
  if (!user) return null;

  const handleCheckin = async () => {
    await api.checkin.create({ moodLevel, anxietyLevel });
    setCheckin(await api.checkin.today());
    setShowCheckin(false);
    api.profile.get().then(setProfile);
  };

  const today = new Date();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const GlassCard = ({ children, style, onClick, hover }: any) => (
    <div onClick={onClick} style={{
      background: theme.bgCard,
      borderRadius: theme.radius,
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(12px)',
      boxShadow: theme.shadow,
      transition: 'all 0.3s ease',
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}
      onMouseEnter={e => { if (hover !== false) { e.currentTarget.style.background = theme.bgCardHover; e.currentTarget.style.borderColor = theme.borderGlow; } }}
      onMouseLeave={e => { if (hover !== false) { e.currentTarget.style.background = theme.bgCard; e.currentTarget.style.borderColor = theme.border; } }}>
      {children}
    </div>
  );

  const NeonGlow = ({ gradient, children, style }: any) => (
    <div style={{
      position: 'relative',
      '::before': {
        content: '""',
        position: 'absolute', inset: 0, borderRadius: theme.radius,
        background: gradient,
        opacity: 0.15, filter: 'blur(20px)',
        zIndex: -1,
      },
      ...style,
    } as any}>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 120px 20px', position: 'relative' }}>
      
      {/* ✦ STARS BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size, borderRadius: '50%',
            background: '#fff', opacity: 0,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* ✦ CSS KEYFRAMES injected via style tag */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: ${Math.random() * 0.6 + 0.2}; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.2); }
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.4); }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingTop: 20, position: 'relative', zIndex: 1 }}>
        <div>
          <p style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, marginBottom: 4, letterSpacing: '1px' }}>
            {dayNames[today.getDay()]} · {today.getDate()} {monthNames[today.getMonth()]}
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: theme.text, margin: 0, letterSpacing: '-0.5px' }}>
            Hola, <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' as any }}>{profile?.nickname || user.nickname}</span>
          </h1>
          {profile?.streakDays ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 20, filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' }}>🔥</span>
              <span style={{ fontSize: 14, color: theme.textSoft }}>
                <strong style={{ color: theme.gold }}>{profile.streakDays} días</strong> seguidos
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: theme.textMuted, marginTop: 8 }}>Hoy es un nuevo comienzo ✨</p>
          )}
        </div>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
          border: '1px solid rgba(168,85,247,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, backdropFilter: 'blur(8px)',
          animation: 'glow 3s ease-in-out infinite',
        }}>
          🌿
        </div>
      </div>

      {/* CHECK-IN BANNER */}
      {!checkin && !showCheckin && (
        <NeonGlow gradient="linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)">
          <GlassCard onClick={() => setShowCheckin(true)} hover={false} style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1), rgba(6,182,212,0.08))',
            padding: 32, marginBottom: 28, border: '1px solid rgba(168,85,247,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 6px 0' }}>
                  ¿Cómo estás hoy? 💭
                </h2>
                <p style={{ color: theme.textSoft, fontSize: 14, margin: 0 }}>
                  Check-in diario — 10 segundos
                </p>
              </div>
              <span style={{ fontSize: 36, animation: 'float 3s ease-in-out infinite' }}>✨</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
              borderRadius: 14, padding: '12px 24px', marginTop: 20,
              fontSize: 15, fontWeight: 600, color: '#fff',
              border: '1px solid rgba(168,85,247,0.2)',
              cursor: 'pointer',
            }}>
              ✨ Hacer check-in
            </div>
          </GlassCard>
        </NeonGlow>
      )}

      {/* CHECK-IN FORM */}
      {showCheckin && (
        <GlassCard style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid rgba(168,85,247,0.1)' }}>
              📊
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text, margin: 0 }}>Check-in diario</h3>
          </div>

          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Tu estado de ánimo
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {MOODS.map(m => (
                <button key={m.val} onClick={() => setMoodLevel(m.val)}
                  style={{
                    flex: 1, padding: '14px 4px', borderRadius: 16, cursor: 'pointer', textAlign: 'center',
                    border: moodLevel === m.val ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.06)',
                    background: moodLevel === m.val ? `${m.color}15` : theme.bgCard,
                    transform: moodLevel === m.val ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.25s',
                    boxShadow: moodLevel === m.val ? `0 0 20px ${m.glow}` : 'none',
                  }}>
                  <div style={{ fontSize: 34, marginBottom: 4 }}>{m.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: moodLevel === m.val ? m.color : theme.textMuted }}>
                    {m.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Nivel de ansiedad
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {ANXIETY.map(a => (
                <button key={a.val} onClick={() => setAnxietyLevel(a.val)}
                  style={{
                    flex: 1, padding: '14px 4px', borderRadius: 16, cursor: 'pointer', textAlign: 'center',
                    border: anxietyLevel === a.val ? `1px solid ${a.color}` : '1px solid rgba(255,255,255,0.06)',
                    background: anxietyLevel === a.val ? `${a.color}15` : theme.bgCard,
                    transform: anxietyLevel === a.val ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.25s',
                    boxShadow: anxietyLevel === a.val ? `0 0 20px ${a.glow}` : 'none',
                  }}>
                  <div style={{ fontSize: 34, marginBottom: 4 }}>{a.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: anxietyLevel === a.val ? a.color : theme.textMuted }}>
                    {a.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleCheckin}
              style={{
                flex: 1, background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: '#fff', border: 'none', borderRadius: 16,
                padding: '14px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
              }}>
              💾 Guardar check-in
            </button>
            <button onClick={() => setShowCheckin(false)}
              style={{
                background: 'rgba(255,255,255,0.04)', color: theme.textSoft, border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '14px 28px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              }}>
              Cancelar
            </button>
          </div>
        </GlassCard>
      )}

      {/* CHECK-IN DONE */}
      {checkin && (
        <GlassCard style={{ padding: 20, marginBottom: 28, display: 'flex', gap: 16, alignItems: 'center', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid rgba(16,185,129,0.15)' }}>
            ✅
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, color: theme.text, margin: 0 }}>
              Check-in completado
            </p>
            <p style={{ fontSize: 13, color: theme.textSoft, margin: '4px 0 0 0' }}>
              Ánimo: {MOODS.find(m => m.val === checkin.moodLevel)?.emoji}  ·  Ansiedad: {ANXIETY.find(a => a.val === checkin.anxietyLevel)?.emoji}
            </p>
          </div>
        </GlassCard>
      )}

      {/* QUICK ACTIONS */}
      <div style={{ marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: theme.textMuted, margin: '0 0 16px 0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          ✦ Acciones rápidas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { href: '/diary/new', emoji: '📖', title: 'Escribir', desc: 'Diario emocional', gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))', glow: theme.purpleGlow, border: 'rgba(168,85,247,0.15)' },
            { href: '/exercises', emoji: '🧘', title: 'Ejercicios', desc: `${profile?.exerciseCount || 0} realizados`, gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))', glow: theme.pinkGlow, border: 'rgba(236,72,153,0.15)' },
            { href: '/chat', emoji: '🤖', title: 'Chat IA', desc: 'Apoyo TCC', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))', glow: theme.cyanGlow, border: 'rgba(6,182,212,0.15)' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: item.gradient, borderRadius: 20, padding: 24,
                color: '#fff', border: `1px solid ${item.border}`,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s',
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${item.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 36, marginBottom: 14, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}>{item.emoji}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* STATS */}
      {stats && stats.totalEntries > 0 && (
        <div style={{ marginBottom: 28, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: theme.textMuted, margin: '0 0 16px 0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            ✦ Tu progreso
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <GlassCard style={{ padding: 24, textAlign: 'center', borderColor: 'rgba(168,85,247,0.1)' }}>
              <div style={{ fontSize: 32, marginBottom: 8, filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.3))' }}>📖</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: theme.purple, lineHeight: 1, marginBottom: 4 }}>{stats.totalEntries}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>Entradas</div>
            </GlassCard>
            <GlassCard style={{ padding: 24, textAlign: 'center', borderColor: 'rgba(245,158,11,0.1)' }}>
              <div style={{ fontSize: 32, marginBottom: 8, filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.3))' }}>⭐</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: theme.gold, lineHeight: 1, marginBottom: 4 }}>{stats.avgMood}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>Ánimo prom.</div>
            </GlassCard>
            <GlassCard style={{ padding: 24, textAlign: 'center', borderColor: 'rgba(16,185,129,0.1)' }}>
              <div style={{ fontSize: 32, marginBottom: 8, filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))' }}>🧘</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: theme.green, lineHeight: 1, marginBottom: 4 }}>{profile?.exerciseCount || 0}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>Ejercicios</div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* SECONDARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <Link href="/community" style={{ textDecoration: 'none' }}>
          <GlassCard style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: theme.text, margin: '0 0 2px 0' }}>Comunidad</h4>
              <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>Comparte anónimamente</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <GlassCard style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>👤</div>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: theme.text, margin: '0 0 2px 0' }}>Mi perfil</h4>
              <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>Racha y recursos</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.6, margin: 0 }}>
          💚 Herramienta de apoyo — no reemplaza ayuda profesional<br />
          En crisis llama al 911
        </p>
      </div>

    </div>
  );
}
