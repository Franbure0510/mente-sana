import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { hashPassword, comparePassword, generateToken } from '../auth';
import { registerSchema, loginSchema } from '@mentesana/shared';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ error: 'El email ya está registrado' });

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, nickname: data.nickname },
    });

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (err: any) {
    if (err.issues) return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Credenciales inválidas' });

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (err: any) {
    if (err.issues) return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
