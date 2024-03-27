import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, Length, Min } from 'class-validator';

export class SearchUserQueryDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @Length(0, 20)
  username: string;

  @ApiProperty()
  @IsDefined()
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  limit: number;

  @ApiProperty()
  @IsDefined()
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  offset: number;
}
