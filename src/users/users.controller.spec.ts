import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return user without password', async () => {
      const user = { id: 1, username: 'testuser', password: 'hashedpassword' };
      mockUsersService.create.mockResolvedValue(user);

      const result = await controller.createUser('testuser', 'password');

      expect(result).toEqual({ id: 1, username: 'testuser' });
      expect(mockUsersService.create).toHaveBeenCalledWith('testuser', 'password');
    });
  });

  describe('getUser', () => {
    it('should return user data if authorized', async () => {
      const user = { id: 1, username: 'testuser', password: 'hashedpassword' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await controller.getUser('1', { user: { id: 1 } });

      expect(result).toEqual({ id: 1, username: 'testuser' });
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException if not authorized', async () => {
      await expect(controller.getUser('1', { user: { id: 2 } })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    it('should update user password if authorized and old password is correct', async () => {
      const user = { id: 1, username: 'testuser', password: await bcrypt.hash('oldpassword', 10) };
      const updatedUser = { id: 1, username: 'testuser', password: 'newhashednewpassword' };
      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile('1', { user: { id: 1 } }, 'oldpassword', 'newpassword');

      expect(result).toEqual({ id: 1, username: 'testuser' });
      expect(mockUsersService.update).toHaveBeenCalledWith(1, 'newpassword');
    });

    it('should throw UnauthorizedException if not authorized', async () => {
      await expect(controller.updateProfile('1', { user: { id: 2 } }, 'oldpassword', 'newpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const user = { id: 1, username: 'testuser', password: await bcrypt.hash('correctoldpassword', 10) };
      mockUsersService.findById.mockResolvedValue(user);

      await expect(controller.updateProfile('1', { user: { id: 1 } }, 'wrongoldpassword', 'newpassword')).rejects.toThrow(UnauthorizedException);
    });
  });
});
