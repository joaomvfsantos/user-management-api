import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistedToken } from './blacklisted-token.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(BlacklistedToken)
    private blacklistedTokenRepository: Repository<BlacklistedToken>
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(token: string): Promise<void> {;
    const decodedToken = this.jwtService.decode(token) as { exp: number };
    if (!decodedToken) {
      throw new UnauthorizedException("Invalid token");
    }
    const expiresAt = new Date(decodedToken.exp * 1000);

    const blacklistedToken = this.blacklistedTokenRepository.create({
      token,
      expiresAt,
    });
    await this.blacklistedTokenRepository.save(blacklistedToken);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistedTokenRepository.findOne({ where: { token } });
    return !!blacklistedToken;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.blacklistedTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
  
}
