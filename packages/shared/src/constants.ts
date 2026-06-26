import type { Emotion } from './types';

export const MOOD_LABELS: Record<number, string> = {
  1: 'Muy mal',
  2: 'Mal',
  3: 'Regular',
  4: 'Bien',
  5: 'Muy bien',
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const EMOTIONS: Emotion[] = [
  { id: 'ansiedad', name: 'Ansiedad', emoji: '😰', category: 'negative' },
  { id: 'miedo', name: 'Miedo', emoji: '😨', category: 'negative' },
  { id: 'tristeza', name: 'Tristeza', emoji: '😢', category: 'negative' },
  { id: 'ira', name: 'Ira', emoji: '😠', category: 'negative' },
  { id: 'frustracion', name: 'Frustración', emoji: '😣', category: 'negative' },
  { id: 'soledad', name: 'Soledad', emoji: '💔', category: 'negative' },
  { id: 'desesperanza', name: 'Desesperanza', emoji: '😞', category: 'negative' },
  { id: 'culpa', name: 'Culpa', emoji: '😥', category: 'negative' },
  { id: 'alegria', name: 'Alegría', emoji: '😄', category: 'positive' },
  { id: 'tranquilidad', name: 'Tranquilidad', emoji: '😌', category: 'positive' },
  { id: 'esperanza', name: 'Esperanza', emoji: '🌟', category: 'positive' },
  { id: 'gratitud', name: 'Gratitud', emoji: '🙏', category: 'positive' },
  { id: 'confianza', name: 'Confianza', emoji: '💪', category: 'positive' },
  { id: 'amor', name: 'Amor propio', emoji: '💖', category: 'positive' },
  { id: 'neutral', name: 'Neutral', emoji: '😶', category: 'neutral' },
];

export const EXERCISES_DATA = [
  {
    title: 'Respiración 4-7-8',
    description: 'Técnica de respiración que ayuda a reducir la ansiedad en momentos de estrés intenso.',
    category: 'breathing' as const,
    duration: 4,
    icon: '🫁',
    steps: [
      { order: 1, instruction: 'Inhala profundamente por la nariz durante 4 segundos', duration: 4 },
      { order: 2, instruction: 'Mantén la respiración durante 7 segundos', duration: 7 },
      { order: 3, instruction: 'Exhala lentamente por la boca durante 8 segundos', duration: 8 },
      { order: 4, instruction: 'Repite este ciclo 4 veces', duration: 60 },
    ],
  },
  {
    title: 'Escaneo Corporal',
    description: 'Ejercicio de atención plena para conectar con tu cuerpo y reducir la tensión física.',
    category: 'meditation' as const,
    duration: 10,
    icon: '🧘',
    steps: [
      { order: 1, instruction: 'Siéntate cómodamente y cierra los ojos', duration: 30 },
      { order: 2, instruction: 'Lleva tu atención a los pies, nota las sensaciones', duration: 60 },
      { order: 3, instruction: 'Sube la atención a las piernas y el abdomen', duration: 60 },
      { order: 4, instruction: 'Siente el pecho, los hombros y los brazos', duration: 60 },
      { order: 5, instruction: 'Relaja conscientemente el cuello y la cabeza', duration: 60 },
      { order: 6, instruction: 'Imagina una luz cálida recorriendo todo tu cuerpo', duration: 120 },
      { order: 7, instruction: 'Vuelve lentamente la conciencia al presente', duration: 30 },
    ],
  },
  {
    title: 'Reestructuración Cognitiva',
    description: 'Identifica y cuestiona pensamientos automáticos negativos usando el método TCC.',
    category: 'cbt' as const,
    duration: 15,
    icon: '🧠',
    steps: [
      { order: 1, instruction: 'Identifica el pensamiento automático negativo', duration: 60 },
      { order: 2, instruction: '¿Qué evidencia real tienes a favor de este pensamiento?', duration: 120 },
      { order: 3, instruction: '¿Qué evidencia tienes en contra?', duration: 120 },
      { order: 4, instruction: '¿Qué le dirías a un amigo con este mismo pensamiento?', duration: 120 },
      { order: 5, instruction: 'Reformula el pensamiento de forma más equilibrada', duration: 120 },
      { order: 6, instruction: 'Escribe tu nuevo pensamiento racional', duration: 60 },
    ],
  },
  {
    title: 'Técnica 5-4-3-2-1 (Grounding)',
    description: 'Ejercicio de anclaje sensorial para momentos de ansiedad aguda o ataques de pánico.',
    category: 'grounding' as const,
    duration: 5,
    icon: '🌍',
    steps: [
      { order: 1, instruction: 'Mira a tu alrededor y nombra 5 cosas que puedas ver', duration: 60 },
      { order: 2, instruction: 'Ahora toca 4 cosas que te rodean, siente sus texturas', duration: 60 },
      { order: 3, instruction: 'Escucha atentamente: nombra 3 sonidos que puedas oír', duration: 60 },
      { order: 4, instruction: 'Huele: identifica 2 olores en tu entorno', duration: 60 },
      { order: 5, instruction: 'Prueba: nombra 1 sabor (o imagina uno)', duration: 60 },
    ],
  },
  {
    title: 'Relajación Muscular Progresiva',
    description: 'Tensión y relajación sistemática de grupos musculares para liberar estrés físico.',
    category: 'relaxation' as const,
    duration: 12,
    icon: '💆',
    steps: [
      { order: 1, instruction: 'Tensa los puños fuertemente 5 segundos... ahora suelta', duration: 15 },
      { order: 2, instruction: 'Tensa los bíceps y hombros 5 segundos... relaja', duration: 15 },
      { order: 3, instruction: 'Tensa los músculos de la cara: aprieta ojos y boca 5s... suelta', duration: 15 },
      { order: 4, instruction: 'Tensa el cuello hacia atrás suavemente 5s... relaja', duration: 15 },
      { order: 5, instruction: 'Tensa el pecho y abdomen 5 segundos... suelta', duration: 15 },
      { order: 6, instruction: 'Tensa glúteos y piernas 5 segundos... relaja', duration: 15 },
      { order: 7, instruction: 'Ahora respira profundamente y nota la relajación en todo tu cuerpo', duration: 30 },
    ],
  },
  {
    title: 'Diario de Gratitud',
    description: 'Ejercicio para entrenar el cerebro a enfocarse en lo positivo y construir resiliencia.',
    category: 'cbt' as const,
    duration: 8,
    icon: '✨',
    steps: [
      { order: 1, instruction: 'Cierra los ojos y respira profundamente 3 veces', duration: 30 },
      { order: 2, instruction: 'Piensa en 3 cosas por las que estás agradecido hoy', duration: 120 },
      { order: 3, instruction: 'Elige una y cierra los ojos sintiendo esa gratitud', duration: 60 },
      { order: 4, instruction: 'Piensa en algo bueno que aprendiste de un momento difícil', duration: 90 },
      { order: 5, instruction: 'Escribe todo esto en tu diario', duration: 120 },
    ],
  },
];

export const COMMUNITY_CATEGORIES = [
  'Ansiedad',
  'Autoestima',
  'Relaciones',
  'Duelo',
  'Estrés',
  'Depresión',
  'Superación',
  'General',
];

export const CBT_PROMPT = `Eres un asistente de apoyo emocional basado en Terapia Cognitivo-Conductual (TCC). 
Tu objetivo es ayudar al usuario a identificar y reestructurar pensamientos automáticos negativos.
Reglas importantes:
1. NO eres un terapeuta ni reemplazas ayuda profesional
2. Siempre comienza respondiendo con empatía y validación
3. Guía al usuario con preguntas socráticas para que reflexione
4. Ayuda a identificar distorsiones cognitivas (polarización, catastrofismo, etc.)
5. Sugiere ejercicios prácticos cuando sea apropiado
6. Si el usuario expresa ideas de autodaño, proporciona líneas de crisis inmediatamente
7. Mantén un tono cálido, compasivo pero profesional
8. Enfócate en el presente y en soluciones prácticas
9. Usa un lenguaje simple y accesible
10. Recuerda al usuario sus fortalezas y recursos internos`;
