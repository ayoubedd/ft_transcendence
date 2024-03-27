import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class MessagesListDto {
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

  userId: string;
}
