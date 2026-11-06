'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const POLL_MS = 180000; // 3 min

export default function FloatingAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [ready, setReady] = useState(false);
  const msgsEnd = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => { msgsEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Init: create fresh conversation + greeting
  useEffect(() => {
    if (!user || ready) return;
    (async () => {
      try {
        const title = `🤖 ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
        const conv = await api.chat.createConversation(title);
        setConvId(conv.id);
        // First greeting
        const res = await api.chat.proactive(conv.id);
        setMessages([res.message]);
        setHasNew(true);
        setReady(true);
      } catch (e) { console.error('Assistant init error:', e); setReady(true); }
    })();
  }, [user, ready]);

  // Poll for proactive messages
  useEffect(() => {
    if (!convId) return;
    const tick = async () => {
      if (busyRef.current) return;
      try {
        const res = await api.chat.proactive(convId);
        setMessages(prev => {
          if (prev.some(m => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        if (!isOpen) setHasNew(true);
      } catch {}
    };
    const t = setInterval(tick, POLL_MS);
    return () => clearInterval(t);
  }, [convId, isOpen]);

  const handleOpen = async () => {
    setIsOpen(true);
    setHasNew(false);
    if (convId) {
      try {
        const msgs = await api.chat.messages(convId);
        setMessages(msgs);
      } catch {}
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !convId || sending) return;
    busyRef.current = true;
    setSending(true);
    const text = input;
    setInput('');
    try {
      const res = await api.chat.send(convId, text);
      setMessages(prev => [...prev, res.user, res.assistant]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error. Intenta de nuevo.', id: 'e-' + Date.now() }]);
    } finally {
      setSending(false);
      setTimeout(() => { busyRef.current = false; }, 8000);
    }
  };

  if (!user) return null;

  return (
    <>
      <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        {isOpen && (
          <div style={{
            width: 360, height: 500, borderRadius: 20,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', margin: 0 }}>Asistente</p>
                <p style={{ fontSize: 11, color: 'rgba(16,185,129,0.7)', margin: 0 }}>● Conectado</p>
              </div>
              <button onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {messages.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    maxWidth: '85%', padding: '12px 16px', borderRadius: 16,
                    background: m.role === 'user' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                    color: m.role === 'user' ? '#000' : 'rgba(255,255,255,0.8)',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                    <p style={{ fontSize: 10, color: m.role === 'user' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)', margin: '6px 0 0 0' }}>
                      {new Date(m.createdAt || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={msgsEnd} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="Escribe algo..." disabled={sending}
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', fontSize: 13, outline: 'none' }} />
              <button type="submit" disabled={sending || !input.trim()}
                style={{ background: '#ffffff', color: '#000', border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 600, fontSize: 13, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending || !input.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                {sending ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        )}

        <button onClick={handleOpen}
          style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
          🤖
          {hasNew && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: '2px solid #08080f' }} />
          )}
        </button>
      </div>
    </>
  );
}
