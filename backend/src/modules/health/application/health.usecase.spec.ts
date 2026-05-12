import { HealthUseCase } from './health.usecase';

describe('HealthUseCase', () => {
  it('returns status ok', () => {
    const useCase = new HealthUseCase();

    expect(useCase.execute()).toEqual({ status: 'ok' });
  });
});
