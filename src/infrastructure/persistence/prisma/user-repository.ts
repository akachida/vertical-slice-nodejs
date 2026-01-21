import { UserRepository, User } from '@/domain/user/user'
import { prisma } from '@/shared/db/client'

export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const saved = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
      },
    })

    return User.fromPrisma(saved)
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findUnique({
      where: { email },
    })

    if (!found) return null

    return User.fromPrisma(found)
  }
}
