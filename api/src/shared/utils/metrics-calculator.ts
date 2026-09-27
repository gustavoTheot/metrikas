import { GoalStatus } from '../../../../shared/src/constants/enums'
import type { Goal, Milestone, GoalMetrics } from '../../../../shared/src/types/index'

// ─── Calcula progresso percentual do valor ─────────────────────────────────────
export function calculateValueProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}

// ─── Calcula progresso temporal (% do tempo que já passou) ────────────────────
export function calculateTimeProgress(startDate: Date, endDate: Date, now = new Date()): number {
  const total = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  if (total <= 0) return 100
  return Math.min(Math.max((elapsed / total) * 100, 0), 100)
}

// ─── Calcula dias restantes até o deadline ────────────────────────────────────
export function calculateDaysRemaining(endDate: Date, now = new Date()): number {
  const ms = endDate.getTime() - now.getTime()
  return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0)
}

// ─── Determina o status automático da meta ────────────────────────────────────
export function calculateGoalStatus(
  progressPercent: number,
  timeProgressPercent: number,
  endDate: Date,
  now = new Date(),
): GoalStatus {
  if (progressPercent >= 100) return GoalStatus.COMPLETED
  if (now > endDate) return GoalStatus.OVERDUE
  if (progressPercent === 0 && timeProgressPercent === 0) return GoalStatus.NOT_STARTED

  // Se o progresso está pelo menos 80% do esperado → em risco (não atrasado)
  const expectedProgress = timeProgressPercent
  if (progressPercent >= expectedProgress) return GoalStatus.ON_TRACK
  if (progressPercent >= expectedProgress * 0.8) return GoalStatus.AT_RISK
  return GoalStatus.BEHIND
}

// ─── Calcula ritmo necessário por dia para atingir a meta ─────────────────────
export function calculateRequiredDailyPace(
  currentValue: number,
  targetValue: number,
  endDate: Date,
  now = new Date(),
): number | undefined {
  const daysRemaining = calculateDaysRemaining(endDate, now)
  if (daysRemaining === 0) return undefined
  const remaining = targetValue - currentValue
  if (remaining <= 0) return 0
  return remaining / daysRemaining
}

// ─── Projeta data de conclusão baseado no ritmo atual ────────────────────────
export function calculateProjectedCompletion(
  currentValue: number,
  targetValue: number,
  startDate: Date,
  now = new Date(),
): Date | undefined {
  if (currentValue <= 0) return undefined
  if (currentValue >= targetValue) return now

  const elapsed = now.getTime() - startDate.getTime()
  const elapsedDays = elapsed / (1000 * 60 * 60 * 24)
  if (elapsedDays === 0) return undefined

  const dailyRate = currentValue / elapsedDays
  if (dailyRate === 0) return undefined

  const daysToComplete = (targetValue - currentValue) / dailyRate
  const projectedDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000)
  return projectedDate
}

// ─── Calcula métricas completas de uma meta ───────────────────────────────────
export function calculateGoalMetrics(
  goal: {
    startDate: Date
    endDate: Date
    targetValue?: number | null
    currentValue?: number | null
    isCompleted: boolean
    milestones?: Array<{ isCompleted: boolean; endDate: Date }>
  },
  now = new Date(),
): GoalMetrics {
  const startDate = new Date(goal.startDate)
  const endDate = new Date(goal.endDate)

  const targetValue = goal.targetValue ?? null
  const currentValue = goal.currentValue ?? 0

  // Progresso do valor (se tiver targetValue)
  const progressPercent =
    targetValue !== null ? calculateValueProgress(currentValue, targetValue) : 0

  // Progresso temporal
  const timeProgressPercent = calculateTimeProgress(startDate, endDate, now)

  // Status
  const status = goal.isCompleted
    ? GoalStatus.COMPLETED
    : calculateGoalStatus(progressPercent, timeProgressPercent, endDate, now)

  // Dias restantes
  const daysRemaining = calculateDaysRemaining(endDate, now)

  // Ritmo necessário
  const requiredPacePerDay =
    targetValue !== null
      ? calculateRequiredDailyPace(currentValue, targetValue, endDate, now)
      : undefined

  // Projeção de conclusão
  const projectedDate =
    targetValue !== null
      ? calculateProjectedCompletion(currentValue, targetValue, startDate, now)
      : undefined

  // Estatísticas das submetas
  const milestones = goal.milestones ?? []
  const completedMilestones = milestones.filter((m) => m.isCompleted).length
  const delayedMilestones = milestones.filter(
    (m) => !m.isCompleted && new Date(m.endDate) < now,
  ).length

  return {
    status,
    progressPercent: Math.round(progressPercent * 10) / 10,
    timeProgressPercent: Math.round(timeProgressPercent * 10) / 10,
    remainingValue: targetValue !== null ? Math.max(targetValue - currentValue, 0) : undefined,
    requiredPacePerDay,
    projectedCompletionDate: projectedDate?.toISOString(),
    isOnTrack: status === GoalStatus.ON_TRACK || status === GoalStatus.COMPLETED,
    daysRemaining,
    delayedMilestones,
    completedMilestones,
    totalMilestones: milestones.length,
  }
}
