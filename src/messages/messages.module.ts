import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from 'src/chats/chats.module';
import { Message } from './message.entity';
import { MessageService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ChatsModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessagesModule {}
