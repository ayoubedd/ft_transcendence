import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetOneChannelDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
