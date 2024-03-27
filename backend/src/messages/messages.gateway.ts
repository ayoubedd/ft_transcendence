import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server as SocketIoServer } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocketWithUser, socketAuthMiddleWare } from '@/auth/ws.middleware';
import { UserChannel } from '@/user-channel/entities/user-channel.entity';
import { Message } from './entities/message.entity';
import { UsersService } from '@/users/users.service';

export class MessagePayload {
  senderId: string;
  data: string;
  channelId: string;
}

@WebSocketGateway({
  path: '/ws',
  namespace: '/ws/messages',
})
export class MessagesGateway {
  @WebSocketServer()
  server: SocketIoServer;

  connectedUsers: Map<string, SocketWithUser[]> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async handleConnection(client: SocketWithUser): Promise<void> {
    if (!client.user) return;
    const { userId } = client.user;
    const connections = this.connectedUsers.get(userId);
    if (!connections) {
      this.connectedUsers.set(userId, [client]);
      return;
    }
    connections.push(client);
  }

  async handleDisconnect(client: SocketWithUser) {
    if (client.user) this.connectedUsers.delete(client.user.userId);
  }

  broadcast(data: Message, to: UserChannel[], socketId: string) {
    for (const user of to) {
      this.sendToUser(data, user, socketId);
    }
  }

  async sendToUser(data: Message, to: UserChannel, socketId: string) {
    // NOTE: all values can be undefined or null except user.id
    const connections = this.connectedUsers.get(to.user.id);
    if (!connections) return;
    for (const connection of connections) {
      if (connection.id === socketId) continue;
      connection.emit('message', { type: 'message', data });
    }
  }
}
