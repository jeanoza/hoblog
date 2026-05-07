import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../../common/decorators/current-user.decorator';
import { GetMeUseCase } from '../application/get-me.usecase';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.getMeUseCase.execute(user.userId);
  }
}
