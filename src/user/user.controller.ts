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
  async getAllUsers(): Promise<User[]> {
    return await this.userService.users({});
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req): Promise<User> {
    const user = req.user;
    return (
      await this.userService.users({
        where: { id: user.id },
        include: { roles: { include: { role: true } } },
      })
    )[0];
  }
}
