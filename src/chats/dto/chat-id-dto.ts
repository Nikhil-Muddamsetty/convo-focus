import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChatIdDto {
  @IsNotEmpty()
  @IsUUID()
  chatId: string;
}
