import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthUseCase {
  execute(): { status: string } {
    return { status: 'ok' };
  }
}
