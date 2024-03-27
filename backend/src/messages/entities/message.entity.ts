import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Max } from 'class-validator';
import { User } from '@/users/entities/user.entity';
import { Channel } from '@/channel/entities/channel.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageStatus {
  UNREAD = 'UNREAD',
  SEEN = 'SEEN',
}

@Entity('messages')
export class Message {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  @Max(500)
  value: string;

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: Channel,
  })
  @ManyToOne(() => Channel)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ApiProperty({
    enum: MessageStatus,
  })
  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.UNREAD,
  })
  status: MessageStatus;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
