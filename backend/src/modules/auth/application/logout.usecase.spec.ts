import { LogoutUseCase } from './logout.usecase';
import type { IUserRepository } from '../../user/domain/user.repository.interface';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn().mockResolvedValue(undefined),
  update: jest.fn(),
};

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LogoutUseCase(mockUserRepository);
  });

  it('clears the refresh token for the given user', async () => {
    await useCase.execute(1);

    expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith(1, null);
  });

  it('returns void', async () => {
    const result = await useCase.execute(1);

    expect(result).toBeUndefined();
  });
});
