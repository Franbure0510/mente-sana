import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const exercises = await prisma.exercise.findMany({
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  res.json(exercises);
});

router.get('/:id', async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.findUnique({
    where: { id: req.params.id },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  if (!exercise) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.json(exercise);
});

router.post('/:id/complete', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { moodBefore, moodAfter, notes } = req.body;
  const session = await prisma.exerciseSession.create({
    data: { userId, exerciseId: req.params.id, moodBefore, moodAfter, notes },
  });
  res.json(session);
});

router.get('/history/mine', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const sessions = await prisma.exerciseSession.findMany({
    where: { userId },
    include: { exercise: true },
    orderBy: { completedAt: 'desc' },
    take: 20,
  });
  res.json(sessions);
});

export default router;
