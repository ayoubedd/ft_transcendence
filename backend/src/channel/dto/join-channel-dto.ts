import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class JoinChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  password?: string;

  userId: string;
}
