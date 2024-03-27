import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TurnOnTwoFaDto {
  @ApiProperty()
  @IsString()
  code: string;
}
