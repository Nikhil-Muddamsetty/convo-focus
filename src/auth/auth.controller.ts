import { Body, Controller, Post } from '@nestjs/common';
import { controllerErrorHandler } from 'src/utils/util-functions';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from './public.meta';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() signinDto: SignInDto) {
    try {
      return await this.authService.signin(signinDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Public()
  @Post('verify-otp-phone')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtp(verifyOtpDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Post('logout')
  async logout() {
    // This is where we will implement our logout logic
  }

  @Post('refresh-token')
  async refreshToken() {
    // This is where we will implement our refresh token logic
  }

  @Post('revoke-token')
  async revokeToken() {
    // This is where we will implement our revoke token logic
  }

  @Post('verify-phone')
  async verifyPhone() {
    // This is where we will implement our phone verification logic
  }

  @Post('dummy-token')
  async dummyToken(@Body() body: any) {
    try {
      return await this.authService.dummyToken(body);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }
}
