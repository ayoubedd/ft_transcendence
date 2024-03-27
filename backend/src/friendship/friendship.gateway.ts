import { SocketWithUser, socketAuthMiddleWare } from '@/auth/ws.middleware';
import { UsersService } from '@/users/users.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server as SocketIoServer } from 'socket.io';

export class UserInviteEventDto {
  inviteId: string;
  fromId: string;
}

export enum NotificationEventType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  ACCEPTED_REQUEST = 'ACCEPTED_REQUEST',
}

@WebSocketGateway({
  namespace: 'friendship',
  path: '/ws/friendship',
})
export class FriendshipGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: SocketIoServer;
  onlineUsers: Map<string, SocketWithUser[]> = new Map();

  private readonly logger = new Logger(FriendshipGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  afterInit(server: SocketIoServer) {
    server.use(
      socketAuthMiddleWare(
        this.jwtService,
        this.configService,
        this.userService,
      ) as any,
    );
  }

  handleConnection(client: SocketWithUser) {
    if (!client.user) return;

    client.onAny((event, ...argv) => {
      this.logger.log(`event: ${event}, args: ${argv}`);
    });

    const { userId } = client.user;
    const connections = this.onlineUsers.get(userId);
    if (!connections) {
      this.onlineUsers.set(userId, [client]);
      return;
    }
    connections.push(client);
  }

  handleDisconnect(client: SocketWithUser) {
    this.logger.log(`client: ${client.user?.username} is disconnected`);
    this.onlineUsers.delete(client.user.userId);
  }

  async sendFriendRequestEvent(fromId: string, to: string, inviteId: string) {
    const connections = this.onlineUsers.get(to);
    if (!connections) return;
    for (const conn of connections) {
      conn.emit('notification', {
        type: NotificationEventType.FRIEND_REQUEST,
        data: { fromId, inviteId },
      });
    }
  }
}
