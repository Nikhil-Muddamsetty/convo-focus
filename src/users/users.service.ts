
import { Injectable } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UnexpectedError } from '../utils/UnexpectedError';
import { CreateUserDto } from './dto/createUser.dto';
import { ExpectedError } from '../utils/ExpectedError';


@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

    async findOneUsingPhone(dialCode: string, phone: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({ where: { phone, dialCode } });
        } catch (error) {
            console.log("error", error)
            return null;
        }
    }

    async createNewUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            return await this.userRepository.save({...createUserDto});
        } catch (error){
            if(error instanceof QueryFailedError && error?.driverError?.code === "23505"){
                throw new ExpectedError("Another user with the same phone exists.");
            }else{
                throw new UnexpectedError(error);
            }

        }
    }

}
