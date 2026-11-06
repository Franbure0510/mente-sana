'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
export function BlurText({ text, className }: { text: string; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const words = text.split(' ');
  return (
    <div ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}>
      {words.map((w, i) => (
        <motion.span key={i} style={{ display: 'inline-block', marginRight: '0.28em' }} initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }} animate={visible ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}>{w}</motion.span>
      ))}
    </div>
  );
}
