import { GoalStatus, AttributeType, TaskPriority, NotificationType } from '../constants/enums'

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  googleId: string
  pushToken?: string
  language: string
  theme: string
  createdAt: string
  updatedAt: string
}

// ─── Goal ────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  icon?: string
  color?: string
  startDate: string
  endDate: string
  isCompleted: boolean
  completedAt?: string
  targetValue?: number
  currentValue?: number
  unit?: string
  createdAt: string
  updatedAt: string
  milestones?: Milestone[]
  _count?: { milestones: number }
}

export interface GoalWithMetrics extends Goal {
  metrics: GoalMetrics
}

// ─── Milestone ────────────────────────────────────────────────────────────────
export interface Milestone {
  id: string
  goalId: string
  title: string
  description?: string
  startDate: string
  endDate: string
  isCompleted: boolean
  completedAt?: string
  targetValue?: number
  currentValue?: number
  order: number
  createdAt: string
  updatedAt: string
  tasks?: Task[]
  attributes?: MilestoneAttribute[]
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string
  milestoneId: string
  title: string
  description?: string
  isCompleted: boolean
  completedAt?: string
  dueDate?: string
  priority: TaskPriority
  order: number
  createdAt: string
  updatedAt: string
  attributes?: TaskAttribute[]
}

// ─── Attribute Definition ─────────────────────────────────────────────────────
export interface AttributeDefinition {
  id: string
  goalId: string
  name: string
  type: AttributeType
  options?: string[]
  isRequired: boolean
  order: number
  createdAt: string
}

// ─── Attribute Values ─────────────────────────────────────────────────────────
export interface MilestoneAttribute {
  id: string
  milestoneId: string
  attributeDefinitionId: string
  value: string
  attributeDefinition?: AttributeDefinition
  createdAt: string
  updatedAt: string
}

export interface TaskAttribute {
  id: string
  taskId: string
  attributeDefinitionId: string
  value: string
  attributeDefinition?: AttributeDefinition
  createdAt: string
  updatedAt: string
}

// ─── Metrics ─────────────────────────────────────────────────────────────────
export interface GoalMetrics {
  status: GoalStatus
  progressPercent: number
  timeProgressPercent: number
  remainingValue?: number
  requiredPacePerDay?: number
  projectedCompletionDate?: string
  isOnTrack: boolean
  daysRemaining: number
  delayedMilestones: number
  completedMilestones: number
  totalMilestones: number
}

export interface DashboardData {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  onTrackGoals: number
  atRiskGoals: number
  behindGoals: number
  overdueGoals: number
  upcomingDeadlines: UpcomingDeadline[]
  recentActivity: RecentActivity[]
}

export interface UpcomingDeadline {
  id: string
  title: string
  type: 'goal' | 'milestone' | 'task'
  dueDate: string
  color?: string
  goalColor?: string
  daysRemaining: number
}

export interface RecentActivity {
  id: string
  title: string
  type: 'goal_completed' | 'milestone_completed' | 'task_completed'
  completedAt: string
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: NotificationType
  referenceId?: string
  referenceType?: 'goal' | 'milestone' | 'task'
  isRead: boolean
  scheduledFor?: string
  sentAt?: string
  createdAt: string
}
