import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Reward } from '@prisma/client';

@Injectable()
export class RewardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRewards(): Promise<Reward[]> {
    return this.prisma.reward.findMany();
  }
}
