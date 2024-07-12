import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { SignupDto } from './dtos/signup.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SigninDto } from './dtos/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ accessToken: string }> {
    const hashPassword = await this.encryptPassword(signupDto.password);

    const user = await this.usersRepository.createUser({
      email: signupDto.email,
      timeZone: signupDto.timeZone,
      password: hashPassword,
    });

    const accessToken = await this.generateToken(user.id, user.email);
    return { accessToken };
  }

  async signin(signinDto: SigninDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.getUserByEmail(signinDto.email);

    const isMatched = await compare(signinDto.password, user.password);
    if (!isMatched) throw new UnauthorizedException('Credentials are wrong');

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
}
