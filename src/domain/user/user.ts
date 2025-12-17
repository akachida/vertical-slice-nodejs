export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static create(email: string, name: string | null): User {
    // Domain logic: validation, defaults, etc.
    // Note: ID is usually assigned by persistence or via UUID generation here if we want to decouple completely from DB ID generation.
    // For this example, we'll let the persistence layer handle ID or assume it's passed in after creation.
    return new User('', email, name, new Date(), new Date())
  }
}

export interface UserRepository {
  save(user: User): Promise<User>
  findByEmail(email: string): Promise<User | null>
}
