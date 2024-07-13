import { IsDate, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export enum State {
  Locked = 0,
  Active = 1,
  Claimed = 2,
}

export class CreateUserRewardsDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  rewardId: number;

  @IsNotEmpty()
  @IsDate()
  claimStartDate: Date;

  @IsNotEmpty()
  @IsDate()
  claimEndDate: Date;

  @IsNotEmpty()
  @IsEnum(State)
  state: State;
}
