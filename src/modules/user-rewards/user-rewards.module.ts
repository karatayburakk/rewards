import { Module } from '@nestjs/common';
import { UserRewardsRepository } from './user-rewards.repository';
import { UserRewardsService } from './user-rewards.service';
import { UserRewardsController } from './user-rewards.controller';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [RewardsModule],
  controllers: [UserRewardsController],
  providers: [UserRewardsService, UserRewardsRepository],
  exports: [UserRewardsRepository],
})
export class UserRewardsModule {}
