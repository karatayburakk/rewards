import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRewardsService } from './user-rewards.service';
import { User } from '../../common/decoratos/get-user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserRewardsDto } from './dtos/user-rewards.dto';
import { CollectRewardDto } from './dtos/collect-reward.dto';
import { User as PrismaUser } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('user-rewards')
export class UserRewardsController {
  constructor(private readonly userRewardsService: UserRewardsService) {}

  @Get('days')
  getUserWeeklyRewards(@User('id') userId: number): Promise<UserRewardsDto[]> {
    return this.userRewardsService.getUserWeeklyRewards(userId);
  }

  @Post('collect')
  collectReward(
    @User() user: PrismaUser,
    @Body() collectRewardDto: CollectRewardDto,
  ): Promise<{ status: string; message: string }> {
    return this.userRewardsService.collectReward(user, collectRewardDto);
  }

  @Get('history')
  getUserRewardsHistory(@User('id') userId: number): Promise<UserRewardsDto[]> {
    return this.userRewardsService.getUserRewardsHistory(userId);
  }
}
