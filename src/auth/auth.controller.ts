import { BadRequestException, Body, Controller, HttpCode, HttpException, InternalServerErrorException, NotFoundException, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OnboardingService } from 'src/onboarding/onboarding.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.meta';
import { TransformInterceptor } from 'src/utils/interceptors/transform.interceptor';
import { ExpectedError } from 'src/utils/ExpectedError';

@Public()
@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
    // This is where we will implement our auth controller

    constructor(
        private authService: AuthService,
        private onboardingService: OnboardingService,
    ) { }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.authService.login(loginDto);
        } catch (error) {
            if (error instanceof ExpectedError) {
                throw new BadRequestException(error.message);
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        try {
            return await this.onboardingService.onboardNewUser(registerDto);
        } catch (error) {
            if (error instanceof ExpectedError) {
                throw new BadRequestException(error.message);
            } else {
                throw new InternalServerErrorException(error.message);
            }
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

    @Post('verify-otp-phone')
    async verifyOtpPhone() {
        // This is where we will implement our OTP phone verification logic
    }

    @Post('resend-otp-phone')
    async resendOtpPhone() {
        // This is where we will implement our resend OTP phone logic
    }

}
