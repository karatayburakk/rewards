import { Module } from '@nestjs/common';
import { UserRewardsRepository } from './user-rewards.repository';
import { UserRewardsService } from './user-rewards.service';
import { UserRewardsController } from './user-rewards.controller';
import { RewardsModule } from '../rewards/rewards.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RewardsModule, UsersModule],
  controllers: [UserRewardsController],
  providers: [UserRewardsService, UserRewardsRepository],
  exports: [UserRewardsRepository],
})
export class UserRewardsModule {}
