import { IsDefined, IsUUID } from 'class-validator';

export class UserIdDto {
  @IsUUID()
  @IsDefined()
  id: string;
}
