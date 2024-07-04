import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { ExpectedError } from 'src/utils/ExpectedError';
import { Onboarding } from './onboarding.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { sendOTP, resendOTP, verifyOTP} from 'otpless-node-js-auth-sdk';
import { UnexpectedError } from '../utils/UnexpectedError';
import { ResendOtpDto } from '../auth/dto/resend-otp.dto';
import { User } from '../users/user.entity';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { CreateUserDto } from '../users/dto/createUser.dto';

@Injectable()
export class OnboardingService {

    private otpLength = 6;
    private clientId = '94ZCGQDNX672K2UICCQFET40281E668D';
    private clientSecret = 'vbc5tzpkke8vl5x5eiecnssp5hediky7';
    private expiry = 60;
    // private email = 'nikhil.muddamsetty@gmail.com';
    private email = null;
    private channel = 'SMS';
    private hash = 'KRYNQE4SZCHM1V9LHZ21';
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

            // send verification OTP
            // method signature
            // sendOTP(phoneNumber, email, channel, hash, orderId, expiry, otpLength, clientId, clientSecret);
            const sendOtpResponse = await sendOTP(onboarding.dialCode + onboarding.phone, this.email, this.channel, this.hash, onboarding.id, this.expiry, this.otpLength, this.clientId, this.clientSecret);

            if(sendOtpResponse?.success === false){
                if(sendOtpResponse?.errorMessage === "Invalid Phone number"){
                    throw new ExpectedError("Phone number is invalid, please try again");
                }else{
                    throw new UnexpectedError("Server error, please try again");
                }
            }else{
                return {
                    orderId: sendOtpResponse?.orderId,
                    numberOfTimesOtpSent: onboarding?.otpResendCount
                }
            }
        } catch (error) {
            if(error instanceof UnexpectedError || error instanceof ExpectedError){
                throw error
            }else {
                throw new UnexpectedError("Server error, please try again");
            }
        }
    }

    async resendVerificationOtp(resendOtpDto: ResendOtpDto) {
        // This is where we will resend verification OTP to users
        try {
            // check if same user exists
            const onboardingRequest: Onboarding | null = await this.findOneOnboardingUsingPhoneAndId(resendOtpDto.dialCode, resendOtpDto.phone, resendOtpDto.orderId);

            // if user exists return error stating user with same phone number already exisits
            if (onboardingRequest === null) {
                throw new ExpectedError('No onboarding request found with the provided dialCode, phone and orderId');
            }

            // if otp has been sent more than allowed times then throw error
            if (onboardingRequest.otpResendCount >= 3) {
                throw new ExpectedError('Maximum number otp request exceeded. Please try again with another phone number');
            }

            // Update the onboarding record to update the otp sent count
            const onboardingUpdateResult: boolean = await this.updateOnboardingOtpSentCountUsingPhoneAndId(resendOtpDto.orderId, resendOtpDto.phone, resendOtpDto.dialCode, onboardingRequest.otpResendCount++ )
            if(onboardingUpdateResult){
                throw new UnexpectedError('Failed to update OTP count, please try again');
            }

            // send verification OTP
            // method signature
            // resendOTP(orderId, clientId, clientSecret);
            const resendOtpResponse = await resendOTP(resendOtpDto.orderId, this.clientId, this.clientSecret);

            if(resendOtpResponse?.success === false){
                if(resendOtpResponse?.errorMessage === "OTP can't resent within 1 min."){
                    throw new ExpectedError("OTP can't resent within 1 min, please try after 1 min");
                }else{
                    throw new UnexpectedError("Server error, please try again");
                }
            }else{
                return {
                    orderId: resendOtpResponse?.orderId,
                    numberOfTimesOtpSent: onboardingRequest.otpResendCount++
                }
            }
        } catch (error) {
            if(error instanceof UnexpectedError || error instanceof ExpectedError){
                throw error
            }else {
                throw new UnexpectedError("Server error, please try again");
            }
        }
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        // This is where we will resend verification OTP to users
        try {
            // check if same user exists
            const onboarding: Onboarding | null = await this.findOneOnboardingUsingPhoneAndId(verifyOtpDto.dialCode, verifyOtpDto.phone, verifyOtpDto.orderId);

            // if onboarding doesn't exist throw error
            if (onboarding === null) {
                throw new ExpectedError('No onboarding request found with the provided dialCode, phone and orderId');
            }

            console.log("onboarding", onboarding)
            // if user has exceeded the number of allowed otp tries throw error
            if (onboarding.otpAttemptCount >= 3) {
                throw new ExpectedError('You have crossed the maximum number of wrong OTP allowed. Please try again with another phone number or else after 24 hours with the same number');
            }

            // verify verification OTP - https://otpless.com/platforms/node?sdkTab=OTP
            // method signature
            // const response = await verifyOTP(email, phoneNumber, orderId, otp, clientId, clientSecret);
            const verifyOtpResponse = await verifyOTP(null, verifyOtpDto.dialCode + verifyOtpDto.phone, verifyOtpDto.orderId, verifyOtpDto.otp, this.clientId, this.clientSecret);

            console.log("verifyOtpResponse", verifyOtpResponse)
            if(verifyOtpResponse?.success === false){
                throw new UnexpectedError("Server error, please try again");
            }else if(verifyOtpResponse?.isOTPVerified === false){
                const onboardingUpdateResult: boolean = await this.updateOnboardingOtpAttemptCountUsingPhoneAndId(verifyOtpDto.orderId, verifyOtpDto.phone, verifyOtpDto.dialCode, onboarding.otpAttemptCount++ )
                if(!onboardingUpdateResult){
                    throw new UnexpectedError('Failed to update OTP attempt count, please try again.');
                } else if (verifyOtpResponse?.reason === "Incorrect OTP!"){
                    throw new ExpectedError("Invalid OTP, please enter correct OTP.");
                } else{
                    throw new UnexpectedError("Failed to verify OTP please try again.");
                }
            }

            // create new record in the user module
            const user: User = await this.userService.createNewUser({dialCode: onboarding.dialCode, phone: onboarding.phone});
            if(!user){
                throw new UnexpectedError("Failed to create user, please try again");
            }

            // delete the onboarding object after the user is created.
            const markOnboardingForDeletionUsingPhoneAndIdResult: boolean = await this.markOnboardingForDeletionUsingPhoneAndId(verifyOtpDto.orderId, verifyOtpDto.phone, verifyOtpDto.dialCode)

            if(markOnboardingForDeletionUsingPhoneAndIdResult){
                return {

                }
            }
        } catch (error) {
            if(error instanceof UnexpectedError || error instanceof ExpectedError){
                throw error
            }else {
                throw new UnexpectedError("Server error, please try again");
            }
        }
    }

    private async findOneOnboardingUsingPhoneAndId(dialCode: string, phone: string, id: number): Promise<Onboarding | null> {
        try {
            return await this.onboardingRepository.findOne({ where: { phone, dialCode, id } });
        } catch (error) {
            throw new UnexpectedError("Database error, please try again.");
        }
    }

    private async updateOnboardingOtpSentCountUsingPhoneAndId(orderId: number, phone: string, dialCode:string, updatedOtpResendCount): Promise<boolean | null> {
        try {
            const updateResult = await this.onboardingRepository.update({id: orderId, phone, dialCode}, {otpResendCount: updatedOtpResendCount} );
            return updateResult?.affected === 1;
        } catch (error) {
            throw new UnexpectedError("Database error, please try again.");
        }
    }

    private async updateOnboardingOtpAttemptCountUsingPhoneAndId(orderId: number, phone: string, dialCode:string, updatedOtpAttemptCount): Promise<boolean | null> {
        try {
            const updateResult: UpdateResult = await this.onboardingRepository.update({id: orderId, phone, dialCode}, {otpAttemptCount: updatedOtpAttemptCount} );
            return updateResult?.affected === 1;
        } catch (error) {
            throw new UnexpectedError("Database error, please try again.");
        }
    }

    private async markOnboardingForDeletionUsingPhoneAndId(orderId: number, phone: string, dialCode:string): Promise<boolean | null> {
        try {
            const updateResult: UpdateResult = await this.onboardingRepository.update({id: orderId, phone, dialCode}, {markedForDeletion: true} );
            return updateResult.affected === 1;
        } catch (error) {
            throw new UnexpectedError("Database error, please try again.");
        }
    }
}
