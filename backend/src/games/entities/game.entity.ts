import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GameStatus {
  ONGOING = 'ONGOING',
  OVER = 'OVER',
  CORRUPTED = 'CORRUPTED',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'opponent_id' })
  opponent: User;

  @ApiProperty({
    enum: GameStatus,
    type: 'enum',
  })
  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.ONGOING })
  status: string;

  @ApiProperty({
    type: User,
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner?: User;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty()
  @Column({
    name: 'winner_score',
    type: 'int',
    default: 0,
  })
  winnerScore: number;

  @ApiProperty()
  @Column({
    name: 'looser_score',
    type: 'int',
    default: 0,
  })
  looserScore: number;
}
