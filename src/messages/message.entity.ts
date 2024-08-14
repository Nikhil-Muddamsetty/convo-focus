import { Chats } from 'src/chats/chats.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chats, (chat) => chat)
  @JoinColumn({ name: 'chatId' })
  public chat: Chats;

  @Column()
  chatId: number;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'fromUserId' })
  public from: User;

  @Column()
  fromUserId: number;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'toUserId' })
  public to: User;

  @Column()
  toUserId: number;

  @Column()
  message: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
