import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly number: number;

  @IsString()
  @IsNotEmpty()
  readonly message: string;
}
