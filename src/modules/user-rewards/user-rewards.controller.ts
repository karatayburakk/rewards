import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRewardsService } from './user-rewards.service';
import { CurrentUser } from '../../common/decoratos/get-user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserRewardsDto } from './dtos/user-rewards.dto';
import { CollectRewardDto } from './dtos/collect-reward.dto';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('user-rewards')
export class UserRewardsController {
  constructor(private readonly userRewardsService: UserRewardsService) {}

  @Get('days')
  getUserWeeklyRewards(@CurrentUser() user: User): Promise<UserRewardsDto[]> {
    return this.userRewardsService.getUserWeeklyRewards(user);
  }

  @Post('collect')
  collectReward(
    @CurrentUser() user: User,
    @Body() collectRewardDto: CollectRewardDto,
  ): Promise<{ status: string; message: string }> {
    return this.userRewardsService.collectReward(user, collectRewardDto);
  }

  @Get('history')
  getUserRewardsHistory(@CurrentUser() user: User): Promise<UserRewardsDto[]> {
    return this.userRewardsService.getUserRewardsHistory(user);
  }
}
