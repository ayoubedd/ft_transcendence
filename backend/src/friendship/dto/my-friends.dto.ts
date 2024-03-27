import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Min } from 'class-validator';

export class MyFriendsDto {
  @ApiProperty()
  @Min(0)
  @Transform(({ value }) => Number.parseInt(value))
  offset: number;

  @ApiProperty()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value))
  limit: number;
}
