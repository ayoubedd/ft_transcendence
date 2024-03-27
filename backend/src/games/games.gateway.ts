import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  WsException,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { GamesService } from './games.service';
import { Server } from 'socket.io';
import Matter from 'matter-js';
import { Mesures } from './constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocketWithUser, socketAuthMiddleWare } from '@/auth/ws.middleware';
import { ValidationPipe } from '@nestjs/common';
import { GameAddQueueServerMsg } from './dto/game-queue-dto';
import {
  GameMatchClientUpdateMsg,
  GameMatchUpdateClientMsg,
} from './dto/game-match-dto';
import {
  AddSpectatorMsg,
  GameSpectatorAddClientMsg,
  GameSpectatorRemoveClientMsg,
  RemoveSpectatorMsg,
} from './dto/game-spectating-dto';
import { UsersService } from '@/users/users.service';

@WebSocketGateway({
  path: '/ws',
  namespace: '/ws/pong',
})
export class GamesGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  timeOutHandler: NodeJS.Timeout | undefined;

  constructor(
    private readonly gamesService: GamesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  afterInit() {
    this.gamesService.server = this.server;
    this.server.use(
      socketAuthMiddleWare(
        this.jwtService,
        this.configService,
        this.userService,
      ) as any,
    );
  }

  handleConnection(client: SocketWithUser) {
    // Inserting client to socket to sockets pool
    this.gamesService.addClientToSocketsPool(client);
  }

  handleDisconnect(client: SocketWithUser) {
    // Cleaning up resources
    this.gamesService.playerCleanDisconnect(client);
  }

  @SubscribeMessage('add:queue')
  addPlayerToQueue(
    @ConnectedSocket() client: SocketWithUser,
  ): WsResponse<GameAddQueueServerMsg> {
    // Clearing if there is a ongoing timeout
    if (this.timeOutHandler) {
      clearTimeout(this.timeOutHandler);
      this.timeOutHandler = undefined;
    }

    if (this.gamesService.isPlayerInQueue(client.user.userId))
      return {
        event: 'add:queue',
        data: {
          status: 'error',
          message: 'You already searching in another tab',
        },
      };

    if (this.gamesService.isPlayerInMatch(client.user.userId))
      return {
        event: 'add:queue',
        data: {
          status: 'error',
          message: 'You have a ongoing Match in another tab',
        },
      };

    // Add player to queue
    this.gamesService.addPlayerToQueue(client, client.user.userId);

    // if enough players in queue start a Match
    if (this.gamesService.queue.length > 1)
      this.gamesService.createMatchFromQueue();
    else {
      // Timeout handling
      this.timeOutHandler = setTimeout(() => {
        this.gamesService.queue.forEach((player) => {
          player.socket.emit('add:queue', {
            status: 'timeout',
            message: 'Could not find you a opponent',
          });
        });

        this.gamesService.queue = [];
      }, 1000 * 60); // One minute, then emit timeout
    }

    return { event: 'add:queue', data: { status: 'success' } };
  }

  @SubscribeMessage('remove:queue')
  removePlayerFromQueue(@ConnectedSocket() client: SocketWithUser) {
    this.gamesService.removePlayerFromQueue(client.user.userId);
  }

  @SubscribeMessage('update:match')
  async updateMatch(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody(ValidationPipe) data: GameMatchUpdateClientMsg,
  ) {
    const match = this.gamesService.findMatchByClient(client);
    if (!match) throw new WsException('You are not in a match');

    const { me, paddle } = this.gamesService.extractMatchComponents(
      client.user.userId,
      match,
    );

    // Updating paddle position
    switch (data.op) {
      case 'down': {
        if (
          me.y + Mesures.STEP_SIZE >
          Mesures.CANVAS_HEIGHT - Mesures.PADDLE_HEIGHT / 2
        )
          break;
        me.y += Mesures.STEP_SIZE;
        Matter.Body.setPosition(paddle, { x: paddle.position.x, y: me.y });
        break;
      }
      case 'up': {
        if (me.y - Mesures.STEP_SIZE < Mesures.PADDLE_HEIGHT / 2) break;
        me.y -= Mesures.STEP_SIZE;
        Matter.Body.setPosition(paddle, { x: paddle.position.x, y: me.y });
        break;
      }
      case 'rleft': {
        const angle = this.gamesService.normalizeAngle(
          paddle.angle - this.gamesService.deg_to_rad(5),
        );
        if (!this.gamesService.isAngleAllowed(angle)) break;

        Matter.Body.setAngle(paddle, angle);
        me.angle = paddle.angle;
        break;
      }
      case 'rright': {
        const angle = this.gamesService.normalizeAngle(
          paddle.angle + this.gamesService.deg_to_rad(10),
        );
        if (!this.gamesService.isAngleAllowed(angle)) break;

        Matter.Body.setAngle(paddle, angle);
        me.angle = paddle.angle;
        break;
      }
    }

    this.gamesService.emitMatchState(match);
  }

  @SubscribeMessage('remove:match')
  playerLeaveMatch(@ConnectedSocket() client: SocketWithUser) {
    const match = this.gamesService.findMatchByClient(client);
    if (!match) return;

    if (match.state != 'finished') {
      this.gamesService.endMatch(match, 'opLeft');
      const { me, opponent } = this.gamesService.extractMatchComponents(
        client.user.userId,
        match,
      );

      // Marking Opponent as the winner of the game
      this.gamesService.updateGameDraw(match.id, opponent.score, me.score);
    }

    this.gamesService.emitMatchState(match);
  }

  @SubscribeMessage('update:player')
  async updatePlayerState(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody(ValidationPipe) data: GameMatchClientUpdateMsg,
  ) {
    const match = this.gamesService.findMatchByClient(client);
    if (!match) throw new WsException('You are not in a match');

    const { me, opponent } = this.gamesService.extractMatchComponents(
      client.user.userId,
      match,
    );

    switch (data.state) {
      case 'ready': {
        me.ready = true;
        break;
      }
      case 'unready': {
        me.ready = false;
        break;
      }
    }

    if (match.state != 'starting' || !me.ready || !opponent.ready) return;

    {
      this.gamesService.matches.delete(match.id);

      const matchData = await this.gamesService.createGameBetweenTwoPlayers(
        match.leftPlayer,
        match.rightPlayer,
      );

      match.id = matchData.raw[0].id;

      this.gamesService.matches.set(match.id, match);
    }

    // Calculating match start date/time (now + n seconds)
    const startDate = new Date();
    startDate.setSeconds(startDate.getSeconds() + 5);

    // Emittinng initial game state
    this.gamesService.emitMatchState(match, startDate);

    // Both players are ready, Start the match
    match.state = 'ongoing';

    // Clear Match Starting time-out
    clearTimeout(match.timeOutHandler);

    // Start Match at Match start date
    match.timeOutHandler = setTimeout(() => {
      match.simulation?.setLastTime(new Date());
      match.loopHandler = setInterval(
        this.gamesService.simulationLoop.bind(this.gamesService),
        1000 / 60,
        match,
      );
    }, startDate.valueOf() - new Date().valueOf());
  }

  @SubscribeMessage('add:spectator')
  addSpectatorToMatch(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody(ValidationPipe) data: GameSpectatorAddClientMsg,
  ): WsResponse<AddSpectatorMsg> {
    if (!data.matchId)
      return {
        event: 'add:spectator',
        data: { status: 'failure', msg: 'Match id not provided' },
      };

    const match = this.gamesService.matches.get(data.matchId);

    if (!match)
      return {
        event: 'add:spectator',
        data: { status: 'failure', msg: 'Match not found' },
      };

    client.join(match.id + '.specs');

    return { event: 'add:spectator', data: { status: 'success' } };
  }

  @SubscribeMessage('remove:spectator')
  delSpectatorFromMatch(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody(ValidationPipe) data: GameSpectatorRemoveClientMsg,
  ): WsResponse<RemoveSpectatorMsg> {
    if (!data.matchId)
      return {
        event: 'remove:spectator',
        data: { status: 'failure', msg: 'Match id not provided' },
      };

    const match = this.gamesService.matches.get(data.matchId);

    if (!match)
      return {
        event: 'remove:spectator',
        data: { status: 'failure', msg: 'Match not found' },
      };

    client.leave(match.id + '.specs');

    return { event: 'remove:spectator', data: { status: 'success' } };
  }
}
