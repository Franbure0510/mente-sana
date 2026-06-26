import express from 'express';
import cors from 'cors';
import { authMiddleware } from './auth';
import authRouter from './routes/auth';
import diaryRouter from './routes/diary';
import checkinRouter from './routes/checkin';
import exercisesRouter from './routes/exercises';
import communityRouter from './routes/community';
import chatRouter from './routes/chat';
import profileRouter from './routes/profile';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/diary', authMiddleware, diaryRouter);
app.use('/api/checkin', authMiddleware, checkinRouter);
app.use('/api/exercises', authMiddleware, exercisesRouter);
app.use('/api/community', authMiddleware, communityRouter);
app.use('/api/chat', authMiddleware, chatRouter);
app.use('/api/profile', authMiddleware, profileRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Servidor Mente Sana corriendo en puerto ${PORT}`));
