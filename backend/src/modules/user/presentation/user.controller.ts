import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../../common/decorators/current-user.decorator';
import { GetMeUseCase } from '../application/get-me.usecase';
import { UpdateMeUseCase } from '../application/update-me.usecase';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.getMeUseCase.execute(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.updateMeUseCase.execute(user.userId, dto);
  }
}
