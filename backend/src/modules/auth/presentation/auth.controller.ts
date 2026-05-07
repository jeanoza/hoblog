import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUseCase } from '../application/register.usecase';
import { LoginUseCase } from '../application/login.usecase';
import { RefreshUseCase } from '../application/refresh.usecase';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.refreshUseCase.execute(dto);
  }
}
