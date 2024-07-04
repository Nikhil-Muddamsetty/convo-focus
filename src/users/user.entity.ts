import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Unique,
} from 'typeorm';

@Entity()
@Unique(['dialCode', 'phone'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: String,
        nullable: true
    })
    name: string;

    @Column({
        type: String,
        nullable: false
    })
    dialCode: string;

    @Column({
        type: String,
        nullable: false
    })
    phone: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @Column({
        type: 'boolean',
        default: false
    })
    markedForDeletion: boolean;

}
