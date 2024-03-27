import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class RecentChannelDto {
  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(0)
  offset: number;
}
