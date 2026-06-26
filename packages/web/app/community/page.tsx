'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { COMMUNITY_CATEGORIES } from '@mentesana/shared';
import Link from 'next/link';

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

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 8 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>💬 Comunidad</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Comparte y lee experiencias de forma anónima</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          style={{
            padding: '10px 20px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
            border: 'none',
            background: showNew ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: showNew ? 'rgba(255,255,255,0.5)' : '#fff',
            boxShadow: showNew ? 'none' : '0 4px 16px rgba(168,85,247,0.25)',
          }}>
          {showNew ? '✕ Cancelar' : '+ Nuevo post'}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 16 }}>
            ✍️ Crear publicación
          </h3>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de tu publicación" required style={{ width: '100%', marginBottom: 14, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {COMMUNITY_CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setPostCategory(c)}
                style={{
                  padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                  background: postCategory === c ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
                  color: postCategory === c ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>
                {c}
              </button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Comparte tu experiencia..." required style={{ width: '100%', minHeight: 120, marginBottom: 16, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          <button type="submit" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(168,85,247,0.25)' }}>
            ✨ Publicar anónimamente
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20 }}>
        <button onClick={() => setCategory('all')}
          style={{
            padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: category === 'all' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
            color: category === 'all' ? '#fff' : 'rgba(255,255,255,0.5)',
            boxShadow: category === 'all' ? '0 4px 16px rgba(168,85,247,0.25)' : 'none',
          }}>
          📋 Todas
        </button>
        {COMMUNITY_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{
              padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: category === c ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
              color: category === c ? '#fff' : 'rgba(255,255,255,0.5)',
              boxShadow: category === c ? '0 4px 16px rgba(168,85,247,0.25)' : 'none',
            }}>
            {c}
          </button>
        ))}
      </div>

      <div>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💭</div>
            <h3 style={{ fontWeight: 600, fontSize: 18, color: '#fff', marginBottom: 4 }}>Sé el primero en compartir</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Tu experiencia puede ayudar a alguien más</p>
          </div>
        )}
        {posts.map((post: any) => (
          <div key={post.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 22, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Link href={`/community/${post.id}`} style={{ textDecoration: 'none' }}>
              <h3 style={{ fontWeight: 600, fontSize: 16, color: '#fff', margin: '0 0 6px 0' }}>{post.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>{post.content}</p>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
              <span style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{post.category}</span>
              <span>{post.anonymousId}</span>
              <span>{new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              <button onClick={() => handleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.2s', background: 'none', border: 'none', fontSize: 12, marginLeft: 'auto' }}>
                ♥ {post._count?.likes || 0}
              </button>
              <span>💬 {post._count?.comments || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
