import { prisma } from '../../infra/database/prisma'
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error'
import type { CreateMilestoneInput, UpdateMilestoneInput } from '../../../../shared/src/schemas/index'
import type { Milestone } from '@prisma/client'

// ─── Verifica que a meta pertence ao usuário ───────────────────────────────────
async function assertGoalOwnership(goalId: string, userId: string): Promise<void> {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } })
  if (!goal) throw new NotFoundError('Meta')
  if (goal.userId !== userId) throw new ForbiddenError()
}
// ─── Atualiza a meta mãe baseada nos checkpoints ──────────────────────────────
async function rollupGoalProgress(goalId: string): Promise<void> {
  const milestones = await prisma.milestone.findMany({ where: { goalId } })
  
  // Apenas soma os currentValues
  let sum = 0
  for (const m of milestones) {
    sum += m.currentValue || 0
  }
  
  await prisma.goal.update({
    where: { id: goalId },
    data: { currentValue: sum },
  })
}

export const milestoneService = {
  async listByGoal(goalId: string, userId: string): Promise<Milestone[]> {
    await assertGoalOwnership(goalId, userId)
    return prisma.milestone.findMany({
      where: { goalId },
      include: { tasks: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    })
  },

  async findByIdAndUser(id: string, userId: string): Promise<Milestone> {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        goal: { select: { userId: true } },
        tasks: { orderBy: { order: 'asc' } },
      },
    })
    if (!milestone) throw new NotFoundError('Submeta')
    const m = milestone as Milestone & { goal: { userId: string } }
    if (m.goal.userId !== userId) throw new ForbiddenError()
    return milestone
  },

  async create(
    goalId: string,
    userId: string,
    data: CreateMilestoneInput,
  ): Promise<Milestone> {
    await assertGoalOwnership(goalId, userId)
    const ms = await prisma.milestone.create({
      data: {
        goalId,
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetValue: data.targetValue ?? null,
        currentValue: data.currentValue ?? 0,
        order: data.order,
        isCompleted: false,
      },
    })
    await rollupGoalProgress(goalId)
    return ms
  },

  async update(
    id: string,
    userId: string,
    data: UpdateMilestoneInput,
  ): Promise<Milestone> {
    const milestone = await milestoneService.findByIdAndUser(id, userId)
    const ms = await prisma.milestone.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
        ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isCompleted !== undefined && {
          isCompleted: data.isCompleted,
          completedAt: data.isCompleted ? new Date() : null,
        }),
        ...(data.attributes && {
          attributes: {
            upsert: data.attributes.map(attr => ({
              where: {
                milestoneId_attributeDefinitionId: {
                  milestoneId: id,
                  attributeDefinitionId: attr.attributeDefinitionId,
                },
              },
              update: { value: attr.value },
              create: {
                attributeDefinitionId: attr.attributeDefinitionId,
                value: attr.value,
              },
            })),
          },
        }),
      },
    })
    await rollupGoalProgress(milestone.goalId)
    return ms
  },

  async delete(id: string, userId: string): Promise<void> {
    const milestone = await milestoneService.findByIdAndUser(id, userId)
    await prisma.milestone.delete({ where: { id } })
    await rollupGoalProgress(milestone.goalId)
  },

  async complete(id: string, userId: string): Promise<Milestone> {
    const milestone = await milestoneService.findByIdAndUser(id, userId)
    const ms = await prisma.milestone.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() },
    })
    await rollupGoalProgress(milestone.goalId)
    return ms
  },

  async reorder(
    milestones: Array<{ id: string; order: number }>,
    userId: string,
  ): Promise<void> {
    // Verifica ownership de todos antes de atualizar
    for (const item of milestones) {
      await milestoneService.findByIdAndUser(item.id, userId)
    }

    await prisma.$transaction(
      milestones.map(({ id, order }) =>
        prisma.milestone.update({ where: { id }, data: { order } }),
      ),
    )
  },
}
