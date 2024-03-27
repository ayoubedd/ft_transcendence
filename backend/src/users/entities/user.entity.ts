import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Length, IsEmail, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  INGAME = 'INGAME',
}

@Entity('users')
@Unique(['id', 'username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  @Length(3, 20)
  firstname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  @Length(3, 20)
  lastname: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  @ApiProperty()
  @Length(3, 20)
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @ApiProperty()
  @IsEmail()
  email: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  @Length(5, 50)
  bio?: string;

  @Column({ type: 'text', nullable: false })
  @ApiProperty()
  @Length(5, 2000)
  avatar: string;

  @Column({ type: 'boolean', nullable: false })
  @ApiProperty()
  @IsBoolean()
  pub: boolean;

  @Column({ type: 'bigint', default: 0 })
  @ApiProperty()
  @Min(0)
  wins: number;

  @Column({ type: 'bigint', default: 0 })
  @ApiProperty()
  @Min(0)
  losses: number;

  @Column({ type: 'bigint', default: 0 })
  @ApiProperty()
  @Min(0)
  level: number;

  @Column({ type: 'bigint', default: 0 })
  @ApiProperty()
  @Min(0)
  lp: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  @ApiProperty()
  @IsBoolean()
  '2FA': boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  twoFaSecret: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;
}
