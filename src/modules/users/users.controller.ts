import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/get-user.decorator';
import { UserInfoDto } from './dtos/user-info.dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  getUserInfo(@CurrentUser() user: User): UserInfoDto {
    return this.usersService.getUserInfo(user);
  }
}
