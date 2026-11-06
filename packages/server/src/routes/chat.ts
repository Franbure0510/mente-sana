import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { CBT_PROMPT } from '@mentesana/shared';

const router = Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/conversations', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const conv = await prisma.conversation.create({
      data: { userId, title: req.body.title || 'Nueva conversación' },
    });
    res.json(conv);
  } catch {
    res.status(400).json({ error: 'Usuario no encontrado. Vuelve a iniciar sesión.' });
  }
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

// Mensajes proactivos que el asistente envía espontáneamente
const PROACTIVE_MESSAGES = [
  { type: 'greeting', messages: ['¡Hola! ¿Cómo estás hoy? 🌟', '¿Qué tal va tu día? Estoy aquí para ti 💙', '¡Buenos días! ¿Cómo amaneciste? 🌅', '¿Cómo estás en este momento? Cuéntame 🤗'] },
  { type: 'checkin', messages: ['Aún no has hecho tu check-in hoy. ¿Cómo te sientes? 📊', '¿Has registrado tu estado de ánimo hoy? Es un buen momento 😊', 'Recuerda hacer tu check-in diario — solo toma 10 segundos ⏱️'] },
  { type: 'diary', messages: ['Hace un tiempo que no escribes en tu diario. ¿Quieres compartir algo? 📖', 'Escribir lo que sientes puede ayudarte a ordenar tus pensamientos ✍️', 'Tu diario emocional te espera. ¿Qué tienes en mente? 💭'] },
  { type: 'exercise', messages: ['¿Has hecho algún ejercicio de respiración hoy? 🧘', 'Un mini-ejercicio de grounding puede ayudarte si te sientes abrumado 🌿', '¿Qué tal si tomas 2 minutos para respirar profundo? 🫁'] },
  { type: 'cbt', messages: ['Recuerda: tus pensamientos no siempre son hechos. ¿Qué evidencia tienes? 🧠', 'Si un amigo tuviera tu pensamiento, ¿qué le dirías? 💭', 'Intenta identificar una distorsión cognitiva hoy. ¿Catastrofismo? ¿Polarización? 🔍'] },
  { type: 'gratitude', messages: ['¿Puedes encontrar 3 cosas por las que estar agradecido hoy? ✨', 'La gratitud entrena al cerebro para ver lo positivo. ¿Lo intentamos? 🙏', '¿Qué cosa buena pasó hoy, por pequeña que sea? 🌈'] },
  { type: 'support', messages: ['Estoy aquí para ti, siempre que me necesites 🤗', 'No tienes que enfrentar esto solo. Cuéntame qué pasa 💙', 'A veces solo necesitamos que alguien nos escuche. Estoy aquí 🫂', 'Recuerda que está bien no estar bien. Lo importante es que estás aquí 🌱'] },
];

router.post('/proactive', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { conversationId } = req.body || {};

    // Obtener contexto del usuario
    const [todayCheckin, recentEntries] = await Promise.all([
      prisma.dailyCheckIn.findFirst({
        where: { userId, date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      }),
      prisma.diaryEntry.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 3,
      }),
    ]);

    // Elegir tipo de mensaje según contexto
    let typePool: string[];
    if (!todayCheckin) {
      typePool = ['checkin', 'greeting', 'support'];
    } else if (recentEntries.length === 0 || (Date.now() - new Date(recentEntries[0].date).getTime()) > 86400000 * 2) {
      typePool = ['diary', 'greeting', 'checkin', 'support'];
    } else {
      typePool = ['greeting', 'cbt', 'gratitude', 'exercise', 'support'];
    }

    const type = typePool[Math.floor(Math.random() * typePool.length)];
    const pool = PROACTIVE_MESSAGES.find(p => p.type === type)!;
    const content = pool.messages[Math.floor(Math.random() * pool.messages.length)];

    // Usar la conversación proporcionada o crear/una existente
    let convId = conversationId;
    if (!convId) {
      let conv = await prisma.conversation.findFirst({
        where: { userId, title: { startsWith: '🤖' } },
        orderBy: { createdAt: 'desc' },
      });
      if (!conv) {
        conv = await prisma.conversation.create({
          data: { userId, title: `🤖 ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}` },
        });
      }
      convId = conv.id;
    }

    const msg = await prisma.chatMessage.create({
      data: { conversationId: convId, userId, role: 'assistant', content },
    });

    res.json({ message: msg, conversationId: convId });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al generar mensaje proactivo' });
  }
});

function generateLocalResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  if (lower === 'hola' || lower === 'buenas' || lower === 'hey' || lower === 'buenos dias' || lower === 'buenas tardes' || lower === 'buenas noches' || lower.startsWith('hola') || lower === 'alo' || lower === 'ola') {
    return `¡Hola! 😊 Me alegra que estés aquí. ¿Cómo te sientes hoy? Cuéntame cómo estás o si hay algo en lo que pueda ayudarte. A veces solo hablar ya nos hace sentir mejor.`;
  }

  if (lower.includes('técnica') || lower.includes('recomiendas') || lower.includes('sugiere') || lower.includes('qué hago') || lower.includes('ejercicio')) {
    return `¡Claro! Aquí tienes algunas técnicas que puedo recomendarte según cómo te sientas:\n\n` +
      `🧘 **Si tienes ansiedad**: Prueba la *Respiración 4-7-8* — inhala 4s, sostén 7s, exhala 8s.\n` +
      `🌍 **Si te sientes abrumado**: *Técnica 5-4-3-2-1* — mira 5 cosas, toca 4, escucha 3, huele 2, saborea 1.\n` +
      `🧠 **Si tienes pensamientos negativos**: *Reestructuración Cognitiva* — cuestiona la evidencia de ese pensamiento.\n` +
      `💆 **Si tienes tensión física**: *Relajación Muscular Progresiva* — tensa y suelta cada grupo muscular.\n` +
      `✨ **Si quieres enfocarte en lo positivo**: *Diario de Gratitud* — escribe 3 cosas por las que agradeces hoy.\n\n` +
      `¿Cuál te gustaría probar? Puedo guiarte paso a paso 🤗`;
  }

  if (lower.includes('respiración') || lower.includes('respirar') || lower.includes('4-7-8')) {
    return `Vamos a respirar juntos. Sigue mi voz:\n\n` +
      `1️⃣ Inhala profundamente por la nariz... 2... 3... 4...\n` +
      `2️⃣ Sostén la respiración... 2... 3... 4... 5... 6... 7...\n` +
      `3️⃣ Exhala lentamente por la boca... 2... 3... 4... 5... 6... 7... 8...\n\n` +
      `Repite 4 veces. ¿Cómo te sientes después de hacerlo? 🫁💙`;
  }

  if (lower.includes('grounding') || lower.includes('5-4-3-2-1') || lower.includes('anclaje') || lower.includes('presente')) {
    return `Ejercicio de anclaje 5-4-3-2-1:\n\n` +
      `👁️ **5** cosas que puedes VER a tu alrededor\n` +
      `✋ **4** cosas que puedes TOCAR (siente sus texturas)\n` +
      `👂 **3** sonidos que puedes ESCUCHAR\n` +
      `👃 **2** olores que puedes OLER\n` +
      `👅 **1** sabor que puedes SENTIR (o imaginar)\n\n` +
      `Este ejercicio te trae al momento presente. ¿Notas la diferencia? 🌍`;
  }

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
