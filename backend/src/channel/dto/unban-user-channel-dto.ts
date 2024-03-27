import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UnbanUserFromChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsUUID()
  bannedUserId: string;

  userId: string;
}
