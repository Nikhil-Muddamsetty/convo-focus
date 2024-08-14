import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class PushMessageDto {
  @IsNotEmpty()
  @IsInt()
  chatId: number;

  @IsNotEmpty()
  @IsInt()
  from: number;

  @IsNotEmpty()
  @IsInt()
  to: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
