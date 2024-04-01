import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninAuthDto } from './dto/signin.auth.dto';
import { SignupAuthDto } from './dto/signup.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(
    @Body() signinAuthDto: SigninAuthDto,
  ): Promise<{ access_token: string }> {
    return await this.authService.signIn(signinAuthDto);
  }

  @Post('signup')
  async signUp(
    @Body() signUpAuthDto: SignupAuthDto,
  ): Promise<{ access_token: string }> {
    return await this.authService.signUp(signUpAuthDto);
  }
}
