import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PromotUserChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsUUID()
  promotedUserId: string;

  userId: string;
}
