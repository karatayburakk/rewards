import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRewardsRepository } from './user-rewards.repository';
import * as moment from 'moment-timezone';
import { UserRewardsDto } from './dtos/user-rewards.dto';
import { CollectRewardDto } from './dtos/collect-reward.dto';
import { RewardsRepository } from '../rewards/rewards.repository';
import { State } from './dtos/create-user-rewards-dto';

@Injectable()
export class UserRewardsService {
  constructor(
    private readonly userRewardsRepository: UserRewardsRepository,
    private readonly rewardsRepository: RewardsRepository,
  ) {}

  async getAllUserRewards(userId: number): Promise<UserRewardsDto[]> {
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

  async collectReward(
    userId: number,
    collectRewardDto: CollectRewardDto,
  ): Promise<{ status: string; message: string }> {
    const { dayIndex } = collectRewardDto;

    const userReward = await this.userRewardsRepository.getUserRewardByDayIndex(
      userId,
      dayIndex,
    );

    if (!userReward) {
      throw new BadRequestException('Invalid reward day index');
    }

    if (userReward.state === State.Claimed) {
      return {
        status: 'error',
        message: 'Bugün için ödül zaten toplandı.',
      };
    }

    const currentUtcTime = moment.utc().toDate();
    console.log(userReward);
    console.log(currentUtcTime);
    if (
      userReward.state !== 1 ||
      currentUtcTime < userReward.claimStartDate ||
      (userReward.claimEndDate && currentUtcTime > userReward.claimEndDate)
    ) {
      return {
        status: 'error',
        message: 'Vakti gelmemiş gün için ödül toplanamaz.',
      };
    }

    await this.userRewardsRepository.updateUserReward(userReward.id, {
      state: State.Claimed, // Claimed
      claimedAt: currentUtcTime,
    });

    const nextDayIndex = (dayIndex % 7) + 1;
    const nextReward = await this.userRewardsRepository.getUserRewardByDayIndex(
      userId,
      nextDayIndex,
    );

    if (nextReward) {
      if (nextDayIndex === 1) {
        // Start a new cycle
        await this.createNewCycleRewards(userId, currentUtcTime);
      } else {
        // Update the next day's reward state without changing dates
        await this.userRewardsRepository.updateUserReward(nextReward.id, {
          state: State.Active, // Active
        });
      }
    }
    return {
      status: 'success',
      message: 'Ödül başarıyla toplandı.',
    };
  }

  async getUserRewardsHistory(userId: number): Promise<UserRewardsDto[]> {
    const userRewards =
      await this.userRewardsRepository.getUserRewardsHistory(userId);

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

  private async createNewCycleRewards(userId: number, startDate: Date) {
    const rewards = await this.rewardsRepository.getAllRewards();

    const newCycleRewards = rewards.map((reward) => {
      let claimStartDate: Date, claimEndDate: Date;

      if (reward.dayNumber === 1) {
        claimStartDate = moment(startDate).toDate();
        claimEndDate = null;
      } else {
        claimStartDate = moment(startDate)
          .add(reward.dayNumber - 1, 'days')
          .startOf('day')
          .toDate();
        claimEndDate = moment(claimStartDate).endOf('day').toDate();
      }

      return {
        userId: userId,
        rewardId: reward.id,
        claimStartDate: claimStartDate,
        claimEndDate: claimEndDate,
        state: reward.dayNumber === State.Active ? State.Active : State.Locked, // First day active, rest locked
      };
    });

    await this.userRewardsRepository.createUserRewards(newCycleRewards);
  }
}
