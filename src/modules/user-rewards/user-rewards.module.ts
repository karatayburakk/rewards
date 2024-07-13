import { Module } from '@nestjs/common';
import { UserRewardsRepository } from './user-rewards.repository';
import { UserRewardsService } from './user-rewards.service';
import { UserRewardsController } from './user-rewards.controller';

@Module({
  controllers: [UserRewardsController],
  providers: [UserRewardsService, UserRewardsRepository],
  exports: [UserRewardsRepository],
})
export class UserRewardsModule {}
