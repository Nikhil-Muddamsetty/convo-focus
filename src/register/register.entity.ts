import { IsNotEmpty, IsString } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Register {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: String,
    nullable: false,
  })
  dial_code: string;

  @Column()
  @IsNotEmpty()
  @IsString({
    message: 'phone should be a string',
  })
  phone: string;

  @Column({
    type: 'int',
    default: 1,
  })
  otp_resend_count: number;

  @Column({
    type: 'int',
    default: 0,
  })
  otp_attempt_count: number;

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

  @Column({
    type: 'boolean',
    default: false,
  })
  marked_for_deletion: boolean;
}
