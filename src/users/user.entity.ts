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
@Unique(['dial_code', 'phone'])
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
    dial_code: string;

    @Column({
        type: String,
        nullable: false
    })
    phone: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @Column({
        type: 'boolean',
        default: false
    })
    marked_for_deletion: boolean;

}
