import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRewardsService } from './user-rewards.service';
import { User } from '../../common/decoratos/get-user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserRewards } from './dtos/user-rewards.dto';

@UseGuards(JwtGuard)
@Controller('user-rewards')
export class UserRewardsController {
  constructor(private readonly userRewardsService: UserRewardsService) {}

  @Get('days')
  getAllUserRewards(@User('id') userId: number): Promise<UserRewards[]> {
    return this.userRewardsService.getAllUserRewards(userId);
  }
}
