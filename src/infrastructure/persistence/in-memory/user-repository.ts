import { UserRepository, User } from '@/domain/user/user'

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = []

  async save(user: User): Promise<User> {
    const newUser = new User((this.users.length + 1).toString(), user.email, user.name, new Date(), new Date())
    this.users.push(newUser)
    return newUser
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null
  }
}
