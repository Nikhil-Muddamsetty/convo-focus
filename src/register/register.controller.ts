import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/public.meta';
import { ResendOtpDto } from 'src/auth/dto/resend-otp.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { RegisterService } from './register.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ExpectedError } from 'src/utils/util-class';
import { sendExceptionToSentry } from 'src/utils/util-functions';

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
      if (error instanceof ExpectedError) {
        throw new BadRequestException(error.message);
      } else {
        sendExceptionToSentry(error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  @Post('resend-otp-phone')
  async resendOtpPhone(@Body() resendOtpDto: ResendOtpDto) {
    try {
      return await this.registerService.resendVerificationOtp(resendOtpDto);
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw new BadRequestException(error.message);
      } else {
        sendExceptionToSentry(error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  @Post('verify-otp-phone')
  async verifyOtpPhone(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<any | Error> {
    try {
      return await this.registerService.verifyOtp(verifyOtpDto);
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw new BadRequestException(error.message);
      } else {
        sendExceptionToSentry(error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
