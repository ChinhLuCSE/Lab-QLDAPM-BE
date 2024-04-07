import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllUsers(): Promise<User[]> {
    return await this.userService.users({});
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() req): Promise<User> {
    const user = req.user;
    return await this.userService.user({
      id: user.sub,
    });
  }
}
