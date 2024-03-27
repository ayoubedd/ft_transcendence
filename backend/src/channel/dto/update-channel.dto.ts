import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChannelDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;

  @IsOptional()
  @IsString()
  password?: string;

  userId: string;
}
