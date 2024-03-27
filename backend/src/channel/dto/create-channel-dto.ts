import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({
    enum: ChannelType,
  })
  @IsDefined()
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  password?: string;
}
