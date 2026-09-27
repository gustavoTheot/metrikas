import { prisma } from '../../infra/database/prisma'
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error'
import type { CreateTaskInput, UpdateTaskInput } from '../../../../shared/src/schemas/index'
import type { Task } from '@prisma/client'

// ─── Verifica que o milestone pertence ao usuário via goal ────────────────────
async function assertMilestoneOwnership(milestoneId: string, userId: string): Promise<void> {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: { select: { userId: true } } },
  })
  if (!milestone) throw new NotFoundError('Submeta')
  const m = milestone as typeof milestone & { goal: { userId: string } }
  if (m.goal.userId !== userId) throw new ForbiddenError()
}

export const taskService = {
  async listByMilestone(milestoneId: string, userId: string): Promise<Task[]> {
    await assertMilestoneOwnership(milestoneId, userId)
    return prisma.task.findMany({
      where: { milestoneId },
      orderBy: { order: 'asc' },
    })
  },

  async findByIdAndUser(id: string, userId: string): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        milestone: {
          include: { goal: { select: { userId: true } } },
        },
      },
    })
    if (!task) throw new NotFoundError('Tarefa')
    const t = task as Task & { milestone: { goal: { userId: string } } }
    if (t.milestone.goal.userId !== userId) throw new ForbiddenError()
    return task
  },

  async create(
    milestoneId: string,
    userId: string,
    data: CreateTaskInput,
  ): Promise<Task> {
    await assertMilestoneOwnership(milestoneId, userId)
    return prisma.task.create({
      data: {
        milestoneId,
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        order: data.order,
        isCompleted: false,
      },
    })
  },

  async update(id: string, userId: string, data: UpdateTaskInput): Promise<Task> {
    await taskService.findByIdAndUser(id, userId)
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isCompleted !== undefined && {
          isCompleted: data.isCompleted,
          completedAt: data.isCompleted ? new Date() : null,
        }),
      },
    })
  },

  async delete(id: string, userId: string): Promise<void> {
    await taskService.findByIdAndUser(id, userId)
    await prisma.task.delete({ where: { id } })
  },

  async complete(id: string, userId: string): Promise<Task> {
    await taskService.findByIdAndUser(id, userId)
    return prisma.task.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() },
    })
  },
}
