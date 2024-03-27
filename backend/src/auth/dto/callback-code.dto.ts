import { IsDefined, IsNotEmpty } from 'class-validator';

export class CallbackCode {
  @IsDefined()
  @IsNotEmpty()
  code: string;
}
