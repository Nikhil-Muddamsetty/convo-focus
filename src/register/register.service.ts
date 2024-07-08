import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { resendOTP, sendOTP, verifyOTP } from 'otpless-node-js-auth-sdk';
import { UsersService } from 'src/users/users.service';
import {
  DatabaseResponse,
  ServiceError,
  ServiceResponse,
  UnhandeledError,
} from 'src/utils/util-class';
import { Repository, UpdateResult } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Register } from './register.entity';

@Injectable()
export class RegisterService {
  private otpLength = 6;
  private clientId = '94ZCGQDNX672K2UICCQFET40281E668D';
  private clientSecret = 'vbc5tzpkke8vl5x5eiecnssp5hediky7';
  private expiry = 60;
  private email = null;
  private channel = 'SMS';
  private hash = 'KRYNQE4SZCHM1V9LHZ21';
  private MAX_OTP_RESEND_COUNT = 3;

  constructor(
    private userService: UsersService,
    @InjectRepository(Register)
    private registerRepository: Repository<Register>,
  ) {}

  /**
   *
   * @param registerDto `
   * @returns
   *
   * No exisiting user should have the same number
   * Only one active registration request should exist
   * OTP to provided phone for verification
   */
  async registerNewUser(registerDto: RegisterDto): Promise<ServiceResponse> {
    try {
      const getUserWithPhoneResponse: ServiceResponse | ServiceError =
        await this.userService.getUserWithPhone(
          registerDto.dialCode,
          registerDto.phone,
        );

      if (getUserWithPhoneResponse.success) {
        return new ServiceError(
          'User with same phone number already exists',
          null,
        );
      }

      this.markOldRegistrationForDeletionUsingPhoneIfExists(
        registerDto.phone,
        registerDto.dialCode,
      );

      const insertRegistrationResult: DatabaseResponse =
        await this.insertRegistration(registerDto.dialCode, registerDto.phone);

      if (!insertRegistrationResult.success) {
        throw new ServiceError('Failed to create registration record');
      }

      const register: Register = insertRegistrationResult.data;

      // method signature - https://otpless.com/platforms/node?sdkTab=OTP
      // sendOTP(phoneNumber, email, channel, hash, orderId, expiry, otpLength, clientId, clientSecret);
      const sendOtpResponse = await sendOTP(
        register.dial_code + register.phone,
        null,
        this.channel,
        this.hash,
        register.id,
        this.expiry,
        this.otpLength,
        this.clientId,
        this.clientSecret,
      );

      if (sendOtpResponse?.success === false) {
        if (sendOtpResponse?.errorMessage === 'Invalid Phone number') {
          return new ServiceError('Phone number is invalid, please try again');
        } else {
          throw new UnhandeledError(sendOtpResponse);
        }
      } else {
        return new ServiceResponse(
          'Successfully created new registration request',
          {
            orderId: sendOtpResponse?.orderId,
            numberOfTimesOtpSent: register?.otp_resend_count,
          },
        );
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  /**
   *
   * @param resendOtpDto
   * @returns ServiceResponse
   *
   * Caps the number of otp retries possible and keeps track of it
   */
  async resendVerificationOtp(
    resendOtpDto: ResendOtpDto,
  ): Promise<ServiceResponse> {
    // This is where we will resend verification OTP to users
    try {
      const registerRequest: DatabaseResponse =
        await this.findOneRegistrationUsingPhoneAndId(
          resendOtpDto.dialCode,
          resendOtpDto.phone,
          resendOtpDto.orderId,
        );

      if (!registerRequest.success) {
        return new ServiceError(
          'No register request found with the provided dialCode, phone and orderId',
          null,
        );
      }

      const register: Register = registerRequest.data;

      if (register.otp_resend_count >= this.MAX_OTP_RESEND_COUNT) {
        throw new ServiceError(
          'Maximum number of otp resend request exceeded. Please try again with another phone number',
          null,
        );
      }

      const updateRegistrationOtpSentCountUsingPhoneAndIdResult: DatabaseResponse =
        await this.updateRegistrationOtpSentCountUsingPhoneAndId(
          resendOtpDto.orderId,
          resendOtpDto.phone,
          resendOtpDto.dialCode,
          register.otp_resend_count++,
        );
      if (!updateRegistrationOtpSentCountUsingPhoneAndIdResult.success) {
        throw new ServiceError('Failed to update OTP count, please try again');
      }

      // method signature - https://otpless.com/platforms/node?sdkTab=OTP
      // resendOTP(orderId, clientId, clientSecret);
      const resendOtpResponse = await resendOTP(
        resendOtpDto.orderId,
        this.clientId,
        this.clientSecret,
      );

      if (resendOtpResponse?.success === false) {
        if (
          resendOtpResponse?.errorMessage === "OTP can't resent within 1 min."
        ) {
          throw new ServiceError(
            "OTP can't resent within 1 min, please try after 1 min",
          );
        } else {
          throw new UnhandeledError(resendOtpResponse);
        }
      } else {
        return new ServiceResponse('Successfully resent OTP to your number', {
          orderId: resendOtpResponse?.orderId,
          numberOfTimesOtpSent: register.otp_resend_count++,
        });
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const findOneRegistrationUsingPhoneAndIdResponse: DatabaseResponse =
        await this.findOneRegistrationUsingPhoneAndId(
          verifyOtpDto.dialCode,
          verifyOtpDto.phone,
          verifyOtpDto.orderId,
        );

      if (!findOneRegistrationUsingPhoneAndIdResponse.success) {
        throw new ServiceError(
          'No register request found with the provided dialCode, phone and orderId',
        );
      }

      const register: Register =
        findOneRegistrationUsingPhoneAndIdResponse.data;

      if (register.otp_attempt_count >= 3) {
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
        const registerUpdateResult: DatabaseResponse =
          await this.updateRegistrationOtpAttemptCountUsingPhoneAndId(
            verifyOtpDto.orderId,
            verifyOtpDto.phone,
            verifyOtpDto.dialCode,
            register.otp_attempt_count++,
          );
        if (!registerUpdateResult?.success) {
          throw new UnhandeledError(registerUpdateResult);
        }

        if (verifyOtpResponse?.reason === 'Incorrect OTP!') {
          throw new ServiceError('Invalid OTP, please enter correct OTP.');
        } else {
          throw new UnhandeledError(registerUpdateResult);
        }
      }

      const createNewUserResult: ServiceResponse =
        await this.userService.createNewUser({
          dialCode: register.dial_code,
          phone: register.phone,
        });
      if (!createNewUserResult.success) {
        throw new ServiceError(
          createNewUserResult?.message,
          createNewUserResult?.data,
        );
      }

      const markRegisterForDeletionUsingPhoneAndIdResult: DatabaseResponse =
        await this.markRegistrationForDeletionUsingPhoneAndId(
          verifyOtpDto.orderId,
          verifyOtpDto.phone,
          verifyOtpDto.dialCode,
        );
      if (!markRegisterForDeletionUsingPhoneAndIdResult.success) {
        throw new UnhandeledError(createNewUserResult);
      }

      return new ServiceResponse('Successfully registered.', null);
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  private async insertRegistration(
    dialCode: string,
    phone: string,
  ): Promise<DatabaseResponse> {
    try {
      let insertResult: Register = await this.registerRepository.save({
        phone,
        dial_code: dialCode,
      });
      if (insertResult) {
        return new DatabaseResponse(
          true,
          'Successfully inserted register record.',
          insertResult,
        );
      } else {
        return new DatabaseResponse(
          false,
          'Failed to insert register record',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError('Database error, please try again.');
    }
  }

  private async findOneRegistrationUsingPhoneAndId(
    dialCode: string,
    phone: string,
    id: number,
  ): Promise<DatabaseResponse> {
    try {
      let findResult: Register = await this.registerRepository.findOne({
        where: { phone, dial_code: dialCode, id, marked_for_deletion: false },
      });
      if (findResult) {
        return new DatabaseResponse(
          true,
          'Successfully found register record.',
          findResult,
        );
      } else {
        return new DatabaseResponse(
          false,
          'No records matched the provided phone and ID',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError('Database error, please try again.');
    }
  }

  private async updateRegistrationOtpSentCountUsingPhoneAndId(
    orderId: number,
    phone: string,
    dialCode: string,
    updatedOtpResendCount,
  ): Promise<DatabaseResponse> {
    try {
      const updateResult = await this.registerRepository.update(
        { id: orderId, phone, dial_code: dialCode, marked_for_deletion: false },
        { otp_resend_count: updatedOtpResendCount },
      );
      if (updateResult.affected === 1) {
        return new DatabaseResponse(
          true,
          'Successfully updated otp sent count.',
          null,
        );
      } else {
        return new DatabaseResponse(
          false,
          'Failed to update otp sent count',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError('Database error, please try again.');
    }
  }

  private async updateRegistrationOtpAttemptCountUsingPhoneAndId(
    orderId: number,
    phone: string,
    dialCode: string,
    updatedOtpAttemptCount,
  ): Promise<DatabaseResponse> {
    try {
      const updateResult: UpdateResult = await this.registerRepository.update(
        { id: orderId, phone, dial_code: dialCode, marked_for_deletion: false },
        { otp_attempt_count: updatedOtpAttemptCount },
      );
      if (updateResult.affected === 1) {
        return new DatabaseResponse(
          true,
          'Successfully updated otp attempt count.',
          null,
        );
      } else {
        return new DatabaseResponse(
          false,
          'Failed to update otp attempt count',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError('Database error, please try again.');
    }
  }

  private async markRegistrationForDeletionUsingPhoneAndId(
    orderId: number,
    phone: string,
    dialCode: string,
  ): Promise<DatabaseResponse> {
    try {
      const updateResult: UpdateResult = await this.registerRepository.update(
        { id: orderId, phone, dial_code: dialCode, marked_for_deletion: false },
        { marked_for_deletion: true },
      );
      if (updateResult.affected === 1) {
        return new DatabaseResponse(
          true,
          'Successfully marked registration for deletion',
          null,
        );
      } else {
        return new DatabaseResponse(
          false,
          'Failed to mark registration record for deletion',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError('Database error, please try again.');
    }
  }

  private async markOldRegistrationForDeletionUsingPhoneIfExists(
    phone: string,
    dialCode: string,
  ): Promise<DatabaseResponse> {
    try {
      let updateResult: UpdateResult = await this.registerRepository.update(
        { phone, dial_code: dialCode, marked_for_deletion: false },
        { marked_for_deletion: true },
      );
      if (updateResult.affected > 0) {
        return new DatabaseResponse(
          true,
          'Successfully marked registration for deletion',
          null,
        );
      } else {
        return new DatabaseResponse(
          true,
          'No records found to be marked for deletion',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError('Database error, please try again.');
    }
  }
}
