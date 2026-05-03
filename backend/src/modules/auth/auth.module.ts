import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './presentation/auth.controller';
import { RegisterUseCase } from './application/register.usecase';
import { LoginUseCase } from './application/login.usecase';
import { JwtStrategy } from './infrastructure/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [RegisterUseCase, LoginUseCase, JwtStrategy],
})
export class AuthModule {}
