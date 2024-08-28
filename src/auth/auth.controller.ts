import { Controller, Post, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('No credentials provided');
    }

    if (auth.split(' ').length != 2) {
      throw new UnauthorizedException('Invalid credentials format');
    }

    const [username, password] =  Buffer.from(auth.split(' ')[1], 'base64')
      .toString()
      .split(':');

    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials format');
    }

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('No token provided');
    }

    const token = auth.split(' ')[1];
    await this.authService.logout(token);

    return { message: 'Logout successful' };
  }
}
