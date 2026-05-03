import { Module } from '@nestjs/common';
import { HealthController } from './presentation/health.controller';
import { HealthUseCase } from './application/health.usecase';

@Module({
  controllers: [HealthController],
  providers: [HealthUseCase],
})
export class HealthModule {}
