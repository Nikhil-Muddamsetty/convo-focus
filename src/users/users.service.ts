
import { Injectable } from '@nestjs/common';
import { CountryDialCodeEnum } from 'src/utils/countryCode';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

    async findOneUsingPhone(dialCode: CountryDialCodeEnum, phone: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({ where: { phone, dialCode } });
        } catch (error) {
            console.log("error", error)
            return null;
        }
    }
}
