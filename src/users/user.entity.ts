
import { CountryDialCodeEnum } from 'src/utils/countryCode';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
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
    dialCode: CountryDialCodeEnum;

    @Column({
        type: String,
        nullable: false
    })
    phone: string;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    password: string;

}
