import { UserInJwtPayload } from '@/utils/user-request';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { TwoFaPayload } from './auth.service';
import { UsersService } from '@/users/users.service';

export type SocketIoMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;
export class SocketWithUser extends Socket {
  user: UserInJwtPayload;
}

export function socketAuthMiddleWare(
  jwtService: JwtService,
  configService: ConfigService,
  userService: UsersService,
) {
  return async (client: SocketWithUser, next: (err?: Error) => void) => {
    try {
      let token = client.handshake.auth.token;
      if (!token && !client.handshake.headers['authorization']) {
        next(new Error('Unauthorized'));
      }
      if (!token) {
        token = client.handshake.headers.authorization?.split(' ')[1];
      }
      const {
        username,
        sub: userId,
        isTwoFaEnabled,
        isTwoFaAuthenticated,
      } = jwtService.verify<TwoFaPayload>(
        token,
        configService.getOrThrow('JWT_SECRET'),
      );
      try {
        await userService.findOneById(userId, userId);
      } catch (e) {
        next(new Error('Unauthorized'));
      }
      if (isTwoFaEnabled && !isTwoFaAuthenticated)
        next(new Error('Unauthorized'));
      client.user = { username, userId };
    } catch (e) {
      next(new Error('Unauthorized'));
    }
    next();
  };
}
