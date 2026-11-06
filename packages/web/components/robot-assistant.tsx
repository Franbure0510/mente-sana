'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

type Mood = 'greeting' | 'happy' | 'sad' | 'anxious' | 'encouraging' | 'celebrating' | 'checking' | 'listening';
type Phase = 'entering' | 'bubble' | 'flying' | 'pointing' | 'encouraging' | 'checking' | 'idle';

const MOODS: Record<Mood, { emoji: string; gradient: string; glow: string }> = {
  greeting: { emoji: '🤖', gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)', glow: 'rgba(255,255,255,0.2)' },
  happy: { emoji: '🥳', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', glow: 'rgba(16,185,129,0.4)' },
  sad: { emoji: '🥺', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', glow: 'rgba(99,102,241,0.4)' },
  anxious: { emoji: '😰', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', glow: 'rgba(245,158,11,0.4)' },
  encouraging: { emoji: '🌟', gradient: 'linear-gradient(135deg, #ffffff, #06b6d4)', glow: 'rgba(255,255,255,0.25)' },
  celebrating: { emoji: '🎉', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)', glow: 'rgba(245,158,11,0.4)' },
  checking: { emoji: '🤔', gradient: 'linear-gradient(135deg, #6366f1, #ffffff)', glow: 'rgba(99,102,241,0.4)' },
  listening: { emoji: '🤖', gradient: 'linear-gradient(135deg, #6366f1, #ffffff)', glow: 'rgba(99,102,241,0.4)' },
};

const SECTIONS: Record<string, { href: string; label: string; emoji: string }> = {
  ejercicios: { href: '/exercises', label: 'Ejercicios', emoji: '🧘' },
  diario: { href: '/diary', label: 'Diario', emoji: '📖' },
  comunidad: { href: '/community', label: 'Comunidad', emoji: '💬' },
  chat: { href: '/chat', label: 'Chat', emoji: '🤖' },
  inicio: { href: '/dashboard', label: 'Inicio', emoji: '🌙' },
};

const ENCOURAGE: Record<string, string[]> = {
  ejercicios: ['¡Excelente! Cada ejercicio te fortalece 💪', 'Muy bien hecho 🧘 Respira profundo', 'Lo lograste! 🌟 Tu esfuerzo vale la pena'],
  diario: ['Escribir es sanar 📖✨ Bien hecho', 'Gracias por expresarte 💫 Cada línea cuenta', 'Tu diario es tu espejo interior 🪞🌈'],
  comunidad: ['Compartir conecta 💬❤️', 'Tu voz importa, gracias por compartir 🫂', 'No estás solo, siempre hay alguien que te escucha 🌈'],
  chat: ['Hablar siempre ayuda 🤗💙', 'Siempre estoy aquí para ti 🫂', 'Gracias por confiar en mí 🌟'],
};

const KEYWORDS: Record<string, string> = {
  mal: 'ejercicios', triste: 'ejercicios', ansiedad: 'ejercicios',
  miedo: 'ejercicios', solo: 'comunidad', sola: 'comunidad',
  estres: 'diario', estresado: 'ejercicios', abrumado: 'ejercicios',
  enojado: 'diario', ira: 'diario', frustrado: 'ejercicios',
  cansado: 'diario', agotado: 'ejercicios', nervios: 'ejercicios',
};

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const lerp = (a: number, b: number, t: number) => a + (b - a) * (1 - Math.pow(1 - t, 3));

export default function RobotAssistant() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('entering');
  const [mood, setMood] = useState<Mood>('greeting');
  const [msg, setMsg] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [guidedSection, setGuidedSection] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showBubble, setShowBubble] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sparkles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({ id: i, x: Math.random() * 80 - 40, y: Math.random() * 80 - 40, delay: Math.random() * 2 }))
  );
  const initRef = useRef(false);
  const prevPath = useRef(pathname);
  const guidedRef = useRef<string | null>(null);

  const speak = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\*\*/g, '').replace(/\n+/g, '. ').replace(/[#*_]/g, '');
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'es-ES';
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang.toLowerCase().startsWith('es'));
      if (esVoice) utter.voice = esVoice;
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  // Init
  useEffect(() => {
    if (!user || initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        const title = `🤖 ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
        const conv = await api.chat.createConversation(title);
        setConvId(conv.id);
        const res = await api.chat.proactive(conv.id);
        const hour = new Date().getHours();
        const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
        // Dramatic entrance: big from the corner leaning in
        setScale(1.7);
        setMood('happy');
        setMsg('¡Hola! Soy MenteBot 🤖✨ ¡Bienvenido a Mente Sana!');
        setShowBubble(true);
        setPos({ x: window.innerWidth - 250, y: window.innerHeight - 380 });
        await delay(1600);
        // Smoothly lean back to normal size
        setScale(1);
        setMood('greeting');
        await delay(400);
        setMsg(res.message.content);
        setPhase('bubble');
        speak(`${saludo}. Soy MenteBot. ${res.message.content}`);
      } catch { setPhase('idle'); }
    })();
  }, [user]);

  // Listen for check-in completion
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const moodEmojis: Record<number, string> = { 1: '😞', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' };
      const anxietyEmojis: Record<number, string> = { 1: '😌', 2: '😰', 3: '😨', 4: '😟', 5: '😱' };
      const m = moodEmojis[detail.mood] || '😐';
      const a = anxietyEmojis[detail.anxiety] || '😰';
      const moodNames: Record<number, string> = { 1: 'bajo', 2: 'regular', 3: 'neutral', 4: 'bien', 5: 'muy bien' };
      const anxietyNames: Record<number, string> = { 1: 'baja', 2: 'moderada', 3: 'alta', 4: 'muy alta', 5: 'extrema' };

      setTimeout(() => {
        if (detail.mood <= 2 || detail.anxiety >= 3) {
          setMoodPhase('checking', 'checking',
            `Veo que tu ánimo está ${moodNames[detail.mood]} (${m}) y tu ansiedad ${anxietyNames[detail.anxiety]} (${a}). ¿Quieres que hablemos de eso? Puedo recomendarte un ejercicio o solo escucharte 💙`);
        } else {
          setMoodPhase('happy', 'bubble',
            `¡Qué bien que hiciste tu check-in! ${m} Tu ánimo está bien. ¿Hay algo en lo que pueda ayudarte hoy?`);
        }
      }, 1500);
    };
    window.addEventListener('robot-checkin', handler);
    return () => window.removeEventListener('robot-checkin', handler);
  }, []);

  // Track navigation — detect when user returns from a guided section
  useEffect(() => {
    if (!initRef.current) return;
    const prev = prevPath.current;
    prevPath.current = pathname;

    const guided = guidedRef.current;
    if (!guided) return;

    const section = SECTIONS[guided];
    if (!section) return;

    // User came FROM the guided section TO somewhere else
    if (prev === section.href && pathname !== section.href) {
      handleReturnFromSection(guided);
    }
  }, [pathname]);

  const animateTo = (target: { x: number; y: number }, duration: number) => {
    const start = { ...pos };
    const t0 = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - t0) / duration, 1);
      setPos({ x: lerp(start.x, target.x, t), y: lerp(start.y, target.y, t) });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const setMoodPhase = (m: Mood, p: Phase, message: string) => {
    setMood(m);
    setPhase(p);
    setMsg(message);
    setShowBubble(true);
    speak(message);
  };

  const EXERCISE_RECS: Record<string, { name: string; icon: string; why: string }> = {
    ansiedad: { name: 'Respiración 4-7-8', icon: '🫁', why: 'calma el sistema nervioso en minutos' },
    nervios: { name: 'Técnica 5-4-3-2-1', icon: '🌍', why: 'te ancla al presente cuando la mente se acelera' },
    miedo: { name: 'Respiración 4-7-8', icon: '🫁', why: 'reduce la respuesta de lucha o huida' },
    mal: { name: 'Escaneo Corporal', icon: '🧘', why: 'conecta con tu cuerpo y suelta la tensión' },
    triste: { name: 'Diario de Gratitud', icon: '✨', why: 'entrena al cerebro a encontrar luz en la oscuridad' },
    estres: { name: 'Relajación Muscular', icon: '💆', why: 'libera el estrés acumulado en cada músculo' },
    estresado: { name: 'Respiración 4-7-8', icon: '🫁', why: 'restaura el ritmo cardíaco y la calma' },
    abrumado: { name: 'Técnica 5-4-3-2-1', icon: '🌍', why: 'reduce el caos mental paso a paso' },
    cansado: { name: 'Escaneo Corporal', icon: '🧘', why: 'recarga tu energía sin moverte' },
    agotado: { name: 'Escaneo Corporal', icon: '🧘', why: 'descanso profundo para cuerpo y mente' },
  };

  const flyToSection = (key: string, reason?: string) => {
    const info = SECTIONS[key];
    if (!info) return;
    setGuidedSection(key);
    guidedRef.current = key;
    setMood(key === 'ejercicios' ? 'sad' : 'listening');
    setShowBubble(false);

    const el = document.querySelector(`[data-nav="${key}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const tx = rect.left + rect.width / 2 - 28;
      const ty = rect.top - 50;
      setPhase('flying');
      animateTo({ x: tx, y: ty }, 1000);
      setTimeout(() => {
        let extra = '';
        if (key === 'ejercicios' && reason && EXERCISE_RECS[reason]) {
          const r = EXERCISE_RECS[reason];
          extra = `\n\nTe recomiendo **${r.icon} ${r.name}** — ${r.why}. Da clic para empezar 🤗`;
        }
        setMoodPhase('encouraging', 'pointing', `${info.emoji} ${info.label} — justo lo que necesitas.${extra}\n\n¿Entramos?`);
      }, 1100);
    }
  };

  const analyzeFeelings = (text: string): { key: string; word: string } | null => {
    const lower = text.toLowerCase();
    for (const [word, key] of Object.entries(KEYWORDS)) {
      if (lower.includes(word)) { return { key, word }; }
    }
    return null;
  };

  const handleReply = (text: string) => {
    setShowBubble(false);
    if (phase === 'checking' || phase === 'encouraging') {
      const feeling = analyzeFeelings(text);
      if (feeling) { flyToSection(feeling.key, feeling.word); return; }
      setMoodPhase('happy', 'bubble', `Me alegra 😊 ¿Quieres escribir en tu diario o prefieres hablar un rato?`);
      return;
    }
    const feeling = analyzeFeelings(text);
    if (feeling) { flyToSection(feeling.key, feeling.word); return; }
    setMoodPhase('happy', 'bubble', 'Qué bien 😊 Cuéntame más, ¿cómo va tu día?');
  };

  const handleReturnFromSection = async (sectionKey: string) => {
    guidedRef.current = null;
    setGuidedSection(null);

    await delay(800);

    // Check what they actually did via API
    const section = SECTIONS[sectionKey];
    let done = false;
    try {
      if (sectionKey === 'ejercicios') {
        const h = await api.exercises.history();
        done = h.length > 0;
      } else if (sectionKey === 'diario') {
        const e = await api.diary.list();
        done = e.length > 0;
      } else {
        done = true; // comunidad/chat always count as participating
      }
    } catch { done = false; }

    if (done) {
      const praises = ENCOURAGE[sectionKey] || ['¡Muy bien! 🌟'];
      const praise = praises[Math.floor(Math.random() * praises.length)];
      setMoodPhase('celebrating', 'encouraging', `🎉 ${praise}\n\n¿Cómo te sientes ahora?`);
    } else {
      setMoodPhase('checking', 'checking', `¿Cómo te fue en ${section?.label}? Cuéntame 💬`);
    }
  };

  const handleQuickReply = (reply: string) => handleReply(reply);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !convId || sending) return;
    setSending(true);
    const text = input;
    setInput('');
    setShowBubble(false);

    if (phase === 'checking' || phase === 'encouraging') {
      handleReply(text);
      setSending(false);
      return;
    }
    const feeling = analyzeFeelings(text);
    if (feeling) { flyToSection(feeling.key, feeling.word); setSending(false); return; }
    try {
      const res = await api.chat.send(convId, text);
      setMsg(res.assistant.content);
      speak(res.assistant.content);
    } catch { setMsg('Error. Intenta de nuevo.'); }
    setShowBubble(true);
    setSending(false);
  };

  const goToSection = () => {
    const key = guidedSection || guidedRef.current;
    if (key && SECTIONS[key]) router.push(SECTIONS[key].href);
  };

  const reopen = () => {
    setPos({ x: window.innerWidth - 250, y: window.innerHeight - 380 });
    setMoodPhase('greeting', 'bubble', '¡Hola! ¿Cómo estás ahora? 🌟');
  };

  const dismiss = () => {
    setShowBubble(false);
    setTimeout(() => setPhase('idle'), 300);
  };

  if (!user) return null;

  const st = MOODS[mood];
  const isFlying = phase === 'entering' || phase === 'flying';
  const isMinimized = phase === 'idle';
  const primaryColor = st.gradient.match(/#[a-f0-9]{6}/i)?.[0] || '#ffffff';
  const colors = st.gradient.match(/#[a-f0-9]{6}/gi) || [];
  const secondaryColor = colors[1] || primaryColor;

  if (isMinimized) {
    return (
      <button onClick={reopen} style={{
        position: 'fixed', bottom: 80, right: 20, zIndex: 200,
        width: 48, height: 48, borderRadius: 14,
        background: st.gradient, border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, animation: 'robotFloat 2.5s ease-in-out infinite',
      }}>
        🤖
      </button>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 200,
        pointerEvents: isFlying ? 'none' : 'auto',
        transform: `scale(${scale})`,
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'center center',
      }}>
        {sparkles.map(s => (
          <div key={s.id} style={{
            position: 'absolute', left: s.x, top: s.y, width: 4, height: 4,
            borderRadius: '50%', background: '#ffffff',
            opacity: 0, animation: `sparkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`, filter: 'blur(1px)',
          }} />
        ))}

        {showBubble && (
          <div style={{
            position: 'absolute', bottom: 84, right: -10, width: 300,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(20px)', borderRadius: 20, padding: '18px 20px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(255,255,255,0.05)',
            animation: 'bubbleIn 0.35s ease',
          }}>
            <button onClick={() => { setVoiceEnabled(v => { const nv = !v; if (!nv && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); return nv; }); }}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12, padding: '2px 6px', cursor: 'pointer' }}>
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <div style={{ position: 'absolute', bottom: -8, right: 32, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid rgba(0,0,0,0.75)' }} />
            
            <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.6, margin: '0 0 14px 0', whiteSpace: 'pre-wrap', paddingRight: 28 }}>{msg}</p>
            
            {/* Greeting quick replies */}
            {(phase === 'bubble' && mood === 'greeting') && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { text: '😊 Bien', val: 'Estoy bien feliz' },
                  { text: '😔 Mal', val: 'Estoy mal triste' },
                  { text: '😰 Ansiedad', val: 'Tengo ansiedad' },
                  { text: '😤 Estrés', val: 'Estoy estresado' },
                  { text: '💬 Hablar', val: 'Quiero conversar' },
                ].map(b => (
                  <button key={b.val} onClick={() => handleQuickReply(b.val)}
                    style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {b.text}
                  </button>
                ))}
              </div>
            )}

            {/* Chat input for non-greeting phases */}
            {phase === 'bubble' && mood !== 'greeting' && (
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 6 }}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe algo..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', fontSize: 12, outline: 'none' }} />
                <button type="submit" disabled={sending || !input.trim()}
                  style={{ background: '#ffffff', color: '#000', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {sending ? '...' : '→'}
                </button>
              </form>
            )}

            {/* Checking/encouraging follow-up quick replies */}
            {(phase === 'checking' || phase === 'encouraging') && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { text: '😊 Mejor', val: 'Me siento mejor gracias' },
                  { text: '😔 Igual', val: 'Sigo igual' },
                  { text: '😰 Peor', val: 'Peor tengo ansiedad' },
                  { text: '💬 Hablar', val: 'Quiero conversar' },
                ].map(b => (
                  <button key={b.val} onClick={() => handleQuickReply(b.val)}
                    style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    {b.text}
                  </button>
                ))}
              </div>
            )}

            {/* Pointing: go button */}
            {phase === 'pointing' && guidedSection && SECTIONS[guidedSection] && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={goToSection}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 12, background: '#ffffff', color: '#000', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,255,255,0.2)' }}>
                  {SECTIONS[guidedSection]!.emoji} Ir a {SECTIONS[guidedSection]!.label}
                </button>
                <button onClick={dismiss}
                  style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Robot body — SVG full-body */}
        <div onClick={() => setShowBubble(!showBubble)} style={{
          cursor: 'pointer', width: 48, height: 70,
          animation: isFlying ? 'flyBounce 1s ease-in-out infinite' : 'robotFloat 3s ease-in-out infinite, headSway 4s ease-in-out infinite',
          filter: `drop-shadow(0 ${isFlying ? 10 : 4}px ${isFlying ? 50 : 24}px ${st.glow})`,
        }}>
          <svg width="48" height="70" viewBox="0 0 48 70" style={{ display: 'block' }}>
            <defs>
              <linearGradient id={`bg-${primaryColor.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </linearGradient>
              <linearGradient id="chestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a3a3a3" />
              </linearGradient>
            </defs>

            {/* Antenna */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-2 24 6;2 24 6;-2 24 6" dur="2.5s" repeatCount="indefinite" />
              <line x1="24" y1="6" x2="24" y2="1" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="24" cy="1" r="2.5" fill={primaryColor} opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* Head group with subtle sway */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-1 24 22;1 24 22;-1 24 22" dur="4s" repeatCount="indefinite" />
              
              {/* Head */}
              <rect x="6" y="6" width="36" height="32" rx="8" ry="8" fill={`url(#bg-${primaryColor.replace('#','')})`} stroke={primaryColor} strokeWidth="0.5" opacity="0.92" />
              <rect x="8" y="8" width="32" height="7" rx="3.5" ry="3.5" fill="rgba(255,255,255,0.08)" />

              {/* Eyes */}
              {(mood === 'greeting' || mood === 'listening') && (
                <><circle cx="16" cy="20" r="4.5" fill="white" /><circle cx="32" cy="20" r="4.5" fill="white" /><circle cx="16" cy="20" r="2.5" fill="#1a1a2e" /><circle cx="32" cy="20" r="2.5" fill="#1a1a2e" /><circle cx="15" cy="19" r="1" fill="white" opacity="0.8" /><circle cx="31" cy="19" r="1" fill="white" opacity="0.8">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
                </circle></>
              )}
              {mood === 'happy' && (
                <><path d="M 13 19 Q 16 16 19 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M 29 19 Q 32 16 35 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></>
              )}
              {mood === 'sad' && (
                <><circle cx="16" cy="20" r="4.5" fill="white" /><circle cx="32" cy="20" r="4.5" fill="white" /><circle cx="16.5" cy="21" r="2.5" fill="#1a1a2e" /><circle cx="32.5" cy="21" r="2.5" fill="#1a1a2e" /><path d="M 14 25 Q 13 28 15 29" stroke="#60a5fa" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
                </path><path d="M 34 26 Q 33 29 35 30" stroke="#60a5fa" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.3s" repeatCount="indefinite" />
                </path></>
              )}
              {mood === 'anxious' && (
                <g>
                  <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0;0,1;0,0" dur="0.6s" repeatCount="indefinite" />
                  <circle cx="15" cy="20" r="5.5" fill="white" /><circle cx="33" cy="20" r="5.5" fill="white" /><circle cx="15" cy="20" r="2" fill="#1a1a2e" /><circle cx="33" cy="20" r="2" fill="#1a1a2e" /><path d="M 37 12 Q 39 15 37 17 Q 35 15 37 12Z" fill="#60a5fa" opacity="0.7" />
                </g>
              )}
              {mood === 'checking' && (
                <><circle cx="16" cy="20" r="4.5" fill="white" /><circle cx="32" cy="20" r="4.5" fill="white" /><circle cx="16" cy="20" r="2.5" fill="#1a1a2e" /><circle cx="32" cy="20" r="2.5" fill="#1a1a2e" /><circle cx="15" cy="19" r="1" fill="white" opacity="0.8" /><circle cx="31" cy="19" r="1" fill="white" opacity="0.8" /><path d="M 13 15 Q 16 13 19 15" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8" /></>
              )}
              {(mood === 'encouraging' || mood === 'celebrating') && (
                <><circle cx="16" cy="20" r="4.5" fill="white" /><circle cx="32" cy="20" r="4.5" fill="white" /><circle cx="16" cy="20" r="2.5" fill="#1a1a2e" /><circle cx="32" cy="20" r="2.5" fill="#1a1a2e" /><text x="13" y="18" fontSize="5" fill="#fbbf24" opacity="0.9">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                </text><text x="29" y="18" fontSize="5" fill="#fbbf24" opacity="0.9">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                </text></>
              )}

              {/* Blush */}
              {(mood === 'greeting' || mood === 'happy' || mood === 'celebrating' || mood === 'encouraging') && (
                <><ellipse cx="10" cy="28" rx="3" ry="2" fill={primaryColor} opacity="0.25" /><ellipse cx="38" cy="28" rx="3" ry="2" fill={primaryColor} opacity="0.25" /></>
              )}

              {/* Mouth */}
              {(mood === 'greeting' || mood === 'listening') && <path d="M 19 27 Q 24 30 29 27" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
              {mood === 'happy' && <path d="M 16 27 Q 24 33 32 27" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
              {mood === 'sad' && <path d="M 19 30 Q 24 27 29 30" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
              {mood === 'anxious' && <path d="M 18 29 Q 21 27 24 29 Q 27 31 30 29" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
              {mood === 'encouraging' && <path d="M 18 27 Q 24 31 30 27" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
              {mood === 'celebrating' && <path d="M 18 28 Q 21 24 24 28 Q 27 32 30 28" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
              {mood === 'checking' && <path d="M 21 28 Q 24 30 27 28" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
            </g>

            {/* Neck */}
            <rect x="20" y="38" width="8" height="4" rx="2" fill={primaryColor} opacity="0.5" />

            {/* Body group with subtle breathing */}
            <g>
              <animateTransform attributeName="transform" type="scale" values="1,1;1.02,1.01;1,1" dur="3s" repeatCount="indefinite" additive="sum" />
              <animateTransform attributeName="transform" type="translate" values="0,0;0,-0.5;0,0" dur="3s" repeatCount="indefinite" additive="sum" />

              {/* Body */}
              <rect x="11" y="42" width="26" height="18" rx="5" ry="5" fill={`url(#bg-${primaryColor.replace('#','')})`} stroke={primaryColor} strokeWidth="0.5" opacity="0.85" />
              <rect x="14" y="45" width="20" height="12" rx="3" ry="3" fill="rgba(255,255,255,0.07)" />

              {/* Heart on chest */}
              <path d="M 24 47 C 24 47 21 44 18 47 C 15 50 24 56 24 56 C 24 56 33 50 30 47 C 27 44 24 47 24 47Z" fill="url(#chestGrad)" opacity="0.9">
                <animate attributeName="d" values="M 24 47 C 24 47 21 44 18 47 C 15 50 24 56 24 56 C 24 56 33 50 30 47 C 27 44 24 47 24 47Z;M 24 46 C 24 46 20 43 17 46 C 14 49 24 57 24 57 C 24 57 34 49 31 46 C 28 43 24 46 24 46Z;M 24 47 C 24 47 21 44 18 47 C 15 50 24 56 24 56 C 24 56 33 50 30 47 C 27 44 24 47 24 47Z" dur="1.2s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Arms */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-4 4 48;4 4 48;-4 4 48" dur="2s" repeatCount="indefinite" />
              <rect x="4" y="46" width="7" height="4" rx="2" fill={`url(#bg-${primaryColor.replace('#','')})`} stroke={primaryColor} strokeWidth="0.5" opacity="0.8" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="4 44 48;-4 44 48;4 44 48" dur="2s" repeatCount="indefinite" />
              <rect x="37" y="46" width="7" height="4" rx="2" fill={`url(#bg-${primaryColor.replace('#','')})`} stroke={primaryColor} strokeWidth="0.5" opacity="0.8" />
            </g>

            {/* Legs */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="2 15 65;-2 15 65;2 15 65" dur="1.8s" repeatCount="indefinite" />
              <rect x="15" y="61" width="7" height="8" rx="3" fill={`url(#bg-${primaryColor.replace('#','')})`} stroke={primaryColor} strokeWidth="0.5" opacity="0.8" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-2 33 65;2 33 65;-2 33 65" dur="1.8s" repeatCount="indefinite" />
              <rect x="26" y="61" width="7" height="8" rx="3" fill={`url(#bg-${primaryColor.replace('#','')})`} stroke={primaryColor} strokeWidth="0.5" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>

      {phase === 'pointing' && guidedSection && (
        <style>{`
          [data-nav="${guidedSection}"] {
            background: rgba(255,255,255,0.15) !important;
            animation: pulseNav 1s ease-in-out infinite !important;
          }
          [data-nav="${guidedSection}"] span:first-child {
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.5)) !important;
          }
        `}</style>
      )}

      <style>{`
        @keyframes robotFloat { 0%,100% { transform: translateY(0px) rotate(0deg); } 30% { transform: translateY(-6px) rotate(-1deg); } 60% { transform: translateY(-3px) rotate(1deg); } 80% { transform: translateY(-8px) rotate(0deg); } }
        @keyframes flyBounce { 0%,100% { transform: translateY(0px) rotate(-2deg); } 25% { transform: translateY(-10px) rotate(0deg); } 50% { transform: translateY(-4px) rotate(2deg); } 75% { transform: translateY(-8px) rotate(0deg); } }
        @keyframes headSway { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }
        @keyframes bubbleIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes sparkle { 0%,100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes pulseNav { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </>
  );
}
