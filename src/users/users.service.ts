import { Injectable } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import {
  ClientError,
  CustomError,
  DatabaseResponse,
  ExpectedError,
  ServiceError,
  ServiceResponse,
  UnexpectedError,
  UnhandeledError,
} from 'src/utils/util-class';

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
      return new DatabaseResponse(true, 'Successfully found user', user);
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
}
