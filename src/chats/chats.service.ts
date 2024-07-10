import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import {
  DatabaseResponse,
  ServiceError,
  ServiceResponse,
  UnhandeledError,
} from 'src/utils/util-class';
import { Repository, UpdateResult } from 'typeorm';
import { Chats } from './chats.entity';
import { ChatIdDto } from './dto/chat-id-dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { GetChatWithPhoneDto } from './dto/get-chat-with-phone.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chats)
    private chatsRepository: Repository<Chats>,
    private usersService: UsersService,
  ) {}

  async createChat(
    user: any,
    createChatDto: CreateChatDto,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const getUserWithPhoneResult = await this.usersService.getUserWithPhone(
        createChatDto.dialCode,
        createChatDto.phone,
      );

      if (!getUserWithPhoneResult.success) {
        return new ServiceError('No user with the provided phone found');
      }

      const participant2 = getUserWithPhoneResult?.data?.data;

      const findOneChatUsingUserIdAndPhoneNumberResult =
        await this.findOneChatUsingUserIdsOfParticipants(
          user.id,
          participant2.id,
        );

      if (findOneChatUsingUserIdAndPhoneNumberResult.success) {
        return new ServiceError('Chat already exists.', {
          chatId: findOneChatUsingUserIdAndPhoneNumberResult?.data?.id,
        });
      }

      const newChat = await this.insertOneChat(user.id, participant2.id);
      if (newChat.success) {
        return new ServiceResponse('Chat created successfully.', newChat.data);
      } else {
        return new ServiceError('Failed to create chat.', null);
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async getChatWithPhone(user: any, getChatWithPhoneDto: GetChatWithPhoneDto) {
    try {
      const getUserWithPhoneResult = await this.usersService.getUserWithPhone(
        getChatWithPhoneDto.dialCode,
        getChatWithPhoneDto.phone,
      );

      if (!getUserWithPhoneResult.success) {
        return new ServiceError('No user with the provided phone found');
      }

      const participant2 = getUserWithPhoneResult?.data?.data;

      const findOneChatUsingUserIdAndPhoneNumberResult: DatabaseResponse =
        await this.findOneChatUsingUserIdsOfParticipants(
          user.id,
          participant2.id,
        );

      if (findOneChatUsingUserIdAndPhoneNumberResult.success) {
        return new ServiceResponse(
          'Chat details found successfully.',
          findOneChatUsingUserIdAndPhoneNumberResult?.data,
        );
      } else {
        return new ServiceError('No chat found with the provided phone.');
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async getChatWithChatId(user: any, chatIdDto: ChatIdDto) {
    try {
      const findOneChatUsingChatIdResult: DatabaseResponse =
        await this.findOneChatUsingChatId(chatIdDto.chatId, user.id);

      if (findOneChatUsingChatIdResult.success) {
        return new ServiceResponse(
          'Chat details found successfully.',
          findOneChatUsingChatIdResult?.data,
        );
      } else {
        return new ServiceError('No chat found with the provided chat ID.');
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  async blockChat(
    user: any,
    blockChatWithChatId: ChatIdDto,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const findOneChatUsingChatIdResult: DatabaseResponse =
        await this.findOneChatUsingChatId(blockChatWithChatId.chatId, user.id);

      if (!findOneChatUsingChatIdResult.success) {
        return new ServiceError('No chat found with the provided chat ID.');
      }

      const chat: Chats = findOneChatUsingChatIdResult.data;

      if (chat.blocked === true) {
        return new ServiceError('Chat is already blocked.');
      }

      const blockChatUsingChatIdResponse: DatabaseResponse =
        await this.blockChatUsingChatId(chat.id, user.id);

      if (blockChatUsingChatIdResponse.success) {
        return new ServiceResponse('Chat blocked successfully.');
      } else {
        return new ServiceError('Failed to block chat, please try again.');
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }

  /**
   *
   * @function unblockChat
   * @description Unblocks a chat using the chat ID and only if the participant who blocked is the user
   *
   * @param user
   * @param unblockChatWithChatId
   * @returns Promise<ServiceResponse| ServiceError>
   */
  async unblockChat(
    user: any,
    unblockChatWithChatId: ChatIdDto,
  ): Promise<ServiceResponse | ServiceError> {
    try {
      const findOneChatUsingChatIdResult: DatabaseResponse =
        await this.findOneChatUsingChatId(
          unblockChatWithChatId.chatId,
          user.id,
        );

      if (!findOneChatUsingChatIdResult.success) {
        return new ServiceError('No chat found with the provided chat ID.');
      }

      const chat: Chats = findOneChatUsingChatIdResult.data;

      if (chat.blocked === false) {
        return new ServiceError('Chat is not blocked.');
      }

      if (chat.blockedByParticipantId !== user.id) {
        return new ServiceError('You are not authorized to unblock this chat.');
      }

      const unblockChatUsingChatIdResponse: DatabaseResponse =
        await this.unblockChatUsingChatId(chat.id, user.id);

      if (unblockChatUsingChatIdResponse.message) {
        return new ServiceResponse('Chat unblocked successfully.');
      } else {
        return new ServiceError('Failed to unblock chat, please try again.');
      }
    } catch (error) {
      if (error instanceof UnhandeledError) {
        throw error;
      } else {
        throw new UnhandeledError(error);
      }
    }
  }
  // Database functions from here

  async findOneChatUsingUserIdsOfParticipants(
    participant1Id: number,
    participant2Id: number,
  ): Promise<DatabaseResponse> {
    try {
      const chat = await this.chatsRepository.findOne({
        where: { participant1Id, participant2Id },
      });

      if (chat) {
        return new DatabaseResponse(
          true,
          'Successfully found chat details.',
          chat,
        );
      } else {
        return new DatabaseResponse(
          false,
          'No chat found with the provided user ids.',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  async insertOneChat(
    participant1Id: number,
    participant2Id: number,
  ): Promise<DatabaseResponse> {
    try {
      if (participant1Id > participant2Id) {
        participant1Id += participant2Id;
        participant2Id = participant1Id - participant2Id;
        participant1Id -= participant2Id;
      }

      const chat = await this.chatsRepository.save({
        participant1Id,
        participant2Id,
      });
      if (chat) {
        return new DatabaseResponse(true, 'Chat created successfully.', chat);
      } else {
        return new DatabaseResponse(false, 'Failed to create chat.', null);
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  async findOneChatUsingChatId(
    chatId: string,
    userId: number,
  ): Promise<DatabaseResponse> {
    try {
      const chat = await this.chatsRepository.findOne({
        where: [
          { id: chatId, participant1Id: userId },
          { id: chatId, participant2Id: userId },
        ],
      });

      if (chat) {
        return new DatabaseResponse(
          true,
          'Successfully found chat details.',
          chat,
        );
      } else {
        return new DatabaseResponse(
          false,
          'No chat found with the provided chat ID.',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  async blockChatUsingChatId(
    chatId: string,
    userId: number,
  ): Promise<DatabaseResponse> {
    try {
      const updateResult: UpdateResult = await this.chatsRepository.update(
        { id: chatId },
        {
          blocked: true,
          blockedByParticipantId: userId,
        },
      );

      if (updateResult.affected === 1) {
        return new DatabaseResponse(true, 'Chat blocked successfully.', null);
      } else {
        return new DatabaseResponse(
          false,
          'No chat found with the provided chat ID.',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }

  async unblockChatUsingChatId(
    chatId: string,
    userId: number,
  ): Promise<DatabaseResponse> {
    try {
      const updateResult: UpdateResult = await this.chatsRepository.update(
        { id: chatId, blockedByParticipantId: userId },
        {
          blocked: false,
          blockedByParticipantId: null,
        },
      );

      if (updateResult.affected === 1) {
        return new DatabaseResponse(true, 'Chat unblocked successfully.', null);
      } else {
        return new DatabaseResponse(
          false,
          'No chat found with the provided chat ID.',
          null,
        );
      }
    } catch (error) {
      throw new UnhandeledError(error);
    }
  }
}
