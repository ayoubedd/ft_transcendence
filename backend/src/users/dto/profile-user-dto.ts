import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

export class ProfileUserDto {
  @ApiProperty()
  @IsDefined()
  @IsUUID()
  id: string;
}
