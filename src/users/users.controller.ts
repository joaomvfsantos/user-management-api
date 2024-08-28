import * as bcrypt from 'bcrypt';
import { Controller, Get, Put, Body, UseGuards, Request, Post, Param, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  
  constructor(
    private usersService: UsersService
  ) {}

  @Post()
  async createUser(@Body('username') username: string, @Body('password') password: string) {
    const user = await this.usersService.create(username, password);
    const { password: _, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string, @Request() req) {
    if (req.user.id !== Number(id)) {
      throw new UnauthorizedException('You can only access your own user data');
    }
    const user = await this.usersService.findById(Number(id));
    const { password: _, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Request() req,
    @Body('old_password') oldPassword: string,
    @Body('password') password: string,
  ) {
    if (req.user.id !== Number(id)) {
      throw new UnauthorizedException('You can only access your own user data');
    }
    const user = await this.usersService.findById(Number(id));
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new UnauthorizedException('Old Password is invalid');
    }
    const updatedUser = await this.usersService.update(Number(id), password);
    const { password: _, ...result } = updatedUser;
    return result;
  }
}
