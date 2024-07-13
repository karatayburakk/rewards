import { Expose } from 'class-transformer';

export class UserRewards {
  @Expose()
  dayNumber: number;

  @Expose()
  coin: number;

  @Expose()
  description?: string;

  @Expose()
  claimStartDate: string;

  @Expose()
  claimEndDate: string;

  @Expose()
  state: number;

  @Expose()
  claimedAt: string;
}
