import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './messages.service';

@Module({
    imports: [TypeOrmModule.forFeature([Message])],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessagesModule { }
