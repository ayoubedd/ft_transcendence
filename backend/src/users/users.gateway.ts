import { SocketWithUser, socketAuthMiddleWare } from '@/auth/ws.middleware';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server as SocketIoServer } from 'socket.io';
import { User, UserStatus } from './entities/user.entity';
import { UsersService } from './users.service';
import { FriendshipService } from '@/friendship/friendship.service';

@WebSocketGateway({
  namespace: 'ws/users',
  path: '/ws',
})
export class UsersGateway {
  @WebSocketServer()
  server: SocketIoServer;
  onlineUsers: Map<string, SocketWithUser[]> = new Map();

  private readonly logger = new Logger(UsersGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userSerivce: UsersService,
    private readonly friendshipService: FriendshipService,
  ) { }

  afterInit(server: SocketIoServer) {
    server.use(
      socketAuthMiddleWare(
        this.jwtService,
        this.configService,
        this.userSerivce,
      ) as any,
    );
  }

  async handleConnection(client: SocketWithUser) {
    if (!client.user) return;
    client.onAny((event, ...argv) => {
      this.logger.log(`event: ${event}, args: ${argv}`);
    });

    const { userId } = client.user;
    const connections = this.onlineUsers.get(userId);
    if (!connections) {
      this.onlineUsers.set(userId, [client]);
      this.broadcast(client.user.userId, UserStatus.ONLINE);
      return;
    }
    connections.push(client);
  }

  async handleDisconnect(client: SocketWithUser) {
    this.logger.log(`client: ${client.user?.username} is disconnected`);
    let con = this.onlineUsers.get(client.user.userId);
    if (!con)
      return;
    if (con.length === 1) {
      this.onlineUsers.delete(client.user.userId);
      this.broadcast(client.user.userId, UserStatus.OFFLINE);
      return;
    }
    con = con.filter(c => c.id === client.id);
    this.onlineUsers.set(client.user.userId, con);
  }

  async broadcast(userId: string, status: UserStatus) {
    const data = await this.userSerivce.setUserStatus(userId, status);
    if (!data) return;
    const friends = await this.friendshipService.selectAllFriends(userId, {
      limit: 1000,
      offset: 0,
    });
    for (const friend of friends) {
      this.sendToClient(friend.id, data);
    }
  }

  sendToClient(clientId: string, data: User) {
    const connections = this.onlineUsers.get(clientId);
    if (!connections) return;
    for (const conn of connections) {
      conn.emit('status', {
        type: 'status',
        data,
      });
    }
  }
}
