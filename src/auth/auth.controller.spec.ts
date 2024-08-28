import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    validateUser: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
            {
                provide: AuthService,
                useValue: mockAuthService,
            }
        ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
        const loginResult = { accessToken: 'mock-access-token' };
        mockAuthService.login.mockResolvedValue(loginResult);
        const user = new User();
        mockAuthService.validateUser.mockReturnValue(user);

        const basicAuth = Buffer.from('testuser:password').toString('base64');
        const result = await controller.login(`Basic ${basicAuth}`);

        expect(result).toEqual(loginResult);
        expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException when no credentials provided', async () => {
        await expect(controller.login(undefined)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid credentials format', async () => {
        await expect(controller.login('InvalidFormat')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on malformed Basic Auth header', async () => {
        await expect(controller.login('Basic invalidbase64')).rejects.toThrow(UnauthorizedException);
    });

  });

  describe('logout', () => {
    it('should return success message on logout', async () => {
        mockAuthService.logout.mockResolvedValue(undefined);

        const result = await controller.logout('Bearer valid-token');

        expect(result).toEqual({ message: 'Logout successful' });
        expect(mockAuthService.logout).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when no token provided', async () => {
        await expect(controller.logout(undefined)).rejects.toThrow(UnauthorizedException);
    });

  });
});
