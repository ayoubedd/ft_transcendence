import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Channel } from '@/channel/entities/channel.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum UserChannelStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BANNED = 'BANNED',
}

export enum UserChannelRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Entity('user_channel')
export class UserChannel {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    type: 'enum',
    enum: UserChannelStatus,
  })
  @Column({
    type: 'enum',
    enum: UserChannelStatus,
    default: UserChannelStatus.PENDING,
  })
  status: UserChannelStatus;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  muteExpireAt: Date;

  @ApiProperty({
    type: 'enum',
    enum: UserChannelRole,
  })
  @Column({
    type: 'enum',
    enum: UserChannelRole,
    default: UserChannelRole.USER,
  })
  role: UserChannelRole;
}
