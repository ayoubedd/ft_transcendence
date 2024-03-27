import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class GameInviteSendClientMsg {
  @IsUUID()
  inviteeId: string;
}

export class GameInviteSendServerMsg {
  @IsString()
  status: 'error' | 'success';

  @IsString()
  @IsOptional()
  message?: string;

  @IsUUID()
  @IsOptional()
  inviteId?: string;
}

export class GameInviteRevokeClientMsg {
  @IsUUID()
  inviteId: string;
}

export class GameInviteRevokeServerMsg {
  @IsString()
  status: 'error' | 'success';

  @IsString()
  @IsOptional()
  message?: string;
}

export class GameInviteRemoveClientMsg {
  @IsUUID()
  inviteId: string;
}

export class GameInviteRemoveServerMsg {
  @IsString()
  status: 'error' | 'success';

  @IsString()
  @IsOptional()
  message?: string;
}

export class GameInviteAcceptClientMsg {
  @IsUUID()
  inviteId: string;
}

export interface GameAcceptInviteMsg {
  inviteId?: string;
  hostId?: string;
  accept?: boolean;
}

export interface GameSendInviteMsg {
  inviteeId?: string;
  status?: 'error' | 'success';
  msg?: string;
  inviteId?: string;
}

export class GameInviteReq {
  @IsUUID()
  @ApiProperty()
  inviteeId: string;

  @IsNotEmpty()
  @ApiProperty()
  socketId: string;
}

export class GameInviteRes {
  @IsUUID()
  @ApiProperty()
  id: string;
}

export class GameInviteAcceptReq {
  @IsUUID()
  @ApiProperty()
  id: string;

  @IsNotEmpty()
  @ApiProperty()
  socketId: string;
}

export class GameInviteRejectReq {
  @IsUUID()
  @ApiProperty()
  id: string;
}
