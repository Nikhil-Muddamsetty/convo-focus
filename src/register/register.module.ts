import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Register } from './register.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Register])],
  providers: [RegisterService],
  controllers: [RegisterController],
  exports: [RegisterService],
})
export class RegisterModule {}
