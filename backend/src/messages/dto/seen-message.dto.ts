import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SeenMessageDto {
  @ApiProperty()
  @IsUUID()
  messageId: string;
}
