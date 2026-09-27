import { prisma } from '../../infra/database/prisma'
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error'
import { calculateGoalMetrics } from '../../shared/utils/metrics-calculator'
import type { CreateGoalInput, UpdateGoalInput } from '../../../../shared/src/schemas/index'
import type { GoalMetrics } from '../../../../shared/src/types/index'
import type { Goal } from '@prisma/client'

export const goalService = {
  async listByUser(userId: string): Promise<Goal[]> {
    return prisma.goal.findMany({
      where: { userId },
      include: {
        _count: { select: { milestones: true } },
        attributeDefinitions: true,
        milestones: {
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Goal & { milestones: Array<{ id: string; title: string; isCompleted: boolean; endDate: Date; tasks: unknown[] }> }> {
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { order: 'asc' },
        },
        attributeDefinitions: true,
      },
    })

    if (!goal) throw new NotFoundError('Meta')
    if (goal.userId !== userId) throw new ForbiddenError()

    return goal as Goal & { milestones: Array<{ id: string; title: string; isCompleted: boolean; endDate: Date; tasks: unknown[] }> }
  },

  async create(userId: string, data: CreateGoalInput): Promise<Goal> {
    return prisma.goal.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? null,
        icon: data.icon ?? null,
        color: data.color ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetValue: data.targetValue ?? null,
        currentValue: data.currentValue ?? 0,
        unit: data.unit ?? null,
        isCompleted: false,
        ...(data.attributes && data.attributes.length > 0 && {
          attributeDefinitions: {
            create: data.attributes,
          },
        }),
      },
    })
  },

  async update(id: string, userId: string, data: UpdateGoalInput): Promise<Goal> {
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) throw new NotFoundError('Meta')
    if (goal.userId !== userId) throw new ForbiddenError()

    if (data.attributes) {
      await prisma.attributeDefinition.deleteMany({ where: { goalId: id } })
    }

    return prisma.goal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
        ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.isCompleted !== undefined && {
          isCompleted: data.isCompleted,
          completedAt: data.isCompleted ? new Date() : null,
        }),
        ...(data.attributes && {
          attributeDefinitions: {
            create: data.attributes,
          },
        }),
      },
    })
  },

  async delete(id: string, userId: string): Promise<void> {
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) throw new NotFoundError('Meta')
    if (goal.userId !== userId) throw new ForbiddenError()
    await prisma.goal.delete({ where: { id } })
  },

  async getMetrics(id: string, userId: string): Promise<GoalMetrics> {
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        milestones: {
          select: { isCompleted: true, endDate: true },
        },
      },
    })

    if (!goal) throw new NotFoundError('Meta')
    if (goal.userId !== userId) throw new ForbiddenError()

    return calculateGoalMetrics({
      startDate: goal.startDate,
      endDate: goal.endDate,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      isCompleted: goal.isCompleted,
      milestones: goal.milestones,
    })
  },
}
