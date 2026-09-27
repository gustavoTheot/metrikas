// ─── Status de Metas e Submetas ──────────────────────────────────────────────
export enum GoalStatus {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  BEHIND = 'BEHIND',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  NOT_STARTED = 'NOT_STARTED',
}

// ─── Tipos de Atributos Customizáveis ────────────────────────────────────────
export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  CURRENCY = 'CURRENCY',
  PERCENTAGE = 'PERCENTAGE',
}

// ─── Prioridades de Tarefas ──────────────────────────────────────────────────
export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

// ─── Tipos de Notificação ────────────────────────────────────────────────────
export enum NotificationType {
  DEADLINE_WARNING = 'deadline_warning',
  MILESTONE_OVERDUE = 'milestone_overdue',
  GOAL_COMPLETED = 'goal_completed',
  CHECK_IN = 'check_in',
  MILESTONE_COMPLETED = 'milestone_completed',
}

// ─── Temas ───────────────────────────────────────────────────────────────────
export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
}
