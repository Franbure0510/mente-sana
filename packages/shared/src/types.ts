export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Emotion {
  id: string;
  name: string;
  emoji: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string;
  moodLevel: MoodLevel;
  emotions: string[];
  thought: string;
  rationalThought?: string;
  gratitude?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'meditation' | 'cbt' | 'grounding' | 'relaxation';
  duration: number;
  icon: string;
  steps: ExerciseStep[];
  audioUrl?: string;
}

export interface ExerciseStep {
  order: number;
  instruction: string;
  duration: number;
}

export interface ExerciseSession {
  id: string;
  userId: string;
  exerciseId: string;
  completedAt: string;
  moodBefore?: MoodLevel;
  moodAfter?: MoodLevel;
  notes?: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  anonymousId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; likes: number };
}

export interface CommunityComment {
  id: string;
  postId: string;
  content: string;
  anonymousId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  moodLevel: MoodLevel;
  anxietyLevel: MoodLevel;
  sleepHours?: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
  streakDays: number;
  lastActiveDate?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'article' | 'video' | 'audio';
  url: string;
  tags: string[];
}
