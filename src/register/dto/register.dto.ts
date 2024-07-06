import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  dialCode: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
