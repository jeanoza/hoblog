import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUseCase } from '../application/register.usecase';
import { LoginUseCase } from '../application/login.usecase';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
