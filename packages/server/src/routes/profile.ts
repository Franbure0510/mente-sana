import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nickname: true, streakDays: true, lastActiveAt: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkinToday = await prisma.dailyCheckIn.findFirst({
    where: { userId, date: { gte: today } },
  });

  const exerciseCount = await prisma.exerciseSession.count({ where: { userId } });
  const diaryCount = await prisma.diaryEntry.count({ where: { userId } });

  res.json({ ...user, checkinToday: !!checkinToday, exerciseCount, diaryCount });
});

router.patch('/', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'Nickname requerido' });
  const user = await prisma.user.update({
    where: { id: userId },
    data: { nickname },
    select: { id: true, email: true, nickname: true },
  });
  res.json(user);
});

router.post('/streak', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const now = new Date();
  const lastActive = user.lastActiveAt;
  let streakDays = user.streakDays;

  if (lastActive) {
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return res.json({ streakDays });
    } else if (diffDays === 1) {
      streakDays += 1;
    } else {
      streakDays = 1;
    }
  } else {
    streakDays = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streakDays, lastActiveAt: now },
  });

  res.json({ streakDays });
});

router.get('/resources', async (_req: Request, res: Response) => {
  const resources = await prisma.resource.findMany();
  res.json(resources);
});

export default router;
