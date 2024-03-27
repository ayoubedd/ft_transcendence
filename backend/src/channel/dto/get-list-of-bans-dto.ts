import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetListOfBansDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;
}
