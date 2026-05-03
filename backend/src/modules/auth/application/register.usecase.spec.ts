import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUseCase } from './register.usecase';
import type { IUserRepository } from '../../user/domain/user.repository.interface';
import { UserEntity } from '../../user/domain/user.entity';

const mockUser = new UserEntity(
  1,
  'test@example.com',
  'Test User',
  'hashed',
  new Date(),
);

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.access.token'),
} as unknown as JwtService;

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUseCase(mockUserRepository, mockJwtService);
  });

  it('should register a new user and return an access token', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockUser);

    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    expect(result).toEqual({ accessToken: 'mock.access.token' });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
      }),
    );
  });

  it('should throw ConflictException if the email is already in use', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should store a hashed password, not the plain text', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockUser);

    await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    const createCall = mockUserRepository.create.mock.calls[0][0];
    expect(createCall.passwordHash).not.toBe('password123');
    expect(createCall.passwordHash).toBeDefined();
  });
});
