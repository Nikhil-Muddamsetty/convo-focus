import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ChatsController } from './chats.controller';
import { Chats } from './chats.entity';
import { ChatsService } from './chats.service';

@Module({
  imports: [Chats, TypeOrmModule.forFeature([Chats]), UsersModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
