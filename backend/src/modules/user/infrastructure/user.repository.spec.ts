import { UserRepository } from './user.repository';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserEntity } from '../domain/user.entity';

const mockPrismaUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed',
  createdAt: new Date('2024-01-01'),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as unknown as PrismaService;

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepository(mockPrisma);
  });

  describe('findByEmail', () => {
    it('should return a UserEntity when the user exists', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when the user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a UserEntity when the user exists', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockPrismaUser);

      const result = await repository.findById(1);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe(1);
    });

    it('should return null when the user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a UserEntity', async () => {
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockPrismaUser);

      const result = await repository.create({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
      });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe('test@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', name: 'Test User', passwordHash: 'hashed' },
      });
    });
  });
});
