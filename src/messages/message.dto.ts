import { IsEmail, IsNotEmpty } from 'class-validator';

export class PushMessageDto {
    @IsNotEmpty()
    from: string;

    @IsNotEmpty()
    to: string;

    @IsNotEmpty()
    message: string;

}
