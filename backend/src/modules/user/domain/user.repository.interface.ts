import { UserEntity } from './user.entity';

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: { email: string; name: string; passwordHash: string }): Promise<UserEntity>;
  updateRefreshToken(id: number, hash: string | null): Promise<void>;
  update(id: number, data: { name?: string }): Promise<UserEntity>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
