import { z } from 'zod'
import { AttributeType, TaskPriority } from '../constants/enums'

// ─── API Response Wrapper ─────────────────────────────────────────────────────
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
})

// ─── Auth Schemas ─────────────────────────────────────────────────────────────
export const GoogleAuthSchema = z.object({
  idToken: z.string().min(1, 'ID Token obrigatório'),
  pushToken: z.string().optional(),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
})

// ─── Goal Schemas ─────────────────────────────────────────────────────────────
export const CreateGoalSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(100, 'Título muito longo'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .optional(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  unit: z.string().max(20).optional(),
  attributes: z.array(z.lazy(() => CreateAttributeDefinitionSchema)).optional(),
})

export const UpdateGoalSchema = CreateGoalSchema.partial().extend({
  isCompleted: z.boolean().optional(),
})

// ─── Milestone Schemas ────────────────────────────────────────────────────────
export const CreateMilestoneSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  order: z.number().int().min(0).default(0),
})

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial().extend({
  isCompleted: z.boolean().optional(),
  attributes: z.array(z.lazy(() => SetAttributeValueSchema)).optional(),
})

export const ReorderMilestonesSchema = z.object({
  milestones: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    }),
  ),
})

// ─── Task Schemas ─────────────────────────────────────────────────────────────
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.LOW),
  order: z.number().int().min(0).default(0),
})

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  isCompleted: z.boolean().optional(),
})

// ─── Attribute Schemas ────────────────────────────────────────────────────────
export const CreateAttributeDefinitionSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.nativeEnum(AttributeType),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

export const UpdateAttributeDefinitionSchema = CreateAttributeDefinitionSchema.partial()

export const SetAttributeValueSchema = z.object({
  attributeDefinitionId: z.string().uuid(),
  value: z.string(),
})

// ─── User Schemas ─────────────────────────────────────────────────────────────
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  language: z.string().min(2).max(10).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  pushToken: z.string().optional().nullable(),
})

// ─── Inferred Types ───────────────────────────────────────────────────────────
export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>
export type CreateMilestoneInput = z.infer<typeof CreateMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type CreateAttributeDefinitionInput = z.infer<typeof CreateAttributeDefinitionSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
