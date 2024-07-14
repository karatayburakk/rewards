import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRewardsRepository } from './user-rewards.repository';
import * as moment from 'moment-timezone';
import { UserRewardsDto } from './dtos/user-rewards.dto';
import { CollectRewardDto } from './dtos/collect-reward.dto';
import { RewardsRepository } from '../rewards/rewards.repository';
import { State } from './dtos/create-user-rewards-dto';
import { User } from '@prisma/client';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class UserRewardsService {
  constructor(
    private readonly userRewardsRepository: UserRewardsRepository,
    private readonly rewardsRepository: RewardsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getUserWeeklyRewards(user: User): Promise<UserRewardsDto[]> {
    const userRewards = await this.userRewardsRepository.getUserWeeklyRewards(
      user.id,
    );

    return userRewards.map((userReward) => ({
      dayNumber: userReward.reward.dayNumber,
      coin: userReward.reward.coin,
      description: userReward.reward.description,
      claimStartDate: moment
        .tz(userReward.claimStartDate, user.timeZone)
        .format('YYYY-MM-DD HH:mm:ss'),
      claimEndDate: userReward.claimEndDate
        ? moment
            .tz(userReward.claimEndDate, user.timeZone)
            .format('YYYY-MM-DD HH:mm:ss')
        : null,
      state: userReward.state,
      claimedAt: userReward.claimedAt
        ? moment
            .tz(userReward.claimedAt, user.timeZone)
            .format('YYYY-MM-DD HH:mm:ss')
        : null,
      isCurrentWeek: userReward.isCurrentWeek,
    }));
  }

  async collectReward(user: User, collectRewardDto: CollectRewardDto) {
    const { dayIndex } = collectRewardDto;

    const userRewards = await this.userRewardsRepository.getUserWeeklyRewards(
      user.id,
    );
    const currentReward = userRewards.find(
      (reward) => reward.state === State.Active,
    );
    const requestedReward = userRewards.find(
      (reward) => reward.reward.dayNumber === dayIndex,
    );

    if (!requestedReward) {
      throw new BadRequestException('Invalid reward day index');
    }

    const currentUtcTime = moment.utc().toDate();

    if (
      currentReward &&
      currentReward.claimEndDate &&
      currentUtcTime > currentReward.claimEndDate
    ) {
      await this.createNewCycleRewards(user, currentUtcTime);

      return {
        status: 'error',
        message:
          'Bu ödül için geçerli süre sona ermiştir, yeni bir döngü başlatıldı.',
      };
    }

    if (requestedReward.state === State.Claimed) {
      return {
        status: 'error',
        message: 'Bugün için ödül zaten toplandı.',
      };
    }

    if (
      requestedReward.state !== State.Active ||
      currentUtcTime < currentReward.claimStartDate ||
      (currentReward.claimEndDate &&
        currentUtcTime > currentReward.claimEndDate)
    ) {
      return {
        status: 'error',
        message: 'Vakti gelmemiş gün için ödül toplanamaz.',
      };
    }

    if (requestedReward.reward.dayNumber === 1) {
      await this.updateSubsequentRewards(
        user,
        requestedReward.id,
        currentUtcTime,
      );
    } else {
      await this.userRewardsRepository.updateUserReward(requestedReward.id, {
        state: State.Claimed,
        claimedAt: currentUtcTime,
      });
    }

    await this.usersRepository.incrementUserTotalCoins(
      user.id,
      requestedReward.reward.coin,
    );

    const nextDayIndex = (dayIndex % 7) + 1;
    const nextReward = await this.userRewardsRepository.getUserRewardByDayIndex(
      user.id,
      nextDayIndex,
    );

    if (nextDayIndex === 1) {
      await this.createNewCycleRewards(user, currentUtcTime);
    } else if (nextReward) {
      await this.userRewardsRepository.updateUserReward(nextReward.id, {
        state: State.Active,
      });
    }

    return {
      status: 'success',
      message: 'Ödül başarıyla toplandı.',
    };
  }

  async getUserRewardsHistory(user: User): Promise<UserRewardsDto[]> {
    const userRewards = await this.userRewardsRepository.getUserRewardsHistory(
      user.id,
    );

    return userRewards.map((userReward) => ({
      dayNumber: userReward.reward.dayNumber,
      coin: userReward.reward.coin,
      description: userReward.reward.description,
      claimStartDate: moment
        .tz(userReward.claimStartDate, user.timeZone)
        .format('YYYY-MM-DD HH:mm:ss'),
      claimEndDate: userReward.claimEndDate
        ? moment
            .tz(userReward.claimEndDate, user.timeZone)
            .format('YYYY-MM-DD HH:mm:ss')
        : null,
      state: userReward.state,
      claimedAt: userReward.claimedAt
        ? moment
            .tz(userReward.claimedAt, user.timeZone)
            .format('YYYY-MM-DD HH:mm:ss')
        : null,
      isCurrentWeek: userReward.isCurrentWeek,
    }));
  }

  getUserTotalCoins(userId: number): Promise<{ totalCoins: number }> {
    return this.usersRepository.getUserTotalCoins(userId);
  }

  private async createNewCycleRewards(user: User, startDate: Date) {
    await this.userRewardsRepository.resetCurrentWeekRewards(user.id);

    const rewards = await this.rewardsRepository.getAllRewards();

    let previousClaimStartDate = moment.tz(startDate, user.timeZone);

    const newCycleRewards = rewards.map((reward) => {
      let claimStartDate: Date, claimEndDate: Date;

      if (reward.dayNumber === 1) {
        claimStartDate = previousClaimStartDate.toDate();
        claimEndDate = null;
      } else {
        claimStartDate = previousClaimStartDate
          .add(1, 'days')
          .startOf('day')
          .toDate();
        claimEndDate = moment
          .tz(claimStartDate, user.timeZone)
          .endOf('day')
          .toDate();
      }

      previousClaimStartDate = moment.tz(claimStartDate, user.timeZone);

      return {
        userId: user.id,
        rewardId: reward.id,
        claimStartDate: claimStartDate,
        claimEndDate: claimEndDate,
        state: reward.dayNumber === 1 ? State.Active : State.Locked,
        isCurrentWeek: true,
      };
    });

    await this.userRewardsRepository.createUserRewards(newCycleRewards);
  }

  private async updateSubsequentRewards(
    user: User,
    firstRewardId: number,
    firstRewardClaimedAt: Date,
  ) {
    const userRewards = await this.userRewardsRepository.getUserWeeklyRewards(
      user.id,
    );
    let previousClaimStartDate = moment.tz(firstRewardClaimedAt, user.timeZone);

    for (const reward of userRewards) {
      if (reward.id === firstRewardId) {
        await this.userRewardsRepository.updateUserReward(reward.id, {
          state: State.Claimed,
          claimedAt: firstRewardClaimedAt,
        });
      } else {
        previousClaimStartDate = previousClaimStartDate
          .add(1, 'days')
          .startOf('day');
        const claimStartDate = previousClaimStartDate.toDate();
        const claimEndDate = previousClaimStartDate.endOf('day').toDate();

        await this.userRewardsRepository.updateUserReward(reward.id, {
          claimStartDate,
          claimEndDate,
        });
      }
    }
  }
}
