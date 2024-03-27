import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REFUSED = 'REFUSED',
  BLOCKED = 'BLOCKED',
}

@Entity('friendships')
export class Friendship {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({ name: 'sender' })
  sender: User;

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({ name: 'receiver' })
  receiver: User;

  @ApiProperty({
    enum: FriendshipStatus,
  })
  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;
}
