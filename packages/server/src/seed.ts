import { PrismaClient } from '@prisma/client';
import { EXERCISES_DATA } from '@mentesana/shared';

const prisma = new PrismaClient();

async function main() {
  for (const ex of EXERCISES_DATA) {
    await prisma.exercise.upsert({
      where: { id: ex.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: ex.title.toLowerCase().replace(/\s+/g, '-'),
        title: ex.title,
        description: ex.description,
        category: ex.category,
        duration: ex.duration,
        icon: ex.icon,
        steps: {
          create: ex.steps.map((s) => ({
            order: s.order,
            instruction: s.instruction,
            duration: s.duration,
          })),
        },
      },
    });
  }

  const resources = [
    {
      title: '¿Qué es la ansiedad?',
      description: 'Guía completa sobre el trastorno de ansiedad generalizada',
      category: 'article', tags: 'ansiedad,guia',
      content: `La ansiedad es una respuesta natural del cuerpo ante situaciones de peligro o estrés. Sin embargo, cuando esta respuesta se activa con demasiada frecuencia o intensidad, puede convertirse en un trastorno.

**Síntomas comunes:**
- Palpitaciones o taquicardia
- Respiración acelerada
- Tensión muscular
- Pensamientos catastróficos
- Dificultad para concentrarse

**¿Qué puedes hacer?**
1. **Respiración 4-7-8**: Inhala 4s, sostén 7s, exhala 8s. Repite 4 veces.
2. **Técnica 5-4-3-2-1**: Ancla tus sentidos al presente.
3. **Cuestiona tus pensamientos**: ¿Hay evidencia real de que ocurrirá lo peor?
4. **Habla con alguien**: Compartir lo que sientes reduce su peso.

Recuerda: la ansiedad no te define. Es solo una emoción, y como todas, pasará. 💙`,
    },
    {
      title: 'Técnicas de respiración para la ansiedad',
      description: 'Ejercicios prácticos de respiración diafragmática',
      category: 'video', tags: 'ansiedad,respiracion',
      url: 'https://www.youtube.com/embed/yHsE4z1gba0',
      content: `La respiración es una de las herramientas más poderosas para calmar la ansiedad porque está conectada directamente con tu sistema nervioso.

**Técnica 1: Respiración Diafragmática**
- Siéntate cómodamente con una mano en el pecho y otra en el abdomen.
- Inhala lentamente por la nariz (4 segundos), sintiendo cómo se eleva tu abdomen.
- Exhala por la boca (6 segundos), sintiendo cómo baja el abdomen.
- Repite durante 3-5 minutos.

**Técnica 2: Respiración 4-7-8**
1. Inhala por la nariz durante 4 segundos.
2. Sostén la respiración durante 7 segundos.
3. Exhala lentamente por la boca durante 8 segundos.
4. Repite 4 veces.

**Técnica 3: Respiración Cuadrada**
- Inhala 4s → Sostén 4s → Exhala 4s → Sostén 4s.
- Visualiza un cuadrado mientras respiras.

Practica estos ejercicios 2-3 veces al día, incluso cuando no tengas ansiedad. Así tu cerebro los asociará con calma y serán más efectivos en momentos de crisis. 🫁`,
    },
    {
      title: 'Autoestima: Cómo construirla desde cero',
      description: 'Guía práctica para mejorar la autoestima',
      category: 'article', tags: 'autoestima',
      content: `La autoestima no es algo con lo que naces — se construye día a día con pequeñas acciones.

**¿Qué es la autoestima?**
Es la valoración que tienes de ti mismo. No se basa en logros externos, sino en cómo te tratas y qué crees sobre tu propio valor.

**Pasos prácticos para mejorarla:**

1. **Deja de compararte** 🌱
   La comparación es la ladrona de la alegría. Tu camino es único.

2. **Habla contigo como hablarías con un amigo** 💬
   ¿Le dirías a tu mejor amigo "eres un fracaso"? No. Entonces no te lo digas a ti.

3. **Celebra pequeñas victorias** ✨
   ¿Hiciste la cama? ¿Saliste a caminar? ¿Llamaste a un amigo? Eso cuenta.

4. **Establece límites** 🛡️
   Decir "no" a lo que te daña es decirte "sí" a ti mismo.

5. **Cuida tu cuerpo** 🧘
   Dormir bien, comer bien, moverte. El cuerpo y la mente están conectados.

6. **Desafía tus creencias limitantes** 🧠
   ¿"No soy suficiente"? ¿Según quién? ¿Con qué evidencia real?

Recuerda: eres valioso por existir, no por lo que haces o logras. 🌟`,
    },
    {
      title: 'Meditación guiada para principiantes',
      description: 'Audio de 10 minutos para empezar a meditar',
      category: 'audio', tags: 'meditacion',
      url: 'https://www.youtube.com/embed/y7WT91m1dKs',
      content: `**Meditación de 10 minutos para principiantes**

Encuentra un lugar tranquilo y siéntate cómodamente. Cierra los ojos.

**Paso 1: Conexión con la respiración (2 min)**
Lleva tu atención a tu respiración natural. No intentes cambiarla, solo obsérvala. Siente el aire entrando y saliendo.

**Paso 2: Escaneo corporal (3 min)**
Lleva tu atención a los pies... siente cualquier sensación. Sube lentamente por las piernas, el abdomen, el pecho, los hombros, el cuello, la cabeza. Nota sin juzgar.

**Paso 3: Observación de pensamientos (3 min)**
Imagina que tus pensamientos son nubes pasando en el cielo. Obsérvalos aparecer y desaparecer sin aferrarte a ellos. No los juzgues, solo déjalos ir.

**Paso 4: Gratitud y cierre (2 min)**
Piensa en tres cosas por las que estás agradecido hoy. Pueden ser pequeñas: una taza de café, el sol, tu respiración.

Lentamente, trae tu atención de vuelta a la habitación. Mueve los dedos de las manos y los pies. Abre los ojos cuando estés listo.

**Consejo:** La meditación es como un músculo. Practica 10 minutos al día y verás cambios enormes en tu bienestar. 🧘`,
    },
    {
      title: 'Dependencia emocional: señales y soluciones',
      description: 'Aprende a identificar y superar la codependencia',
      category: 'article', tags: 'relaciones,dependencia',
      content: `La dependencia emocional es un patrón en el que tu bienestar depende excesivamente de otra persona. Reconocerlo es el primer paso para liberarte.

**Señales de alerta 🚩**
- Sientes que no puedes estar solo/a
- Necesitas constante aprobación de tu pareja
- Pones las necesidades de otros antes que las tuyas
- Sientes ansiedad cuando no recibes respuesta inmediata
- Permites comportamientos que te dañan por miedo al abandono

**¿Por qué ocurre?**
Suele tener raíces en la infancia: baja autoestima, miedo al abandono, patrones aprendidos. No es tu culpa.

**Pasos para sanar 🌈**

1. **Conócete** 🪞
   ¿Qué te gusta? ¿Qué necesitas? ¿Qué sueños has dejado de lado?

2. **Fortalece tu autoestima** 💪
   Tu valor no depende de que alguien te elija.

3. **Practica el tiempo a solas** 🧘
   Aprende a disfrutar tu propia compañía.

4. **Establece límites claros** 🛑
   Di "no" sin culpa. Tus necesidades importan tanto como las de los demás.

5. **Busca tu propósito** 🎯
   ¿Qué te apasiona? ¿Qué te hace sentir vivo? Eso no depende de nadie más.

6. **Terapia profesional** 🩺
   Un psicólogo puede ayudarte a sanar las heridas profundas.

Sanar la dependencia emocional no es fácil, pero es el regalo más grande que puedes hacerte. 💙`,
    },
  ];

  for (const r of resources) {
    await prisma.resource.upsert({
      where: { id: r.title.toLowerCase().replace(/\s+/g, '-') },
      update: { url: r.url },
      create: {
        id: r.title.toLowerCase().replace(/\s+/g, '-'),
        title: r.title,
        description: r.description,
        content: r.content,
        category: r.category,
        tags: r.tags,
        url: r.url,
      },
    });
  }

  console.log('Base de datos poblada con ejercicios y recursos.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
