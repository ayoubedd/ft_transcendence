import { IsUUID } from 'class-validator';

export class GetGameDto {
  @IsUUID()
  gameId: string;
}
