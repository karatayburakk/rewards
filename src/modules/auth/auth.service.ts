import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { SignupDto } from './dtos/signup.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SigninDto } from './dtos/signin.dto';
import { RewardsRepository } from '../rewards/rewards.repository';
import * as moment from 'moment-timezone';
import { User } from '@prisma/client';
import { UserRewardsRepository } from '../user-rewards/user-rewards.repository';
import { State } from '../user-rewards/dtos/create-user-rewards-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly rewardsRepository: RewardsRepository,
    private readonly usersRewardsRepository: UserRewardsRepository,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ accessToken: string }> {
    const hashPassword = await this.encryptPassword(signupDto.password);

    const user = await this.usersRepository.createUser({
      email: signupDto.email,
      timeZone: signupDto.timeZone,
      password: hashPassword,
    });

    await this.assignUserRewards(user);

    const accessToken = await this.generateToken(user.id, user.email);
    return { accessToken };
  }

  async signin(signinDto: SigninDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.getUserByEmail(signinDto.email);

    const isMatched = await compare(signinDto.password, user.password);
    if (!isMatched) throw new UnauthorizedException('Credentials are wrong');

    const currentUtcTime = moment.utc().toDate();

    const { claimEndDate } =
      await this.usersRewardsRepository.getCurrentRewardEndTime(user.id);

    if (claimEndDate && currentUtcTime > claimEndDate) {
      await this.usersRewardsRepository.resetCurrentWeekRewards(user.id);
      await this.assignUserRewards(user, currentUtcTime);
    }

    const accessToken = await this.generateToken(user.id, user.email);
    return { accessToken };
  }

  private async encryptPassword(password: string): Promise<string> {
    const salt = await genSalt();
    const hashPassword = await hash(password, salt);
    return hashPassword;
  }

  private async generateToken(id: number, email: string): Promise<string> {
    const payload = { sub: id, email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
      secret: this.config.get<string>('SECRET_KEY'),
    });
    return accessToken;
  }

  private async assignUserRewards(
    user: User,
    currentTime?: Date,
  ): Promise<void> {
    const rewards = await this.rewardsRepository.getAllRewards();

    let previousClaimStartDate = moment.tz(
      currentTime || user.createdAt,
      user.timeZone,
    );

    const userRewards = rewards.map((reward) => {
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

    await this.usersRewardsRepository.createUserRewards(userRewards);
  }
}
