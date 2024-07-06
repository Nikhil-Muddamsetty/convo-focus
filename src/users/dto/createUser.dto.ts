import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  dialCode: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
