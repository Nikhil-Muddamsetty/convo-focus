import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sendOTP } from 'otpless-node-js-auth-sdk';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import {
  ServiceError,
  ServiceResponse,
  UnhandeledError,
} from 'src/utils/util-class';
import { v7 as uuidV7 } from 'uuid';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  private otpLength = 6;
  private clientId = '94ZCGQDNX672K2UICCQFET40281E668D';
  private clientSecret = 'vbc5tzpkke8vl5x5eiecnssp5hediky7';
  private expiry = 60;
  private email = null;
  private channel = 'SMS';
  private hash = 'KRYNQE4SZCHM1V9LHZ21';
  private MAX_OTP_RESEND_COUNT = 3;
  private MAX_OTP_ATTEMPT_COUNT = 3;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // async validateUser(username: string, pass: string): Promise<any> {
  //     const user = await this.usersService.findOne(username);
  //     if (user && user.password === pass) {
  //         const { password, ...result } = user;
  //         return result;
  //     }
  //     return null;
  // }

  async signin(signInDto: SignInDto): Promise<ServiceResponse | ServiceError> {
    try {
      const getUserWithPhoneResponse: ServiceResponse | ServiceError =
        await this.usersService.getUserWithPhone(
          signInDto.dialCode,
          signInDto.phone,
        );

      if (!getUserWithPhoneResponse.success) {
        return new ServiceError('No user found with the provided phone.');
      }

      const user: User = getUserWithPhoneResponse.data;

      if (!user.is_active) {
        return new ServiceError('user has been blocked.');
      }

      if (user.otp_attempt_count > this.MAX_OTP_ATTEMPT_COUNT) {
        return new ServiceError(
          'You have crossed the maximum number of wrong OTP allowed. Please try after 24 hours.',
        );
      }

      if (user.otp_resend_count > this.MAX_OTP_RESEND_COUNT) {
        return new ServiceError(
          'Maximum number of otp resend request exceeded.',
        );
      }

      const sentOtpOrderId = new uuidV7();

      const addNewOtpRequestDetails =
        await this.usersService.addNewOtpRequestDetails(
          user.dial_code,
          user.phone,
          sentOtpOrderId,
          user.otp_resend_count++,
        );

      if (!addNewOtpRequestDetails.success) {
        throw new UnhandeledError(addNewOtpRequestDetails);
      }

      // method signature - https://otpless.com/platforms/node?sdkTab=OTP
      // sendOTP(phoneNumber, email, channel, hash, orderId, expiry, otpLength, clientId, clientSecret);
      const sendOtpResponse = await sendOTP(
        user.dial_code + user.phone,
        null,
        this.channel,
        this.hash,
        sentOtpOrderId,
        this.expiry,
        this.otpLength,
        this.clientId,
        this.clientSecret,
      );

      if (!sendOtpResponse?.success) {
        if (sendOtpResponse?.errorMessage === 'Invalid Phone number') {
          throw new ServiceError('Phone number is invalid, please try again');
        } else {
          throw new UnhandeledError(sendOtpResponse);
        }
      } else {
        return new ServiceResponse(
          'Successfully created new registration request',
          {
            orderId: sentOtpOrderId,
            numberOfTimesOtpSent: user.otp_resend_count++,
          },
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }
}
