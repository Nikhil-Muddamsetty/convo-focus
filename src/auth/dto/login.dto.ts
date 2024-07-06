import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  dialCode: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
