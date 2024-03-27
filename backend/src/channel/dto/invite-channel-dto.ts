import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class InviteChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsUUID()
  receiverId: string;

  senderId?: string;
}
