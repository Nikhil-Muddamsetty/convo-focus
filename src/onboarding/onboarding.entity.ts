
import { IsNotEmpty, IsString } from 'class-validator';
import { CountryDialCodeEnum } from 'src/utils/countryCode';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Onboarding {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: CountryDialCodeEnum,
        nullable: false
    })
    dialCode: CountryDialCodeEnum;

    @Column()
    @IsNotEmpty()
    @IsString({
        message: "phone should be a string"
    })
    phone: string;

}
