import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nickname: z.string().min(2, 'Mínimo 2 caracteres').max(30),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const diaryEntrySchema = z.object({
  moodLevel: z.number().min(1).max(5),
  emotions: z.array(z.string()).min(1, 'Selecciona al menos una emoción'),
  thought: z.string().min(1, 'Escribe tu pensamiento'),
  rationalThought: z.string().optional(),
  gratitude: z.string().optional(),
});

export const checkInSchema = z.object({
  moodLevel: z.number().min(1).max(5),
  anxietyLevel: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24).optional(),
  notes: z.string().optional(),
});

export const communityPostSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  content: z.string().min(10, 'Mínimo 10 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
});

export const communityCommentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(500),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Mensaje requerido'),
  conversationId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DiaryEntryInput = z.infer<typeof diaryEntrySchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommunityCommentInput = z.infer<typeof communityCommentSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
