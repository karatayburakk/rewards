import { Module } from '@nestjs/common';
import { RewardsRepository } from './rewards.repository';

@Module({ providers: [RewardsRepository], exports: [RewardsRepository] })
export class RewardsModule {}
