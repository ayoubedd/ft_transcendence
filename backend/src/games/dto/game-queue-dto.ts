import { IsString, IsOptional } from 'class-validator';

export class GameAddQueueServerMsg {
  @IsString()
  status: 'error' | 'success';

  @IsOptional()
  message?: string;
}

export interface EnQueueMsg {
  status: 'found' | 'timeout' | 'unset';
}
