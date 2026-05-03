export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
  ) {}
}
