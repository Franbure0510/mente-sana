'use client';
import { useRef, useState, useEffect } from 'react';
export function FadingVideo({ src, className, style }: { src: string | string[]; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [idx, setIdx] = useState(0);
  const sources = Array.isArray(src) ? src : [src];
  const current = sources[idx];
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let raf = 0;
    const fadeIn = () => {
      v.style.opacity = '0';
      let o = 0;
      const step = () => { o += 0.05; if (v) v.style.opacity = String(Math.min(o, 1)); if (o < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    const fadeOut = () => {
      let o = parseFloat(v.style.opacity) || 1;
      const step = () => { o -= 0.036; if (v) v.style.opacity = String(Math.max(o, 0)); if (o > 0) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    const onLoaded = () => { v.style.opacity = '0'; fadeIn(); };
    const onTime = () => { if (v.duration && v.duration - v.currentTime <= 0.55) fadeOut(); };
    const onEnded = () => { if (sources.length === 1) { v.currentTime = 0; v.play(); fadeIn(); } else setIdx(i => (i + 1) % sources.length); };
    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    if (v.readyState >= 2) fadeIn();
    return () => { cancelAnimationFrame(raf); v.removeEventListener('loadeddata', onLoaded); v.removeEventListener('timeupdate', onTime); v.removeEventListener('ended', onEnded); };
  }, [idx, sources.length]);
  return <video ref={ref} src={current} autoPlay muted playsInline preload="auto" className={className} style={{ opacity: 0, ...style }} />;
}
