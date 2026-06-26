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
    { title: '¿Qué es la ansiedad?', description: 'Guía completa sobre el trastorno de ansiedad generalizada', category: 'article', url: '#', tags: 'ansiedad,guia' },
    { title: 'Técnicas de respiración para la ansiedad', description: 'Ejercicios prácticos de respiración diafragmática', category: 'video', url: '#', tags: 'ansiedad,respiracion' },
    { title: 'Autoestima: Cómo construirla desde cero', description: 'Guía práctica para mejorar la autoestima', category: 'article', url: '#', tags: 'autoestima' },
    { title: 'Meditación guiada para principiantes', description: 'Audio de 10 minutos para empezar a meditar', category: 'audio', url: '#', tags: 'meditacion' },
    { title: 'Dependencia emocional: señales y soluciones', description: 'Aprende a identificar y superar la codependencia', category: 'article', url: '#', tags: 'relaciones,dependencia' },
  ];

  for (const r of resources) {
    await prisma.resource.upsert({
      where: { id: r.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: r.title.toLowerCase().replace(/\s+/g, '-'),
        ...r,
      },
    });
  }

  console.log('Base de datos poblada con ejercicios y recursos.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
