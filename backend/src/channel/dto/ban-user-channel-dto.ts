import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BanUserChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsUUID()
  bannedUserId: string;

  bannerId: string;
}
