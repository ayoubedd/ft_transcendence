import type { Request } from 'express';
import { UserInJwtPayload } from './user-request';

export class RequestWithUser extends Request {
  user: UserInJwtPayload;
}
