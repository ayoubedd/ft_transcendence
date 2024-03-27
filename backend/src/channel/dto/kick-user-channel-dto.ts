import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class KickUserFromChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsUUID()
  kickedUserId: string;

  kickerId: string;
}
