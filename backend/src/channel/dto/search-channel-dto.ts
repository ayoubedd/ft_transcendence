import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsString, Length, Min } from 'class-validator';

export class SearchChannelDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  offset: number;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  limit: number;
}
