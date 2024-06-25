import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ExpectedError } from 'src/utils/ExpectedError';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    // async validateUser(username: string, pass: string): Promise<any> {
    //     const user = await this.usersService.findOne(username);
    //     if (user && user.password === pass) {
    //         const { password, ...result } = user;
    //         return result;
    //     }
    //     return null;
    // }

    async login(loginDto: LoginDto): Promise<any> {
        try {
            const { phone, dialCode } = loginDto;
            const user = await this.usersService.findOneUsingPhone(dialCode, phone);
            if (user !== null) {
                return {
                    access_token: this.jwtService.sign(user),
                };
            } else {
                throw new ExpectedError('No user found with the provided phone number');
            }
        } catch (error) {
            throw error;
        }
    }

    async register() {
        // This is where we will implement our register logic
    }
}
