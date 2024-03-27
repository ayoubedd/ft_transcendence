import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @Length(1, 500)
  message: string;

  @ApiProperty()
  @IsString()
  socketId: string;
}
