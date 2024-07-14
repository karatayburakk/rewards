import { IsInt, IsNotEmpty } from 'class-validator';

export class CollectRewardDto {
  @IsNotEmpty()
  @IsInt()
  dayIndex: number;
}
