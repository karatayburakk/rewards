import { Expose } from 'class-transformer';

export class UserInfoDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  email: string;

  @Expose()
  timeZone: string;

  @Expose()
  totalCoins: number;
}
