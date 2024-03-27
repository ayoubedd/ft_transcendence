import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AcceptUserChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  userId: string;
}
