export class User {
  private constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    this.id = id

    this.updateEmail(this.email)
    this.updateName(this.name)

    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  public static create(email: string, name: string): User {
    // Domain logic: validation, defaults, etc.
    // Note: ID is usually assigned by persistence or via UUID generation here if we want to decouple completely from DB ID generation.
    return new User(crypto.randomUUID(), email, name, new Date(), new Date())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromPrisma(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.name, prismaUser.createdAt, prismaUser.updatedAt)
  }

  public updateEmail(email: string): User {
    // Domain logic: validation, defaults, etc.
    this.email = email
    this.updatedAt = new Date()

    return this
  }

  public updateName(name: string): User {
    // Domain logic: validation, defaults, etc.
    this.name = name
    this.updatedAt = new Date()

    return this
  }
}

export interface UserRepository {
  save(user: User): Promise<User>
  findByEmail(email: string): Promise<User | null>
}
