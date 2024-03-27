import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FriendshipInviteUsernameDto {
  @ApiProperty()
  @IsString()
  username: string;
}
