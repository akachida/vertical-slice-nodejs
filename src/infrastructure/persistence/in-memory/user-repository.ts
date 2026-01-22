import { UserRepository, User } from '@/domain/user/user'

/**
 * In-memory implementation of UserRepository.
 * Useful for testing and local development without database dependencies.
 */
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = []

  async save(newUser: User): Promise<User> {
    this.users.push(newUser)

    return newUser
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null
  }
}
