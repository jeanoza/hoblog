import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';
import { USER_REPOSITORY } from './domain/user.repository.interface';

@Module({
  providers: [{ provide: USER_REPOSITORY, useClass: UserRepository }],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
