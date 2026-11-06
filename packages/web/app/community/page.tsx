'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { COMMUNITY_CATEGORIES } from '@mentesana/shared';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

export default function CommunityPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState('General');

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    loadPosts();
  }, [user, isLoading, router, category]);

  const loadPosts = async () => {
    const data = await api.community.posts(category === 'all' ? undefined : category);
    setPosts(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.community.create({ title, content, category: postCategory });
    setShowNew(false); setTitle(''); setContent('');
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    await api.community.like(postId);
    loadPosts();
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

      <div className="relative z-10 max-w-[640px] mx-auto px-6 md:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 font-body mb-2">Comunidad · Espacio seguro</p>
            <h1 className="font-heading italic text-[2.4rem] md:text-[3rem] leading-[0.9] tracking-[-1.2px] text-white">Comunidad</h1>
            <p className="font-heading italic text-lg md:text-xl text-white/60 tracking-[-0.3px] -mt-1">historias que acompañan</p>
            <p className="text-sm text-white/45 font-body font-light mt-3 max-w-[36ch]">Comparte y lee experiencias de forma anónima. Tu voz puede ayudar a alguien más.</p>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium font-body cursor-pointer transition-all ${showNew ? 'liquid-glass text-white/70 hover:text-white' : 'bg-white text-black hover:bg-white/90'}`}
          >
            {showNew ? '✕ Cancelar' : '+ Nuevo post'}
          </button>
        </motion.div>

        <AnimatePresence>
          {showNew && (
            <motion.form
              key="new-post"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
              onSubmit={handleCreate}
              className="liquid-glass-strong rounded-[1.25rem] p-6 md:p-7 mb-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="liquid-glass w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0">✍️</div>
                <div>
                  <h3 className="font-heading italic text-xl leading-none tracking-[-0.5px] text-white">Crear publicación</h3>
                  <p className="text-xs text-white/50 font-body mt-1">Se publicará de forma anónima</p>
                </div>
              </div>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de tu publicación" required className="w-full mb-3 !bg-white/[0.04] !border-white/10 rounded-2xl px-4 py-3.5 text-sm placeholder:text-white/30 focus:!border-white/20" />
              <div className="flex gap-2 flex-wrap mb-3">
                {COMMUNITY_CATEGORIES.map(c => (
                  <button key={c} type="button" onClick={() => setPostCategory(c)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium font-body cursor-pointer transition-all border ${postCategory === c ? 'bg-white text-black border-white' : 'liquid-glass text-white/60 border-transparent hover:border-white/15 hover:text-white'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Comparte tu experiencia..." required rows={5} className="w-full min-h-[120px] mb-4 !bg-white/[0.04] !border-white/10 rounded-2xl px-4 py-3.5 text-sm placeholder:text-white/30 focus:!border-white/20 resize-y font-body" />
              <button type="submit" className="bg-white text-black rounded-full px-7 py-3 font-medium text-[15px] font-body hover:bg-white/90 transition-colors cursor-pointer w-full md:w-auto">
                ✨ Publicar anónimamente
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="flex gap-2 overflow-x-auto scrollbar-none mb-6 pb-1 -mx-1 px-1">
          <button onClick={() => setCategory('all')}
            className={`rounded-full px-5 py-2 text-xs font-medium font-body whitespace-nowrap cursor-pointer transition-all border shrink-0 ${category === 'all' ? 'bg-white text-black border-white' : 'liquid-glass text-white/60 border-transparent hover:border-white/15 hover:text-white'}`}>
            Todas
          </button>
          {COMMUNITY_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`rounded-full px-5 py-2 text-xs font-medium font-body whitespace-nowrap cursor-pointer transition-all border shrink-0 ${category === c ? 'bg-white text-black border-white' : 'liquid-glass text-white/60 border-transparent hover:border-white/15 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </motion.div>

        <div>
          {posts.length === 0 && (
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }} className="liquid-glass rounded-[1.25rem] p-10 md:p-12 text-center">
              <div className="liquid-glass-strong w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">💭</div>
              <h3 className="font-heading italic text-xl text-white tracking-[-0.3px]">Sé el primero en compartir</h3>
              <p className="text-sm text-white/45 font-body font-light mt-2">Tu experiencia puede ayudar a alguien más</p>
            </motion.div>
          )}
          <div className="space-y-3">
            {posts.map((post: any, i: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.14 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
                className="liquid-glass rounded-[1.25rem] p-5 md:p-6 group hover:scale-[1.01] transition-transform"
              >
                <Link href={`/community/${post.id}`} className="block">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="liquid-glass-strong rounded-full px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 font-body">{post.category}</span>
                    <span className="text-[11px] text-white/35 font-body">{post.anonymousId}</span>
                    <span className="text-[11px] text-white/25 font-body">· {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <h3 className="font-heading italic text-[1.35rem] leading-tight tracking-[-0.4px] text-white group-hover:text-white/90 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-white/50 font-body font-light leading-relaxed mt-2 line-clamp-2">{post.content}</p>
                </Link>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.06] text-xs font-body">
                  <button onClick={() => handleLike(post.id)} className="liquid-glass rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-white/60 hover:text-white cursor-pointer transition-colors">
                    <span className="text-[13px]">♥</span> {post._count?.likes || 0}
                  </button>
                  <span className="liquid-glass rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-white/40">
                    💬 {post._count?.comments || 0}
                  </span>
                  <Link href={`/community/${post.id}`} className="ml-auto text-white/30 hover:text-white/70 transition-colors text-xs tracking-wide">Leer más →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.38 }} className="text-center pt-8 mt-8 border-t border-white/[0.06]">
          <p className="text-[11px] tracking-wide text-white/30 font-body">💚 Comunidad moderada — respeto y anonimato siempre</p>
        </motion.div>
      </div>
    </div>
  );
}
