import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Chats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'participant1Id' })
  public participant1: User;

  @Column()
  public participant1Id: number;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'participant2Id' })
  public participant2: User;

  @Column()
  public participant2Id: number;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'blockedByParticipantId' })
  public blockedByParticipant: User;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  blocked: boolean;

  @Column({
    type: 'string',
    default: null,
  })
  blockedByParticipantId: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}
