import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedToken } from './blacklisted-token.entity';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlacklistedToken]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      // In a real app, we can use environment variables or configuration file
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, TokenCleanupService],
  controllers: [AuthController],
})
export class AuthModule {}
