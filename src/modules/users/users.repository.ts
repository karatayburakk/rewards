import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: createUserDto });
  }

  getUserById(id: number): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  getUserByEmail(email: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { email } });
  }

  async incrementUserTotalCoins(id: number, coin: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { totalCoins: { increment: coin } },
    });
  }
}
