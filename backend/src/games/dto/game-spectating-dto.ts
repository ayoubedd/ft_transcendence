import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GameSpectatorAddClientMsg {
  @IsString()
  @IsUUID()
  matchId: string;
}

export class GameSpectatorRemoveClientMsg {
  @IsString()
  @IsUUID()
  matchId: string;
}

export interface RemoveSpectatorMsg {
  matchId?: string;
  status?: 'success' | 'failure';
  msg?: string;
}

export interface AddSpectatorMsg {
  matchId?: string;
  status?: 'success' | 'failure';
  msg?: string;
}

export class OngoingMatch {
  @ApiProperty()
  matchId: string;

  @ApiProperty()
  leftPlayer: User;

  @ApiProperty()
  rightPlayer: User;
}

export class QueryUserMatchIdRes {
  @IsUUID()
  @ApiProperty()
  matchId: string;
}
