import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { communityPostSchema, communityCommentSchema } from '@mentesana/shared';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

const router = Router();

function generateAnonymousId(userId: string): string {
  return 'Anon_' + crypto.createHash('md5').update(userId).digest('hex').slice(0, 8);
}

router.get('/posts', async (req: Request, res: Response) => {
  const { category } = req.query;
  const where: any = {};
  if (category && category !== 'all') where.category = category;

  const posts = await prisma.communityPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { comments: true, likes: true } },
    },
  });
  res.json(posts);
});

router.post('/posts', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = communityPostSchema.parse(req.body);
    const anonymousId = generateAnonymousId(userId);
    const post = await prisma.communityPost.create({
      data: { ...data, anonymousId, userId },
    });
    res.json(post);
  } catch (err: any) {
    if (err.issues) return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/posts/:id', async (req: Request, res: Response) => {
  const post = await prisma.communityPost.findUnique({
    where: { id: req.params.id },
    include: {
      comments: { orderBy: { createdAt: 'asc' } },
      _count: { select: { comments: true, likes: true } },
    },
  });
  if (!post) return res.status(404).json({ error: 'Post no encontrado' });
  res.json(post);
});

router.post('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = communityCommentSchema.parse(req.body);
    const anonymousId = generateAnonymousId(userId);
    const comment = await prisma.communityComment.create({
      data: { postId: req.params.id, content: data.content, anonymousId, userId },
    });
    res.json(comment);
  } catch (err: any) {
    if (err.issues) return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/posts/:id/like', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const postId = req.params.id;
  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });
  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } });
    res.json({ liked: false });
  } else {
    await prisma.communityLike.create({ data: { postId, userId } });
    res.json({ liked: true });
  }
});

export default router;
