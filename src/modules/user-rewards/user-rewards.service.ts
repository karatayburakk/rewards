import { Injectable } from '@nestjs/common';
import { UserRewardsRepository } from './user-rewards.repository';
import * as moment from 'moment-timezone';
import { UserRewards } from './dtos/user-rewards.dto';

@Injectable()
export class UserRewardsService {
  constructor(private readonly userRewardsRepository: UserRewardsRepository) {}

  async getAllUserRewards(userId: number): Promise<UserRewards[]> {
    const userRewards =
      await this.userRewardsRepository.getAllUserRewards(userId);

    return userRewards.map((userReward) => ({
      dayNumber: userReward.reward.dayNumber,
      coin: userReward.reward.coin,
      description: userReward.reward.description,
      claimStartDate: moment(userReward.claimStartDate).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      claimEndDate: userReward.claimEndDate
        ? moment(userReward.claimEndDate).format('YYYY-MM-DD HH:mm:ss')
        : null,
      state: userReward.state,
      claimedAt: userReward.claimedAt
        ? moment(userReward.claimedAt).format('YYYY-MM-DD HH:mm:ss')
        : null,
    }));
  }
}
