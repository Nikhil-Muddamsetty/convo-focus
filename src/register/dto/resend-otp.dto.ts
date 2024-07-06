import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ResendOtpDto {

  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  dialCode: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}