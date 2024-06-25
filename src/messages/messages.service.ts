
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { PushMessageDto } from './message.dto';

@Injectable()
export class MessageService {

    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) { }

    pushNewMessage(message: PushMessageDto): void {
        this.messageRepository.save(message);
        console.log(message, "message")
    }
}
