import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './blacklisted-token.entity';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let blacklistRepository: Repository<BlacklistedToken>;
  let usersService: UsersService;

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn()
  };

  const mockBlacklistRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
  };

  const mockUsersService = {
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(BlacklistedToken),
          useValue: mockBlacklistRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    blacklistRepository = module.get<Repository<BlacklistedToken>>(getRepositoryToken(BlacklistedToken));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      mockJwtService.sign.mockReturnValue('new-access-token');

      const user = new User();
      user.id = 1;
      user.username = 'username';
      const result = await service.login(user);

      expect(result).toEqual({ access_token: 'new-access-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id, username: user.username });
    });
  });

  describe('logout', () => {
    it('should add token to blacklist on logout', async () => {
      const token = 'valid-token';

      mockJwtService.decode.mockReturnValue({ exp: 1724872730 });
      mockBlacklistRepository.create.mockReturnValue({
        id: 1,
        token,
        exp: 1724872730
      });

      await service.logout(token);

      expect(mockBlacklistRepository.create).toHaveBeenCalledWith({ 
        token,
        expiresAt: new Date(1724872730 * 1000)
      });
    });
  });

  describe('isTokenBlacklisted', () => {
    
    it ('should return true when token exists', async () => {
      const token = 'valid-token';
      mockBlacklistRepository.findOne.mockReturnValue({
        token,
        expiresAt: new Date(1724872730 * 1000)
      });

      const result = await service.isTokenBlacklisted(token);

      expect(result).toBeTruthy();
    });


  });
});
