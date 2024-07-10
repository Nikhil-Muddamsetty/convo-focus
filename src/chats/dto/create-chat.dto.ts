import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  readonly dialCode: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;
}
