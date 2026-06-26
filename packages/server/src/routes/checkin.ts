import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { checkInSchema } from '@mentesana/shared';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = checkInSchema.parse(req.body);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.dailyCheckIn.findFirst({
      where: { userId, date: { gte: today } },
    });

    if (existing) {
      const checkin = await prisma.dailyCheckIn.update({
        where: { id: existing.id },
        data: { moodLevel: data.moodLevel, anxietyLevel: data.anxietyLevel, sleepHours: data.sleepHours, notes: data.notes },
      });
      return res.json(checkin);
    }

    const checkin = await prisma.dailyCheckIn.create({
      data: { userId, ...data, date: today },
    });
    res.json(checkin);
  } catch (err: any) {
    if (err.issues) return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/today', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkin = await prisma.dailyCheckIn.findFirst({
    where: { userId, date: { gte: today } },
  });
  res.json(checkin);
});

router.get('/history', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const checkins = await prisma.dailyCheckIn.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30,
  });
  res.json(checkins);
});

export default router;
