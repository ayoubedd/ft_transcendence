import { IsUUID } from 'class-validator';

export class FriendshipIdDto {
  @IsUUID()
  friendshipId: string;
}
