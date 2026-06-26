import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { CBT_PROMPT } from '@mentesana/shared';

const router = Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/conversations', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const conv = await prisma.conversation.create({
    data: { userId, title: req.body.title || 'Nueva conversación' },
  });
  res.json(conv);
});

router.get('/conversations', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const convs = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  res.json(convs);
});

router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: req.params.id, userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
});

router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { content } = req.body;

    const userMessage = await prisma.chatMessage.create({
      data: { conversationId: req.params.id, userId, role: 'user', content },
    });

    let assistantContent: string;

    if (OPENAI_API_KEY) {
      const history = await prisma.chatMessage.findMany({
        where: { conversationId: req.params.id },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      const messages = [
        { role: 'system', content: CBT_PROMPT },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const json = await response.json();
      assistantContent = json.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
    } else {
      assistantContent = generateLocalResponse(content);
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: { conversationId: req.params.id, userId, role: 'assistant', content: assistantContent },
    });

    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    res.json({ user: userMessage, assistant: assistantMessage });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al procesar mensaje' });
  }
});

function generateLocalResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('ansiedad') || lower.includes('nervios')) {
    return `Entiendo que la ansiedad puede ser abrumadora. ¿Qué sensaciones físicas estás notando en este momento? A veces, identificar lo que sentimos en el cuerpo es el primer paso para manejar la ansiedad. ¿Te gustaría que hagamos juntos un ejercicio de respiración 4-7-8?`;
  }
  if (lower.includes('miedo') || lower.includes('perder') || lower.includes('abandono')) {
    return `El miedo a perder a alguien es muy real y duele profundamente. ¿Puedes contarme más sobre qué pensamientos vienen a tu mente cuando sientes ese miedo? A menudo, identificar la distorsión cognitiva detrás del miedo nos ayuda a ver las cosas con más claridad. Recuerda: tus pensamientos no siempre son hechos.`;
  }
  if (lower.includes('autoestima') || lower.includes('valer') || lower.includes('suficiente')) {
    return `Es doloroso sentirse insuficiente. Me gustaría que hicieras un ejercicio: piensa en 3 cosas que hayas hecho bien hoy, por pequeñas que sean. ¿Qué pasaría si trataras a tu yo interior como tratarías a un mejor amigo? La autocompasión se construye un día a la vez.`;
  }
  if (lower.includes('triste') || lower.includes('tristeza') || lower.includes('solo')) {
    return `La tristeza es una emoción válida y necesaria. No tienes que enfrentarla solo. ¿Hay algo específico que haya desencadenado esta tristeza? A veces, solo el hecho de ponerle nombre a lo que sentimos ya nos alivia un poco. Estoy aquí para escucharte.`;
  }
  if (lower.includes('ira') || lower.includes('enojado') || lower.includes('rabia')) {
    return `La ira es una emoción que nos avisa de que algo no está bien. En lugar de reprimirla, podemos aprender a canalizarla. ¿Qué necesitas en este momento? ¿Un espacio para respirar, o tal vez expresar lo que sientes sin juicio?`;
  }

  return `Gracias por compartir eso conmigo. Quiero que sepas que lo que sientes es válido y que dar este paso ya es un acto de valentía. ¿Te gustaría profundizar en lo que estás sintiendo o prefieres que exploremos juntos alguna técnica que pueda ayudarte en este momento?`;
}

export default router;
