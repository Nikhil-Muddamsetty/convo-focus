import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';

@Entity()
@Unique(['dial_code', 'phone'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: String,
    nullable: false,
  })
  dial_code: string;

  @Column({
    type: String,
    nullable: false,
  })
  phone: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: String, array: true })
  sentOtpOrderId: string[];

  @Column({
    type: 'int',
    default: 0,
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
