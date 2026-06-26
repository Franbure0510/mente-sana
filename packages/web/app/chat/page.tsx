'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    loadConversations();
  }, [user, isLoading, router]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await api.chat.conversations();
      setConversations(convs);
      if (convs.length === 0) {
        const newConv = await api.chat.createConversation();
        setConversations([newConv]);
        setActiveConv(newConv.id);
      } else if (!activeConv) {
        setActiveConv(convs[0].id);
      }
    } catch {}
  };

  useEffect(() => {
    if (!activeConv) return;
    api.chat.messages(activeConv).then(setMessages).catch(() => {});
  }, [activeConv]);

  const newConversation = async () => {
    const conv = await api.chat.createConversation();
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv.id);
    setMessages([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    const text = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, id: 'temp-' + Date.now() }]);
    try {
      const res = await api.chat.send(activeConv, text);
      setMessages(prev => [...prev.filter(m => m.id !== res.user.id), res.user, res.assistant]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.', id: 'err-' + Date.now() }]);
    } finally { setSending(false); }
  };

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)', maxWidth: 720, margin: '0 auto', paddingBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 8 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>🤖 Chat de apoyo</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Asistente basado en TCC</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: showHistory ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
              color: showHistory ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
            📋 Historial
          </button>
          <button onClick={newConversation}
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(168,85,247,0.2)' }}>
            + Nueva
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {showHistory && (
          <div style={{ width: 200, flexShrink: 0, overflowY: 'auto' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Conversaciones</p>
            {conversations.map((c: any) => (
              <button key={c.id} onClick={() => { setActiveConv(c.id); setShowHistory(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: 12, borderRadius: 14, marginBottom: 6, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                  background: activeConv === c.id ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                  color: activeConv === c.id ? '#a855f7' : 'rgba(255,255,255,0.6)',
                }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, fontSize: 13 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                  {new Date(c.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <h3 style={{ fontWeight: 600, fontSize: 18, color: '#fff', marginBottom: 4 }}>Estoy aquí para escucharte</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Cuéntame qué te preocupa. Usaré técnicas de TCC para ayudarte.</p>
              </div>
            )}
            {messages.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{
                  maxWidth: '75%', padding: '14px 18px', borderRadius: 18,
                  background: m.role === 'user' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
                  color: m.role === 'user' ? '#fff' : 'rgba(255,255,255,0.7)',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                  <p style={{ fontSize: 11, color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', marginTop: 8, marginBottom: 0 }}>
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', animation: 'none', opacity: 0.4 }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe tu mensaje..." disabled={sending}
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 18px', fontSize: 14, outline: 'none' }} />
            <button type="submit" disabled={sending || !input.trim()}
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 24px', fontWeight: 600, fontSize: 14, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending || !input.trim() ? 0.5 : 1, boxShadow: '0 4px 12px rgba(168,85,247,0.2)' }}>
              {sending ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 12 }}>
        💡 Este chat usa principios de TCC pero no reemplaza la ayuda profesional.
      </p>
    </div>
  );
}
