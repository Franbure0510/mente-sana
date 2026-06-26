import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { diaryEntrySchema } from '@mentesana/shared';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 50,
  });
  res.json(entries.map(e => ({ ...e, emotions: JSON.parse(e.emotions) })));
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = diaryEntrySchema.parse(req.body);
    const entry = await prisma.diaryEntry.create({
      data: {
        userId,
        moodLevel: data.moodLevel,
        emotions: JSON.stringify(data.emotions),
        thought: data.thought,
        rationalThought: data.rationalThought,
        gratitude: data.gratitude,
      },
    });
    res.json({ ...entry, emotions: JSON.parse(entry.emotions) });
  } catch (err: any) {
    if (err.issues) return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30,
  });

  const avgMood = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.moodLevel, 0) / entries.length
    : 0;

  const emotionCount: Record<string, number> = {};
  entries.forEach(e => {
    const emotions = JSON.parse(e.emotions) as string[];
    emotions.forEach(em => { emotionCount[em] = (emotionCount[em] || 0) + 1; });
  });

  res.json({ totalEntries: entries.length, avgMood: Math.round(avgMood * 10) / 10, emotionCount });
});

export default router;
