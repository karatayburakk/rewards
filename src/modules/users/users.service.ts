import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserInfoDto } from './dtos/user-info.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class UsersService {
  getUserInfo(user: User): UserInfoDto {
    return {
      id: user.id,
      createdAt: moment
        .tz(user.createdAt, user.timeZone)
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment
        .tz(user.updatedAt, user.timeZone)
        .format('YYYY-MM-DD HH:mm:ss'),
      email: user.email,
      timeZone: user.timeZone,
      totalCoins: user.totalCoins,
    };
  }
}
