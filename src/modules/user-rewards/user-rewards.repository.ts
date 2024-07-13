import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserRewardsDto, State } from './dtos/create-user-rewards-dto';
import { Prisma, Reward, UserReward } from '@prisma/client';

@Injectable()
export class UserRewardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserRewards(
    createUserRewardsDto: CreateUserRewardsDto[],
  ): Promise<void> {
    await this.prisma.userReward.createMany({ data: createUserRewardsDto });
  }

  getUserWeeklyRewards(
    userId: number,
  ): Prisma.PrismaPromise<(UserReward & { reward: Reward })[]> {
    return this.prisma.userReward.findMany({
      where: { userId, isCurrentWeek: true },
      include: { reward: true },
      orderBy: { rewardId: 'asc' },
    });
  }

  getUserRewardByDayIndex(
    userId: number,
    dayIndex: number,
  ): Prisma.PrismaPromise<UserReward & { reward: Reward }> {
    return this.prisma.userReward.findFirst({
      where: { userId, reward: { dayNumber: dayIndex } },
      include: { reward: true },
    });
  }

  async updateUserReward(
    userRewardId: number,
    data: Partial<UserReward>,
  ): Promise<void> {
    await this.prisma.userReward.update({
      where: { id: userRewardId },
      data,
    });
  }

  getUserRewardsHistory(
    userId: number,
  ): Prisma.PrismaPromise<(UserReward & { reward: Reward })[]> {
    return this.prisma.userReward.findMany({
      where: { userId, state: State.Claimed },
      include: { reward: true },
      orderBy: { claimedAt: 'asc' },
    });
  }

  async resetCurrentWeekRewards(userId: number): Promise<void> {
    await this.prisma.userReward.updateMany({
      where: { userId, isCurrentWeek: true },
      data: { isCurrentWeek: false },
    });
  }

  async getCurrentRewardEndTime(
    userId: number,
  ): Promise<{ claimEndDate: Date }> {
    const claimEndDate = this.prisma.userReward.findFirst({
      where: { userId, state: 1 },
      select: { claimEndDate: true },
    });

    return claimEndDate;
  }
}
