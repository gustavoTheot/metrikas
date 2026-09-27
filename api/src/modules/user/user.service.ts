import { prisma } from '../../infra/database/prisma'
import { NotFoundError } from '../../shared/errors/app-error'
import type { UpdateUserInput } from '../../../../shared/src/schemas/index'
import type { User } from '@prisma/client'

export const userService = {
  async findById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundError('Usuário')
    return user
  },

  async update(id: string, data: UpdateUserInput): Promise<User> {
    await userService.findById(id)
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.pushToken !== undefined && { pushToken: data.pushToken }),
      },
    })
  },

  async updatePushToken(id: string, pushToken: string | null): Promise<void> {
    await userService.findById(id)
    await prisma.user.update({ where: { id }, data: { pushToken } })
  },

  async deleteAccount(id: string): Promise<void> {
    await userService.findById(id)
    await prisma.user.delete({ where: { id } })
  },
}
