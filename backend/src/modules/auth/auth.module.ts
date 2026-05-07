import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './presentation/auth.controller';
import { RegisterUseCase } from './application/register.usecase';
import { LoginUseCase } from './application/login.usecase';
import { RefreshUseCase } from './application/refresh.usecase';
import { LogoutUseCase } from './application/logout.usecase';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { JwtSignOptions } from '@nestjs/jwt';
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      } as JwtSignOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, RegisterUseCase, RefreshUseCase, LogoutUseCase, JwtStrategy],
})
export class AuthModule {}
