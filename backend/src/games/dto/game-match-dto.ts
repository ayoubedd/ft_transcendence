import { IsIn, IsString } from 'class-validator';

export class GameMatchUpdateClientMsg {
  @IsString()
  @IsIn(['up', 'down', 'rleft', 'rright'])
  op: 'up' | 'down' | 'rleft' | 'rright';
}

export class GameMatchClientUpdateMsg {
  @IsString()
  @IsIn(['ready', 'unready'])
  state: 'ready' | 'unready';
}

interface PlayerDto {
  goals: number;
  y: number;
  winner?: boolean;
  angle: number;
  id: string;
}

interface BallDto {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PongMatchDto {
  state: 'starting' | 'ongoing' | 'finished';
  matchId: string;
  rightPlayer: PlayerDto;
  leftPlayer: PlayerDto;
  ball: BallDto;
  startDate?: Date;
  myPosition?: 'left' | 'right';
  endCause?: 'win' | 'timeout' | 'opLeft';
}

export interface GamesCreateRes {
  status: 'created' | 'failed';
  msg?: string;
  matchId?: string;
}

export interface GameUpdateMatchClient {
  state: 'ready' | 'unready';
}
