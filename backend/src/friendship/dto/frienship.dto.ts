import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

export class FriendshipInviteDto {
  @ApiProperty({
    description: 'user id to be processed',
    example: '0a38b43b-5776-443c-824f-a2bffe5fab86',
  })
  @IsDefined()
  @IsUUID()
  him: string; // user id to be processed
}
