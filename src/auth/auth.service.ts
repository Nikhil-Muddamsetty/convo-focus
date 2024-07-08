import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sendOTP, verifyOTP } from 'otpless-node-js-auth-sdk';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import {
  DatabaseResponse,
  ServiceError,
  ServiceResponse,
  UnhandeledError,
} from 'src/utils/util-class';
import { v7 as uuidV7 } from 'uuid';
import { SignInDto } from './dto/signin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

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

      console.log(
        'getUserWithPhoneResponse',
        getUserWithPhoneResponse,
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

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const getUserWithPhoneResponse: ServiceResponse | ServiceError =
        await this.usersService.getUserWithPhone(
          verifyOtpDto.dialCode,
          verifyOtpDto.phone,
        );

      if (!getUserWithPhoneResponse.success) {
        return new ServiceError('No user found with the provided phone.');
      }

      const user: User = getUserWithPhoneResponse.data;

      if (!user.is_active) {
        return new ServiceError('user has been blocked.');
      }

      if (user.otp_attempt_count >= 3) {
        throw new ServiceError(
          'You have crossed the maximum number of wrong OTP allowed. Please try again with another phone number or else after 24 hours with the same number',
        );
      }

      // method signature - https://otpless.com/platforms/node?sdkTab=OTP
      // const response = await verifyOTP(email, phoneNumber, orderId, otp, clientId, clientSecret);
      const verifyOtpResponse = await verifyOTP(
        null,
        verifyOtpDto.dialCode + verifyOtpDto.phone,
        verifyOtpDto.orderId,
        verifyOtpDto.otp,
        this.clientId,
        this.clientSecret,
      );

      if (verifyOtpResponse?.success === false) {
        throw new UnhandeledError(verifyOtpResponse);
      } else if (verifyOtpResponse?.isOTPVerified === false) {
        const updateOtpAttemptCountUsingIdResult: DatabaseResponse =
          await this.usersService.updateOtpAttemptCountUsingId(user.id);

        if (!updateOtpAttemptCountUsingIdResult?.success) {
          throw new UnhandeledError(updateOtpAttemptCountUsingIdResult);
        }

        if (verifyOtpResponse?.reason === 'Incorrect OTP!') {
          throw new ServiceError('Invalid OTP, please enter correct OTP.');
        } else {
          throw new UnhandeledError(updateOtpAttemptCountUsingIdResult);
        }
      }

      const refreshTokenPayload = {
        type: 'REFRESH',
        sub: String(user.id),
      };

      const refreshTokenOptions = {
        expiresIn: '50d',
        audience: 'browser',
        issuer: 'convo-focus',
        subject: String(user.id),
      };

      const accessTokenPayload = {
        type: 'ACCESS',
        sub: String(user.id),
      };

      const accessTokenOptions = {
        expiresIn: '5m',
        audience: 'browser',
        issuer: 'convo-focus',
        subject: String(user.id),
      };

      return new ServiceResponse('OTP verified successfully', {
        refreshToken: this.jwtService.sign(
          refreshTokenPayload,
          refreshTokenOptions,
        ),
        accessToken: this.jwtService.sign(
          accessTokenPayload,
          accessTokenOptions,
        ),
      });
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async dummyToken(params: any): Promise<ServiceResponse> {
    const token = this.jwtService.sign(params, { expiresIn: '60d' });
    return new ServiceResponse('Successfully created dummy token', { token });
  }
}
