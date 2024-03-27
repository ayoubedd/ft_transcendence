import { Length } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

import crypto from 'crypto';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ChannelType {
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  PUBLIC = 'PUBLIC',
}

@Entity('channel')
@Unique(['id', 'name'])
export class Channel {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true, unique: true })
  @Length(1, 30)
  name?: string;

  @ApiProperty({
    enum: ChannelType,
  })
  @Column({ type: 'enum', enum: ChannelType, default: ChannelType.PRIVATE })
  type: ChannelType;

  @Column({ type: 'text', nullable: true, select: false })
  @Length(7, 30)
  password?: string;

  @Column({ type: 'varchar', select: false })
  salt: string;

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  @Column({ nullable: false })
  isDM: boolean;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  async generateHash() {
    if (!this.salt) this.salt = crypto.randomBytes(32).toString('hex');
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) return;
    this.password = crypto
      .pbkdf2Sync(this.password, this.salt, 1000, 64, 'sha512')
      .toString('hex');
  }
}
