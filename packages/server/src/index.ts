import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './auth';
import authRouter from './routes/auth';
import diaryRouter from './routes/diary';
import checkinRouter from './routes/checkin';
import exercisesRouter from './routes/exercises';
import communityRouter from './routes/community';
import chatRouter from './routes/chat';
import profileRouter from './routes/profile';
import webhookRouter from './routes/webhook';
import subscriptionRouter from './routes/subscription';

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(cors({
  origin: isProd
    ? (process.env.CORS_ORIGIN || 'https://tudominio.com').split(',').map(s => s.trim())
    : '*',
}));

const webhookApp = express();
webhookApp.use(express.raw({ type: 'application/json' }));
webhookApp.use('/', webhookRouter);
app.use('/api/webhook', webhookApp);

app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/diary', authMiddleware, diaryRouter);
app.use('/api/checkin', authMiddleware, checkinRouter);
app.use('/api/exercises', authMiddleware, exercisesRouter);
app.use('/api/community', authMiddleware, communityRouter);
app.use('/api/chat', authMiddleware, chatRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/subscription', authMiddleware, subscriptionRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: isProd ? 'Error interno del servidor' : err.message });
});

app.listen(PORT, () => console.log(`Servidor Mente Sana corriendo en puerto ${PORT}`));
