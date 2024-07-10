import { IsNotEmpty, IsString } from 'class-validator';

export class GetChatWithPhoneDto {
  @IsString()
  @IsNotEmpty()
  readonly dialCode: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;
}
