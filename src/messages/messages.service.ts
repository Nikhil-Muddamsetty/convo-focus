import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsService } from 'src/chats/chats.service';
import {
  DatabaseResponse,
  ServiceResponse,
  UnhandeledError,
} from 'src/utils/util-class';
import { Repository } from 'typeorm';
import { PushMessageDto } from './message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private chatService: ChatsService,
  ) {}

  pushNewMessage(message: PushMessageDto): void {
    console.log(message, 'message');
  }

  async createMessage(
    pushMessageDto: PushMessageDto,
  ): Promise<ServiceResponse> {
    try {
      // const getChatWithChatIdResult = await this.chatService.getChatWithChatId(
      //   user,
      //   pushMessageDto.chatId,
      // );
      return new ServiceResponse('Message sent successfully', true);
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  async getMessagesByChatIdAndUserId(
    chatId: number,
    userId: number,
  ): Promise<Message[]> {
    return await this.messageRepository.find({
      where: [
        { chatId, fromUserId: userId },
        { chatId, toUserId: userId },
      ],
    });
  }

  async insertMessage(
    chatId: number,
    fromUserId: number,
    toUserId: number,
    message: string,
  ): Promise<DatabaseResponse> {
    try {
      const user = await this.messageRepository.save({
        chatId,
        fromUserId,
        toUserId,
        message,
      });
      return new DatabaseResponse(true, 'Successfully inserted user', user);
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }
}
