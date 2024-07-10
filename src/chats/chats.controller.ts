import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { controllerErrorHandler } from 'src/utils/util-functions';
import { ChatsService } from './chats.service';
import { ChatIdDto } from './dto/chat-id-dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { GetChatWithPhoneDto } from './dto/get-chat-with-phone.dto';

@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Post()
  createChat(@Body() createChatDto: CreateChatDto) {
    try {
      return this.chatsService.createChat({ id: 1 }, createChatDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  // @Get('')
  // getChats() {
  //   try {
  //     return this.chatsService.getChatsOfUser({ id: 1 });
  //   } catch (error) {
  //     controllerErrorHandler(error);
  //   }
  // }

  @Get('/using-phone')
  getChat(@Query() getChatWithPhoneDto: GetChatWithPhoneDto) {
    try {
      return this.chatsService.getChatWithPhone({ id: 1 }, getChatWithPhoneDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Get('/:chatId')
  getChatwithChatId(@Param() chatIdDto: ChatIdDto) {
    try {
      return this.chatsService.getChatWithChatId({ id: 1 }, chatIdDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Patch('/block/:chatId')
  blockChat(@Param() blockChatWithChatIdDto: ChatIdDto) {
    try {
      return this.chatsService.blockChat({ id: 1 }, blockChatWithChatIdDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }

  @Patch('/unblock/:chatId')
  unblockChat(@Param() unblockChatWithChatIdDto: ChatIdDto) {
    try {
      return this.chatsService.unblockChat({ id: 1 }, unblockChatWithChatIdDto);
    } catch (error) {
      controllerErrorHandler(error);
    }
  }
}
