import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthController } from './auth.controller';
import { RewardsModule } from '../rewards/rewards.module';
import { UserRewardsModule } from '../user-rewards/user-rewards.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    RewardsModule,
    UserRewardsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
