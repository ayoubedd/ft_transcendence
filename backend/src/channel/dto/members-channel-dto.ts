import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MemberOfAChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  userId: string;
}
