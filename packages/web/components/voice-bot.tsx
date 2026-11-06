'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const KEYWORDS: Record<string, { href: string; label: string }> = {
  diario: { href: '/diary', label: 'Diario' },
  ejercicio: { href: '/exercises', label: 'Ejercicios' },
  ejercicios: { href: '/exercises', label: 'Ejercicios' },
  respirar: { href: '/exercises', label: 'Ejercicios' },
  comunidad: { href: '/community', label: 'Comunidad' },
  chat: { href: '/chat', label: 'Chat' },
  hablar: { href: '/chat', label: 'Chat' },
  perfil: { href: '/profile', label: 'Perfil' },
  premium: { href: '/subscribe', label: 'Premium' },
};

function analyzeFeelings(text: string): { href: string; label: string } | null {
  const lower = text.toLowerCase();
  for (const [word, info] of Object.entries(KEYWORDS)) {
    if (lower.includes(word)) return info;
  }
  // emotional cues
  if (lower.includes('mal') || lower.includes('triste') || lower.includes('ansiedad') || lower.includes('estres') || lower.includes('nervios')) {
    return { href: '/exercises', label: 'Ejercicios' };
  }
  if (lower.includes('bien') || lower.includes('feliz') || lower.includes('mejor')) {
    return { href: '/diary', label: 'Diario' };
  }
  return null;
}

export default function VoiceBot() {
  const { user } = useAuth();
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const spokenRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  const speak = (text: string, onEnd?: () => void) => {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return; }
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
      if (onEnd) utter.onend = onEnd;
      window.speechSynthesis.speak(utter);
    } catch { onEnd?.(); }
  };

  useEffect(() => {
    if (!user || !enabled || spokenRef.current) return;
    spokenRef.current = true;

    const hour = new Date().getHours();
    const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    speak(`${saludo}. Soy Meta Bot. ¿Cómo te sientes hoy?`, () => {
      // Try to listen
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) {
        speak('Puedes navegar con el menú de abajo. Estoy aquí si me necesitas.');
        return;
      }
      try {
        const rec = new SR();
        rec.lang = 'es-ES';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e: any) => {
          const transcript = e.results?.[0]?.[0]?.transcript || '';
          const target = analyzeFeelings(transcript);
          if (target) {
            speak(`Te recomiendo ir a ${target.label}. Vamos allá.`, () => {
              router.push(target.href);
            });
          } else {
            speak('Gracias por compartir. Puedes ir al Diario, Ejercicios, Comunidad o Chat desde el menú de abajo.');
          }
        };
        rec.onerror = () => {
          speak('No pude escucharte, pero puedes navegar con el menú de abajo.');
        };
        recognitionRef.current = rec;
        try { rec.start(); } catch {}
      } catch {
        speak('Puedes navegar con el menú de abajo.');
      }
    });

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [user, enabled, router]);

  if (!user) return null;

  return (
    <button
      onClick={() => {
        setEnabled(v => {
          const nv = !v;
          if (!nv && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          if (!nv && recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
          }
          if (nv) spokenRef.current = false;
          return nv;
        });
      }}
      style={{
        position: 'fixed', bottom: 80, right: 20, zIndex: 200,
        width: 44, height: 44, borderRadius: 14,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff', fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
      aria-label={enabled ? 'Silenciar Meta Bot' : 'Activar Meta Bot'}
    >
      {enabled ? '🎙️' : '🔇'}
    </button>
  );
}
