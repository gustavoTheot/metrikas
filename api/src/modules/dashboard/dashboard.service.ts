import { prisma } from '../../infra/database/prisma'
import { calculateDaysRemaining } from '../../shared/utils/metrics-calculator'
import type { DashboardData, UpcomingDeadline, RecentActivity } from '../../../../shared/src/types/index'
import { GoalStatus } from '../../../../shared/src/constants/enums'

export const dashboardService = {
  async getDashboard(userId: string): Promise<DashboardData> {
    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Busca todas as metas do usuário com submetas
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: {
          where: { isCompleted: false },
          select: {
            id: true,
            title: true,
            endDate: true,
            isCompleted: true,
          },
        },
      },
    })

    // Contadores de goals por status
    const totalGoals = goals.length
    const activeGoals = goals.filter((g) => !g.isCompleted).length
    const completedGoals = goals.filter((g) => g.isCompleted).length

    // Calcula status aproximado baseado em datas (on track, at risk, etc.)
    let onTrackGoals = 0
    let atRiskGoals = 0
    let behindGoals = 0
    let overdueGoals = 0

    for (const goal of goals) {
      if (goal.isCompleted) continue
      if (goal.endDate < now) {
        overdueGoals++
        continue
      }
      const daysRemaining = calculateDaysRemaining(goal.endDate, now)
      const totalDays = (goal.endDate.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24)
      const elapsedRatio = 1 - daysRemaining / totalDays

      if (goal.targetValue && goal.currentValue !== null) {
        const progressRatio = (goal.currentValue ?? 0) / goal.targetValue
        if (progressRatio >= elapsedRatio) onTrackGoals++
        else if (progressRatio >= elapsedRatio * 0.8) atRiskGoals++
        else behindGoals++
      } else {
        onTrackGoals++
      }
    }

    // Próximos deadlines (goals e milestones nos próximos 7 dias)
    const upcomingDeadlines: UpcomingDeadline[] = []

    for (const goal of goals) {
      if (!goal.isCompleted && goal.endDate >= now && goal.endDate <= in7Days) {
        upcomingDeadlines.push({
          id: goal.id,
          title: goal.title,
          type: 'goal',
          dueDate: goal.endDate.toISOString(),
          color: goal.color ?? undefined,
          daysRemaining: calculateDaysRemaining(goal.endDate, now),
        })
      }

      for (const milestone of goal.milestones) {
        if (milestone.endDate >= now && milestone.endDate <= in7Days) {
          upcomingDeadlines.push({
            id: milestone.id,
            title: milestone.title,
            type: 'milestone',
            dueDate: milestone.endDate.toISOString(),
            goalColor: goal.color ?? undefined,
            daysRemaining: calculateDaysRemaining(milestone.endDate, now),
          })
        }
      }
    }

    // Ordena por daysRemaining
    upcomingDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining)

    // Atividades recentes — últimas 5 completadas (goals + milestones + tasks)
    const [completedGoalsList, completedMilestones, completedTasks] = await Promise.all([
      prisma.goal.findMany({
        where: { userId, isCompleted: true, completedAt: { not: null } },
        select: { id: true, title: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.milestone.findMany({
        where: {
          goal: { userId },
          isCompleted: true,
          completedAt: { not: null },
        },
        select: { id: true, title: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          milestone: { goal: { userId } },
          isCompleted: true,
          completedAt: { not: null },
        },
        select: { id: true, title: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
    ])

    const recentActivity: RecentActivity[] = [
      ...completedGoalsList.map((g) => ({
        id: g.id,
        title: g.title,
        type: 'goal_completed' as const,
        completedAt: g.completedAt!.toISOString(),
      })),
      ...completedMilestones.map((m) => ({
        id: m.id,
        title: m.title,
        type: 'milestone_completed' as const,
        completedAt: m.completedAt!.toISOString(),
      })),
      ...completedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        type: 'task_completed' as const,
        completedAt: t.completedAt!.toISOString(),
      })),
    ]

    recentActivity.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      onTrackGoals,
      atRiskGoals,
      behindGoals,
      overdueGoals,
      upcomingDeadlines: upcomingDeadlines.slice(0, 10),
      recentActivity: recentActivity.slice(0, 5),
    }
  },
}
