const API_BASE = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(err.error || 'Error del servidor');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: { email: string; password: string; nickname: string }) =>
      request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  diary: {
    list: () => request<any[]>('/diary'),
    create: (data: any) => request<any>('/diary', { method: 'POST', body: JSON.stringify(data) }),
    stats: () => request<any>('/diary/stats'),
  },
  checkin: {
    today: () => request<any>('/checkin/today'),
    create: (data: any) => request<any>('/checkin', { method: 'POST', body: JSON.stringify(data) }),
  },
  exercises: {
    list: () => request<any[]>('/exercises'),
    get: (id: string) => request<any>(`/exercises/${id}`),
    complete: (id: string, data: any) =>
      request<any>(`/exercises/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
    history: () => request<any[]>('/exercises/history/mine'),
  },
  community: {
    posts: (category?: string) => request<any[]>(`/community/posts${category ? `?category=${category}` : ''}`),
    create: (data: any) => request<any>('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<any>(`/community/posts/${id}`),
    comment: (postId: string, data: any) =>
      request<any>(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
    like: (postId: string) => request<any>(`/community/posts/${postId}/like`, { method: 'POST' }),
  },
  chat: {
    conversations: () => request<any[]>('/chat/conversations'),
    createConversation: (title?: string) =>
      request<any>('/chat/conversations', { method: 'POST', body: JSON.stringify({ title }) }),
    messages: (convId: string) => request<any[]>(`/chat/conversations/${convId}/messages`),
    send: (convId: string, content: string) =>
      request<any>(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  },
  profile: {
    get: () => request<any>('/profile'),
    streak: () => request<{ streakDays: number }>('/profile/streak', { method: 'POST' }),
    resources: () => request<any[]>('/profile/resources'),
  },
};
