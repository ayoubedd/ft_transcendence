import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length, Min, Max } from 'class-validator';

export class SearchInFriendsDto {
  @ApiProperty()
  @IsString()
  @Length(0, 20)
  name: string;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  @Max(100)
  offset: number;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  @Max(100)
  limit: number;
}
