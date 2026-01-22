/**
 * User domain entity representing a registered user in the system.
 * Encapsulates user data and business rules for user management.
 */
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

  /**
   * Creates a new User entity with a generated UUID.
   * @param email - User's email address
   * @param name - User's display name
   */
  public static create(email: string, name: string): User {
    return new User(crypto.randomUUID(), email, name, new Date(), new Date())
  }

  /**
   * Reconstitutes a User entity from Prisma database record.
   * @param prismaUser - Raw Prisma user record
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromPrisma(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.name, prismaUser.createdAt, prismaUser.updatedAt)
  }

  /**
   * Updates the user's email address.
   * @param email - New email address
   */
  public updateEmail(email: string): User {
    this.email = email
    this.updatedAt = new Date()

    return this
  }

  /**
   * Updates the user's display name.
   * @param name - New display name
   */
  public updateName(name: string): User {
    this.name = name
    this.updatedAt = new Date()

    return this
  }
}

/**
 * Repository interface for User persistence operations.
 * Implementations handle the actual storage mechanism (database, in-memory, etc.).
 */
export interface UserRepository {
  /**
   * Persists a user entity to the storage.
   * @param user - User entity to save
   * @returns The saved user with any storage-generated fields
   */
  save(user: User): Promise<User>

  /**
   * Finds a user by their email address.
   * @param email - Email address to search for
   * @returns The user if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>
}
