import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';
import { USER_REPOSITORY } from './domain/user.repository.interface';
import { GetMeUseCase } from './application/get-me.usecase';
import { UserController } from './presentation/user.controller';

@Module({
  controllers: [UserController],
  providers: [{ provide: USER_REPOSITORY, useClass: UserRepository }, GetMeUseCase],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
