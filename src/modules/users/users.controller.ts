import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
}
