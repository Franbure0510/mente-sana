'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); router.push('/dashboard'); } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 h-screen w-screen bg-black p-3 md:p-4 font-inter z-40 overflow-hidden">
      <div className="w-full h-full rounded-2xl flex flex-col overflow-hidden relative bg-black">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover anim-fade" style={{ animationDelay: '0.2s' }} src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_120352_eb988725-1351-43b3-8095-16e4a1005e3d.mp4" />
        <div className="absolute inset-0 bg-black/40" />
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <Link href="/" className="anim-stagger flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>🌿</div>
            <span className="text-white text-[10px] md:text-xs tracking-[0.35em] mt-2 font-light">M E N T E &ensp; S A N A</span>
          </Link>
          <Link href="/" className="anim-stagger hidden md:block px-5 py-2.5 text-white text-sm btn-cut-border" style={{ animationDelay: '0.2s' }}><span>Volver al inicio</span></Link>
        </nav>
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8 overflow-auto">
          <div className="anim-stagger w-full max-w-[400px] rounded-2xl p-7 md:p-8" style={{ animationDelay: '0.4s', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="text-center mb-7">
              <h1 className="text-white text-2xl md:text-3xl font-medium tracking-tight">Bienvenido de nuevo</h1>
              <p className="text-white/50 text-sm mt-2">Inicia sesión para continuar tu camino</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>⚠️ {error}</div>}
              <div>
                <label className="text-white/60 text-xs tracking-wide mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="w-full !bg-white/10 !border-white/15 text-white placeholder:text-white/30 focus:!border-white/30" />
              </div>
              <div>
                <label className="text-white/60 text-xs tracking-wide mb-1.5 block">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required className="w-full !bg-white/10 !border-white/15 text-white placeholder:text-white/30 focus:!border-white/30" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors btn-cut flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <p className="text-center text-sm text-white/40 mt-6">¿No tienes cuenta? <Link href="/register" className="text-white font-medium hover:underline">Regístrate</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
