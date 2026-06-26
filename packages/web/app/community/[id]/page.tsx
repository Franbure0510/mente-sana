'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

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

  if (isLoading || !post) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px 16px' }}>
      <button onClick={() => router.push('/community')} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Volver a la comunidad
      </button>

      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 28, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{post.category}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{post.anonymousId}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{post.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 15 }}>{post.content}</p>
      </div>

      <div>
        <h2 style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          💬 Comentarios <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>({post.comments?.length || 0})</span>
        </h2>

        <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Escribe un comentario..." required
            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 16px', fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(168,85,247,0.25)' }}>
            Enviar
          </button>
        </form>

        {post.comments?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            <p>Sé el primero en comentar</p>
          </div>
        )}

        {post.comments?.map((c: any) => (
          <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, marginBottom: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{c.anonymousId}</span>
              <span>{new Date(c.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
