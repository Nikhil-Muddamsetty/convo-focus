import { IsEnum, IsString, Length } from "class-validator";
import { CountryDialCodeEnum } from "src/utils/countryCode";

export class LoginDto {
    @IsString()
    @IsEnum(CountryDialCodeEnum)
    dialCode: CountryDialCodeEnum;

    @IsString()
    phone: string;
}