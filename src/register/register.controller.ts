import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { controllerErrorHandler } from 'src/utils/util-functions';
import { Public } from '../auth/public.meta';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterService } from './register.service';

@Public()
@Controller('register')

export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Public()
  @Post()
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.registerService.registerNewUser(registerDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Post('resend-otp-phone')
  async resendOtpPhone(@Body() resendOtpDto: ResendOtpDto) {
    try {
      return await this.registerService.resendVerificationOtp(resendOtpDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Post('verify-otp-phone')
  async verifyOtpPhone(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<any | Error> {
    try {
      return await this.registerService.verifyOtp(verifyOtpDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }
}
