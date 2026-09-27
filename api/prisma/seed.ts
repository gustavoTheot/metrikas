import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Cria um usuário de desenvolvimento
  const devUser = await prisma.user.upsert({
    where: { email: 'dev@metrikas.app' },
    update: {},
    create: {
      email: 'dev@metrikas.app',
      name: 'Dev User',
      googleId: 'dev-google-id-12345',
      language: 'pt-BR',
      theme: 'light',
    },
  })

  console.log('✅ Usuário dev criado:', devUser.email)

  // Cria uma meta financeira de exemplo
  const financialGoal = await prisma.goal.upsert({
    where: { id: 'seed-goal-financial' },
    update: {},
    create: {
      id: 'seed-goal-financial',
      userId: devUser.id,
      title: 'Reserva Financeira de R$ 50.000',
      description: 'Meta de atingir R$ 50k na reserva financeira até 2027',
      icon: '💰',
      color: '#34D399',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2027-12-31'),
      targetValue: 50000,
      currentValue: 23000,
      unit: 'R$',
    },
  })

  // Cria milestones para a meta financeira
  await prisma.milestone.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-milestone-1',
        goalId: financialGoal.id,
        title: 'Checkpoint Dezembro 2025',
        description: 'Atingir R$ 25.000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        targetValue: 25000,
        currentValue: 23000,
        order: 0,
      },
      {
        id: 'seed-milestone-2',
        goalId: financialGoal.id,
        title: 'Checkpoint Agosto 2026',
        description: 'Atingir R$ 35.000',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-08-31'),
        targetValue: 35000,
        currentValue: 0,
        order: 1,
      },
      {
        id: 'seed-milestone-3',
        goalId: financialGoal.id,
        title: 'Meta Final 2027',
        description: 'Atingir R$ 50.000',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-12-31'),
        targetValue: 50000,
        currentValue: 0,
        order: 2,
      },
    ],
  })

  // Cria uma meta de estudos de exemplo
  const studyGoal = await prisma.goal.upsert({
    where: { id: 'seed-goal-study' },
    update: {},
    create: {
      id: 'seed-goal-study',
      userId: devUser.id,
      title: 'Concurso Público 2025',
      description: 'Atingir 80% de acertos nas provas anteriores',
      icon: '📚',
      color: '#6C63FF',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-11-30'),
      targetValue: 80,
      currentValue: 45,
      unit: '%',
    },
  })

  // Milestone de português
  const ptMilestone = await prisma.milestone.upsert({
    where: { id: 'seed-milestone-pt' },
    update: {},
    create: {
      id: 'seed-milestone-pt',
      goalId: studyGoal.id,
      title: 'Português — 50 Atividades',
      description: 'Fazer 50 atividades e acertar pelo menos 40',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-04-30'),
      targetValue: 40,
      currentValue: 18,
      order: 0,
    },
  })

  // Tasks da milestone de português
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-task-pt-1',
        milestoneId: ptMilestone.id,
        title: 'Semana 1 — 10 questões de gramática',
        isCompleted: true,
        completedAt: new Date('2025-01-07'),
        priority: 1,
        order: 0,
      },
      {
        id: 'seed-task-pt-2',
        milestoneId: ptMilestone.id,
        title: 'Semana 2 — 10 questões de interpretação',
        isCompleted: false,
        priority: 1,
        order: 1,
      },
    ],
  })

  console.log('✅ Dados de exemplo criados com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`  - 1 usuário dev: ${devUser.email}`)
  console.log(`  - 2 metas: Financeira e Estudos`)
  console.log(`  - 4 milestones`)
  console.log(`  - 2 tasks`)
}

seed()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
