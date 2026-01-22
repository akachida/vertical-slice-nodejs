import { UserRepository, User } from '@/domain/user/user'
import { IUnitOfWork } from '@/shared/db/unit-of-work'

/**
 * Prisma-based implementation of UserRepository.
 * Uses Unit of Work for transaction participation.
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly unitOfWork: IUnitOfWork) {}

  async save(user: User): Promise<User> {
    const tx = this.unitOfWork.getTransaction()

    const saved = await tx.user.create({
      data: {
        email: user.email,
        name: user.name,
      },
    })

    return User.fromPrisma(saved)
  }

  async findByEmail(email: string): Promise<User | null> {
    const tx = this.unitOfWork.getTransaction()

    const found = await tx.user.findUnique({
      where: { email },
    })

    if (!found) return null

    return User.fromPrisma(found)
  }
}
