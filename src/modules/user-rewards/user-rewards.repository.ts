import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserRewardsDto } from './dtos/create-user-rewards-dto';
import { Prisma, Reward, UserReward } from '@prisma/client';

@Injectable()
export class UserRewardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserRewards(
    createUserRewardsDto: CreateUserRewardsDto[],
  ): Promise<void> {
    await this.prisma.userReward.createMany({ data: createUserRewardsDto });
  }

  getAllUserRewards(
    userId: number,
  ): Prisma.PrismaPromise<(UserReward & { reward: Reward })[]> {
    return this.prisma.userReward.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { rewardId: 'asc' },
    });
  }
}
