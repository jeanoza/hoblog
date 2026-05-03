import { Controller, Get } from '@nestjs/common';
import { HealthUseCase } from '../application/health.usecase';

@Controller('health')
export class HealthController {
  constructor(private readonly healthUseCase: HealthUseCase) {}

  @Get()
  check() {
    return this.healthUseCase.execute();
  }
}
