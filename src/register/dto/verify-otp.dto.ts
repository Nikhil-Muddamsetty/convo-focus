import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class VerifyOtpDto {
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

  @IsString()
  @IsNotEmpty()
  otp: string;
}