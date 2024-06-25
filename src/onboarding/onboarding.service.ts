import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { ExpectedError } from 'src/utils/ExpectedError';
import { Onboarding } from './onboarding.entity';
import { Repository } from 'typeorm';
import { sendOTP } from 'otpless-node-js-auth-sdk';

@Injectable()
export class OnboardingService {

    private otpLength = 6;
    private clientId = '94ZCGQDNX672K2UICCQFET40281E668D';
    private clientSecret = 'vbc5tzpkke8vl5x5eiecnssp5hediky7';
    private expiry = 60;
    private phoneNumber = 'YOUR_PHONE_NUMBER';
    private email = 'YOUR_EMAIL';
    private channel = 'SMS';
    private hash = 'YOUR_HASH';
    private orderId = 'YOUR_ORDER_ID';

    constructor(
        private userService: UsersService,
        @InjectRepository(Onboarding)
        private onboardingRepository: Repository<Onboarding>
    ) { }

    async onboardNewUser(registerDto: RegisterDto) {
        try {
            // check if same user exists
            const user = await this.userService.findOneUsingPhone(registerDto.dialCode, registerDto.phone);
            // if user exists return error stating user with same phone number already exisits
            if (user !== null) {
                throw new ExpectedError('User with same phone number already exists');
            }
            // Insert a new user record to the onboarding table
            const onboarding = await this.onboardingRepository.save(registerDto);
            console.log("onboarding ===> ", onboarding)

            // send verification OTP
            const response = await sendOTP(onboarding.phone, this.email, this.channel, this.hash, this.orderId, this.expiry, this.otpLength, this.clientId, this.clientSecret);
            console.log("response", response);
            return {}

        } catch (error) {
            throw error;
        }
    }

    resendVerificationOtp() {
        // This is where we will resend verification OTP to users
    }

}
