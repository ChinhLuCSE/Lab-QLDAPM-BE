import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import Encryptor from './encryptor';
import { SigninAuthDto } from './dto/signin.auth.dto';
import { SignupAuthDto } from './dto/signup.auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    signinAuthDto: SigninAuthDto,
  ): Promise<{ access_token: string; role: number }> {
    const user = await this.prisma.user.findFirst({
      where: { username: signinAuthDto.username },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    const passwordMatch = await Encryptor.comparePassword(
      signinAuthDto.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      role: user.roles[0].roleId,
    };
  }

  async signUp(
    signUpAuthDto: SignupAuthDto,
  ): Promise<{ access_token: string }> {
    const hashedPassword = await Encryptor.hashPassword(signUpAuthDto.password);
    const user = await this.prisma.user.create({
      data: { username: signUpAuthDto.username, password: hashedPassword },
    });
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
