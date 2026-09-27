import { describe, it, expect } from 'vitest'
import {
  calculateValueProgress,
  calculateTimeProgress,
  calculateDaysRemaining,
  calculateGoalStatus,
  calculateGoalMetrics,
} from '../shared/utils/metrics-calculator'
import { GoalStatus } from '../../../shared/src/constants/enums'

describe('Metrics Calculator', () => {
  describe('calculateValueProgress', () => {
    it('deve calcular progresso correto', () => {
      expect(calculateValueProgress(25000, 50000)).toBe(50)
      expect(calculateValueProgress(50000, 50000)).toBe(100)
      expect(calculateValueProgress(0, 50000)).toBe(0)
    })

    it('não deve exceder 100%', () => {
      expect(calculateValueProgress(60000, 50000)).toBe(100)
    })

    it('deve retornar 0 quando target é 0', () => {
      expect(calculateValueProgress(100, 0)).toBe(0)
    })
  })

  describe('calculateTimeProgress', () => {
    it('deve calcular 50% quando estamos no meio do prazo', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-12-31')
      const now = new Date('2025-07-02') // meio do ano aprox
      const progress = calculateTimeProgress(start, end, now)
      expect(progress).toBeGreaterThan(49)
      expect(progress).toBeLessThan(51)
    })

    it('deve retornar 100% quando passou do prazo', () => {
      const start = new Date('2020-01-01')
      const end = new Date('2020-12-31')
      const now = new Date('2025-01-01')
      expect(calculateTimeProgress(start, end, now)).toBe(100)
    })

    it('deve retornar 0% antes do início', () => {
      const start = new Date('2030-01-01')
      const end = new Date('2030-12-31')
      const now = new Date('2025-01-01')
      expect(calculateTimeProgress(start, end, now)).toBe(0)
    })
  })

  describe('calculateGoalStatus', () => {
    it('deve retornar COMPLETED quando progresso >= 100', () => {
      const status = calculateGoalStatus(100, 50, new Date('2030-01-01'))
      expect(status).toBe(GoalStatus.COMPLETED)
    })

    it('deve retornar OVERDUE quando passou do prazo sem completar', () => {
      const pastDate = new Date('2020-01-01')
      const status = calculateGoalStatus(50, 100, pastDate)
      expect(status).toBe(GoalStatus.OVERDUE)
    })

    it('deve retornar ON_TRACK quando progresso >= progresso temporal', () => {
      const status = calculateGoalStatus(60, 50, new Date('2030-01-01'))
      expect(status).toBe(GoalStatus.ON_TRACK)
    })

    it('deve retornar AT_RISK quando progresso está ligeiramente abaixo', () => {
      // 82% do esperado (50%) = 41% de progresso
      const status = calculateGoalStatus(41, 50, new Date('2030-01-01'))
      expect(status).toBe(GoalStatus.AT_RISK)
    })

    it('deve retornar BEHIND quando muito abaixo do esperado', () => {
      const status = calculateGoalStatus(20, 80, new Date('2030-01-01'))
      expect(status).toBe(GoalStatus.BEHIND)
    })
  })

  describe('calculateGoalMetrics — Cenário Financeiro', () => {
    it('deve calcular métricas do cenário de investimento', () => {
      const goal = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        targetValue: 50000,
        currentValue: 23000,
        isCompleted: false,
        milestones: [],
      }

      const now = new Date('2026-09-27')
      const metrics = calculateGoalMetrics(goal, now)

      expect(metrics.progressPercent).toBe(46) // 23000/50000 = 46%
      expect(metrics.remainingValue).toBe(27000)
      expect(metrics.totalMilestones).toBe(0)
      expect(typeof metrics.requiredPacePerDay).toBe('number')
    })
  })
})
