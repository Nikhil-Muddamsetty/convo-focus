import { BadRequestException, Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { Public } from '../auth/public.meta';
import { ExpectedError } from '../utils/ExpectedError';
import { OnboardingService } from './onboarding.service';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Public()
@Controller('onboarding')
export class OnboardingController {

  constructor(
    private onboardingService: OnboardingService
  ) {}

  @Post('verify-otp-phone')
  async verifyOtpPhone(@Body() verifyOtpDto: VerifyOtpDto): Promise<any | Error> {
    try {
      return await this.onboardingService.verifyOtp(verifyOtpDto);
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
