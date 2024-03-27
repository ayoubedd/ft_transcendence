import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class LeaveChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  newOwnerUsername?: string;
}
