export class UserEntity {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
  readonly refreshTokenHash: string | null;

  constructor(data: {
    id: number;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
    refreshTokenHash?: string | null;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt;
    this.refreshTokenHash = data.refreshTokenHash ?? null;
  }
}
