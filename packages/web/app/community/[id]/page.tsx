'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

export default function PostDetail() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user || !params.id) return;
    api.community.get(params.id as string).then(setPost).catch(() => router.push('/community'));
  }, [user, isLoading, router, params.id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.community.comment(params.id as string, { content: comment });
    setComment('');
    const updated = await api.community.get(params.id as string);
    setPost(updated);
  };

  if (isLoading || !post) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto px-6 md:px-8 pt-10 pb-28">
        <motion.button {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} onClick={() => router.push('/community')} className="liquid-glass rounded-full px-4 py-2 text-xs font-medium text-white/60 hover:text-white font-body flex items-center gap-2 mb-6 cursor-pointer transition-colors">
          ← Volver a la comunidad
        </motion.button>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="liquid-glass-strong rounded-[1.25rem] p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="liquid-glass rounded-full px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 font-body">{post.category}</span>
            <span className="text-xs text-white/35 font-body">{post.anonymousId}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs text-white/35 font-body">
              {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="font-heading italic text-[1.9rem] md:text-[2.2rem] leading-[0.95] tracking-[-0.8px] text-white">{post.title}</h1>
          <div className="h-px bg-white/[0.06] my-5" />
          <p className="text-[15px] leading-7 text-white/65 font-body font-light whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
            <span className="liquid-glass rounded-full px-3.5 py-1.5 text-xs text-white/50 font-body flex items-center gap-1.5">♥ {post._count?.likes ?? post.likes?.length ?? 0}</span>
            <span className="liquid-glass rounded-full px-3.5 py-1.5 text-xs text-white/50 font-body flex items-center gap-1.5">💬 {post.comments?.length || 0}</span>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading italic text-xl tracking-[-0.3px] text-white">Comentarios</h2>
            <span className="liquid-glass rounded-full px-3 py-1 text-xs text-white/50 font-body">{post.comments?.length || 0}</span>
          </div>

          <form onSubmit={handleComment} className="liquid-glass rounded-[1.25rem] p-3 flex gap-3 mb-6">
            <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Escribe un comentario..." required
              className="flex-1 !bg-white/[0.04] !border-white/10 rounded-full px-5 py-3 text-sm placeholder:text-white/30 focus:!border-white/20" />
            <button type="submit" className="bg-white text-black rounded-full px-6 py-3 font-medium text-sm font-body hover:bg-white/90 transition-colors cursor-pointer shrink-0">
              Enviar
            </button>
          </form>

          <AnimatePresence>
            {post.comments?.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="liquid-glass rounded-[1.25rem] p-8 text-center">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm text-white/40 font-body">Sé el primero en comentar</p>
                <p className="text-xs text-white/25 font-body mt-1">Tu apoyo puede marcar la diferencia</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {post.comments?.map((c: any, i: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.18 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
                className="liquid-glass rounded-[1.25rem] p-5"
              >
                <div className="flex items-center gap-2 text-xs font-body mb-2">
                  <span className="liquid-glass-strong rounded-full px-2.5 py-1 text-[11px] text-white/70 font-medium">{c.anonymousId}</span>
                  <span className="text-white/25">· {new Date(c.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </div>
                <p className="text-sm text-white/65 font-body font-light leading-relaxed">{c.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.38 }} className="text-center pt-8 mt-8 border-t border-white/[0.06]">
          <p className="text-[11px] tracking-wide text-white/30 font-body">💚 Espacio moderado — comparte con empatía</p>
        </motion.div>
      </div>
    </div>
  );
}
