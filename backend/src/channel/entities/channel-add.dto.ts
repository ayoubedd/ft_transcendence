import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class ChannelAddDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number.parseInt(value))
  offset: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value))
  limit: number;
}
