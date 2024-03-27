import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsUUID, Min } from 'class-validator';

export class UserFriendsDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  offset: number;

  @ApiProperty()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  limit: number;
}
