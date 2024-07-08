import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DatabaseResponse,
  ServiceError,
  ServiceResponse,
  UnhandeledError,
} from 'src/utils/util-class';
import { QueryFailedError, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  Const;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getUserWithPhone(
    dialCode: string,
    phone: string,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const findOneUsingPhoneResponse: DatabaseResponse =
        await this.findOneUsingPhone(dialCode, phone);
      if (findOneUsingPhoneResponse.success) {
        return new ServiceResponse(
          'Successfully found user',
          findOneUsingPhoneResponse,
        );
      } else {
        return new ServiceError('No user with the provided phone found', null);
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async addNewOtpRequestDetails(
    dialCode: string,
    phone: string,
    sentOtpOrderId: string,
    otpResendCount: number,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const findOneUsingPhoneResponse: DatabaseResponse =
        await this.updateSentOtpOrderIdAndOtpResendCount(
          dialCode,
          phone,
          sentOtpOrderId,
          otpResendCount,
        );
      if (findOneUsingPhoneResponse.success) {
        return new ServiceResponse(
          'Successfully added otp request details',
          null,
        );
      } else {
        return new ServiceError('No user with the provided phone found', null);
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async updateOtpAttemptCountUsingId(
    id: number,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const updateOtpAttemptCountResult: DatabaseResponse =
        await this.updateOtpAttemptCount(id);
      if (updateOtpAttemptCountResult.success) {
        return new ServiceResponse(
          'Successfully updated OTP attempt count',
          null,
        );
      } else {
        return new ServiceError(updateOtpAttemptCountResult.message, null);
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  private async updateOtpAttemptCount(id: number): Promise<DatabaseResponse> {
    try {
      const updateResult: UpdateResult = await this.userRepository.update(id, {
        otp_attempt_count: () => 'otp_attempt_count + 1',
      });
      if (updateResult.affected === 1) {
        return new DatabaseResponse(
          true,
          'Successfully updated OTP attempt count',
          null,
        );
      } else {
        return new DatabaseResponse(false, 'User not found', null);
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  async createNewUser(
    createUserDto: CreateUserDto,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const insertNewUserResponse: DatabaseResponse = await this.insertNewUser(
        createUserDto.dialCode,
        createUserDto.phone,
      );
      if (insertNewUserResponse.success) {
        return new ServiceResponse(
          'Successfully created new user',
          insertNewUserResponse.data,
        );
      } else {
        return new ServiceError(
          insertNewUserResponse.message,
          insertNewUserResponse.data,
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

  private async findOneUsingPhone(
    dialCode: string,
    phone: string,
  ): Promise<DatabaseResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { phone, dial_code: dialCode },
      });
      if (user) {
        return new DatabaseResponse(true, 'Successfully found user', user);
      } else {
        return new DatabaseResponse(
          false,
          'No user found with the provided phone',
          user,
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  private async insertNewUser(
    dialCode: string,
    phone: string,
  ): Promise<DatabaseResponse> {
    try {
      const user = await this.userRepository.save({
        dial_code: dialCode,
        phone,
      });
      return new DatabaseResponse(true, 'Successfully inserted user', user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error?.driverError?.code === '23505'
      ) {
        return new DatabaseResponse(
          false,
          'Another user with the same phone exists.',
          null,
        );
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  private async updateSentOtpOrderIdAndOtpResendCount(
    phone: string,
    dialCode: string,
    sentOtpOrderId: string,
    otpResendCount: number,
  ): Promise<DatabaseResponse> {
    try {
      let updateResult: UpdateResult = await this.userRepository.update(
        { phone, dial_code: dialCode, marked_for_deletion: false },
        {
          sentOtpOrderId: () =>
            `array_append("sentOtpOrderId", ${sentOtpOrderId})`,
          otp_resend_count: otpResendCount,
        },
      );
      if ((updateResult.affected = 1)) {
        return new DatabaseResponse(
          true,
          'Successfully updated login request details',
          null,
        );
      } else {
        return new DatabaseResponse(
          true,
          'No records found to be updated.',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }
}
