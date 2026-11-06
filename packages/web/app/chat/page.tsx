'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

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
    try {
      const res = await api.chat.send(activeConv, text);
      setMessages(prev => [...prev, res.user, res.assistant]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.', id: 'err-' + Date.now() }]);
    } finally { setSending(false); }
  };

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1120px] mx-auto px-6 md:px-10 lg:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 font-body mb-2">Asistente basado en TCC · 24/7</p>
            <h1 className="font-heading italic text-[2.6rem] md:text-[3.4rem] leading-[0.9] tracking-[-1.5px] text-white">Chat de apoyo</h1>
            <p className="font-body text-sm text-white/50 mt-2 font-light max-w-[48ch]">Un espacio seguro y anónimo. Habla con calma, sin juicio.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowHistory(!showHistory)} className={`rounded-full px-4 py-2.5 text-xs font-medium font-body cursor-pointer transition-all ${showHistory ? 'bg-white text-black' : 'liquid-glass text-white/70 hover:text-white'}`}>
              {showHistory ? 'Ocultar historial' : 'Historial'}
            </button>
            <button onClick={newConversation} className="bg-white text-black rounded-full px-5 py-2.5 text-xs font-semibold font-body hover:bg-white/90 transition-colors cursor-pointer">
              + Nueva
            </button>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="flex gap-4 min-h-0">
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, x: -16, filter: 'blur(8px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -16, filter: 'blur(8px)' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }} className="hidden md:flex w-[260px] shrink-0 liquid-glass rounded-[1.25rem] p-4 flex-col max-h-[68vh] overflow-hidden">
                <p className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body mb-3 px-1">Conversaciones</p>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
                  {conversations.length === 0 && <p className="text-xs text-white/30 font-body px-2 py-4">Sin conversaciones aún</p>}
                  {conversations.map((c: any) => (
                    <button key={c.id} onClick={() => setActiveConv(c.id)} className={`w-full text-left rounded-[1rem] px-3.5 py-3 transition-all cursor-pointer border ${activeConv === c.id ? 'liquid-glass-strong border-white/20' : 'liquid-glass border-transparent hover:border-white/10'}`}>
                      <div className={`text-[13px] font-medium font-body truncate ${activeConv === c.id ? 'text-white' : 'text-white/70'}`}>{c.title || 'Conversación'}</div>
                      <div className="text-[11px] text-white/30 font-body mt-1">{new Date(c.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showHistory && (
            <div className="md:hidden fixed inset-0 z-40 flex">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="relative w-[280px] bg-black border-r border-white/10 p-6 overflow-y-auto">
                <p className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body mb-4">Conversaciones</p>
                {conversations.map((c: any) => (
                  <button key={c.id} onClick={() => { setActiveConv(c.id); setShowHistory(false); }} className={`w-full text-left rounded-[1rem] px-4 py-3 mb-2 ${activeConv === c.id ? 'bg-white text-black' : 'liquid-glass text-white/70'}`}>
                    <div className="text-[13px] font-medium truncate">{c.title}</div>
                    <div className="text-[11px] opacity-60 mt-1">{new Date(c.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                  </button>
                ))}
              </motion.div>
            </div>
          )}

          <div className="flex-1 liquid-glass-strong rounded-[1.25rem] flex flex-col overflow-hidden min-h-[58vh] md:min-h-[62vh] max-h-[72vh]">
            <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-16 md:py-20">
                  <div className="liquid-glass w-16 h-16 rounded-[1rem] flex items-center justify-center text-2xl mx-auto mb-4">💬</div>
                  <h3 className="font-heading italic text-xl text-white">Estoy aquí para escucharte</h3>
                  <p className="text-sm text-white/50 font-body font-light mt-2 max-w-[36ch] mx-auto">Cuéntame qué te preocupa. Usaré técnicas de TCC para acompañarte, sin juicio.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Me siento ansioso', 'No puedo dormir', 'Tuve un mal día'].map(t => (
                      <button key={t} onClick={() => setInput(t)} className="liquid-glass rounded-full px-3.5 py-1.5 text-xs text-white/60 hover:text-white font-body cursor-pointer">“{t}”</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.role === 'user' ? 'bg-white text-black rounded-[1.25rem] rounded-br-md' : 'liquid-glass text-white/90 rounded-[1.25rem] rounded-bl-md'} max-w-[78%] px-4 md:px-5 py-3.5`}>
                    <p className="text-[13.5px] leading-[1.65] font-body whitespace-pre-wrap">{m.content}</p>
                    <p className={`text-[10px] font-body mt-2 ${m.role === 'user' ? 'text-black/40' : 'text-white/25'}`}>{new Date(m.createdAt || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="liquid-glass rounded-[1.25rem] rounded-bl-md px-5 py-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-white/[0.06] flex gap-2 md:gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe tu mensaje..." disabled={sending} className="flex-1 !bg-white/[0.06] !border-white/10 !rounded-full !py-3.5 !px-5 text-[14px] font-body placeholder:text-white/30 focus:!border-white/20" />
              <button type="submit" disabled={sending || !input.trim()} className="bg-white text-black rounded-full px-6 md:px-7 py-3.5 font-semibold text-sm font-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shrink-0">
                {sending ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        </motion.div>

        <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="text-center text-[11px] tracking-wide text-white/30 font-body mt-6">
          Este chat usa principios de TCC pero no reemplaza la ayuda profesional. Si estás en crisis, ve a tu perfil → Líneas de ayuda.
        </motion.p>
      </div>
    </div>
  );
}
