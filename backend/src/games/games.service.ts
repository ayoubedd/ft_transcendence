import {
  GameInvite,
  type Match,
  type Player,
  type PlayerPosition,
  type PongSimulation,
} from './types';
import { Mesures } from './constants';
import Matter, { Engine, Bodies } from 'matter-js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { FriendshipWithoutJoins } from '@/friendship/friendship.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from './entities/game.entity';
import { Repository } from 'typeorm';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '@/users/users.service';
import { SocketWithUser } from '@/auth/ws.middleware';
import { GetUserGamesDto } from './dto/get-user-games.dto';
import { PongMatchDto } from './dto/game-match-dto';
import { User, UserStatus } from '@/users/entities/user.entity';
import { UsersGateway } from '@/users/users.gateway';
import { UsersRecentlyPlatedWithDto } from './dto/users-recently-played-with.dto';
import { Friendship } from '@/friendship/entities/friendship.entity';
import { ApiProperty } from '@nestjs/swagger';

export class GetListOfUsersRecentlyPlayedWithResponse extends User {
  @ApiProperty()
  friendship: FriendshipWithoutJoins;
}

async function sleep(time: number) {
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

@Injectable()
export class GamesService {
  matches: Map<string, Match> = new Map();
  sockets: Map<string, SocketWithUser[]> = new Map();
  invites: Map<string, GameInvite> = new Map();
  queue: Player[] = [];
  server: Server;

  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
    private readonly userService: UsersService,
    private readonly userGateway: UsersGateway,
  ) {}

  constructPlayer({
    id,
    pos = 'unset',
    socket,
    ready = false,
  }: {
    id: string;
    pos?: PlayerPosition;
    socket: SocketWithUser;
    ready?: boolean;
  }): Player {
    return {
      ready,
      inQueueTimestamp: new Date(),
      id,
      y: Mesures.CANVAS_HEIGHT / 2,
      score: 0,
      pos,
      socket,
      winner: false,
      angle: 0,
    };
  }

  isPlayerInQueue(id: string) {
    if (this.queue.find((obj) => (obj.id == id ? obj : undefined))) return true;
    return false;
  }

  isPlayerInMatch(id: string) {
    let found = false;

    this.matches.forEach((match) => {
      if (match.leftPlayer.id == id || match.rightPlayer.id == id) found = true;
    });

    return found;
  }

  createGameInvite(host: SocketWithUser, inviteeId: string): GameInvite {
    const invite: GameInvite = {
      id: crypto.randomUUID(),
      inviteeId,
      host,
    };

    invite.timeOutHandler = setTimeout(() => {
      this.invalidateInvite(invite);
    }, 1000 * 20); // Invalidating this invite after 20s

    this.invites.set(invite.id, invite);

    return invite;
  }

  invalidateInvite(invite: GameInvite) {
    this.invites.delete(invite.id);
  }

  addClientToSocketsPool(client: SocketWithUser) {
    const user = client.user;

    if (!user) return;

    const sockets = this.sockets.get(user.userId);

    if (sockets && sockets.filter((el) => el == client).length == 0)
      sockets.push(client);
    else this.sockets.set(user.userId, [client]);
  }

  getClientSocket(userId: string, socketId: string) {
    const sockets = this.sockets.get(userId);
    return sockets?.find((sock) => sock.id === socketId);
  }

  addPlayerToQueue(client: SocketWithUser, id: string) {
    const player = this.constructPlayer({ id, socket: client });
    this.queue.push(player);
  }

  removePlayerFromQueue(id: string) {
    this.queue = this.queue.filter((client) => client.id != id);
  }

  generateRandomVelocity(): { x: number; y: number } {
    return {
      x: (Math.random() > 0.5 ? 1 : -1) * 10,
      y: 0,
    };
  }

  endMatch(match: Match, endCause: 'timeout' | 'win' | 'opLeft') {
    this.matches.delete(match.id);

    match.state = 'finished';
    match.endCause = endCause;

    // Setting Users status back to online
    this.userGateway.broadcast(match.leftPlayer.id, UserStatus.ONLINE);
    this.userGateway.broadcast(match.rightPlayer.id, UserStatus.ONLINE);

    clearInterval(match.loopHandler);
    clearInterval(match.timeOutHandler);
  }

  findMatchByClient(client: SocketWithUser): Match | undefined {
    let result: Match | undefined = undefined;

    this.matches.forEach((match) => {
      if (
        match.leftPlayer.socket == client ||
        match.rightPlayer.socket == client
      )
        result = match;
    });

    return result;
  }

  findMatchByUserId(userId: string): Match | undefined {
    let result: Match | undefined = undefined;

    this.matches.forEach((match) => {
      if (match.leftPlayer.id == userId || match.rightPlayer.id == userId)
        result = match;
    });

    return result;
  }
  async createMatch(leftPlayer: Player, rightPlayer: Player): Promise<Match> {
    const ballVelocity = this.generateRandomVelocity();

    // Updating users statues to be INGAME
    this.userGateway.broadcast(leftPlayer.id, UserStatus.INGAME);
    this.userGateway.broadcast(rightPlayer.id, UserStatus.INGAME);

    const match: Match = {
      id: crypto.randomUUID(),
      state: 'starting',
      leftPlayer,
      rightPlayer,
      ball: {
        x: Mesures.CANVAS_WIDTH / 2,
        y: Mesures.CANVAS_HEIGHT / 2,
        vx: ballVelocity.x,
        vy: ballVelocity.y,
      },
      targetGoals: 5,
      spectators: [],
    };

    match.simulation = this.createSimulation(match);

    match.timeOutHandler = setTimeout(() => {
      this.endMatch(match, 'timeout');
      this.emitMatchState(match);
    }, 1000 * 20);

    this.matches.set(match.id, match);

    return match;
  }

  async createMatchFromInvite(invite: GameInvite) {
    if (!invite.invitee)
      throw new WsException('One of the player went offline');

    const leftPlayer = this.constructPlayer({
      id: invite.host.user.userId,
      socket: invite.host,
    });
    const rightPlayer = this.constructPlayer({
      id: invite.inviteeId,
      socket: invite.invitee,
    });

    return this.createMatch(leftPlayer, rightPlayer);
  }

  async createGameBetweenTwoPlayers(playerUno: Player, playerDos: Player) {
    if (!playerUno.socket.user || !playerDos.socket.user)
      throw new WsException('could not create the game');

    const playerUnoId = playerUno.socket.user.userId;
    const playerDosId = playerDos.socket.user.userId;

    try {
      return await this.gameRepository
        .createQueryBuilder()
        .insert()
        .values({
          user: { id: playerUnoId },
          opponent: { id: playerDosId },
        })
        .returning('id')
        .execute();
    } catch (e) {
      throw new WsException('could not create the game');
    }
  }

  createSimulation(match: Match): PongSimulation {
    const ballProps = match.ball;
    const leftPlayer = match.leftPlayer;
    const rightPlayer = match.rightPlayer;

    const ball = Bodies.circle(ballProps.x, ballProps.y, Mesures.BALL_RADIUS, {
      inertia: 0,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 1.05,
      label: 'ball',
    });

    Matter.Body.setVelocity(ball, {
      x: match.ball.vx,
      y: match.ball.vy,
    });

    const leftPaddle = Bodies.rectangle(
      Mesures.PADDLE_WIDTH + Mesures.PADDLE_WIDTH / 2,
      leftPlayer.y,
      Mesures.PADDLE_WIDTH,
      Mesures.PADDLE_HEIGHT,
      { isStatic: true },
    );

    const rightPaddle = Bodies.rectangle(
      Mesures.CANVAS_WIDTH - Mesures.PADDLE_WIDTH - Mesures.PADDLE_WIDTH / 2,
      rightPlayer.y,
      Mesures.PADDLE_WIDTH,
      Mesures.PADDLE_HEIGHT,
      { isStatic: true },
    );

    const top = Bodies.rectangle(
      Mesures.CANVAS_WIDTH / 2,
      -Mesures.BOUNDS_THINKNESS / 2,
      Mesures.CANVAS_WIDTH,
      Mesures.BOUNDS_THINKNESS,
      {
        isStatic: true,
      },
    );

    const bottom = Bodies.rectangle(
      Mesures.CANVAS_WIDTH / 2,
      Mesures.CANVAS_HEIGHT + Mesures.BOUNDS_THINKNESS / 2,
      Mesures.CANVAS_WIDTH,
      Mesures.BOUNDS_THINKNESS,
      {
        isStatic: true,
      },
    );

    const left = Bodies.rectangle(
      -Mesures.BOUNDS_THINKNESS / 2,
      Mesures.CANVAS_HEIGHT / 2,
      Mesures.BOUNDS_THINKNESS,
      Mesures.CANVAS_HEIGHT,
      {
        isStatic: true,
      },
    );

    const right = Bodies.rectangle(
      Mesures.CANVAS_WIDTH + Mesures.BOUNDS_THINKNESS / 2,
      Mesures.CANVAS_HEIGHT / 2,
      Mesures.BOUNDS_THINKNESS,
      Mesures.CANVAS_HEIGHT,
      {
        isStatic: true,
      },
    );

    const engine = Engine.create({
      enableSleeping: false,
      velocityIterations: 1000,
      positionIterations: 1000,
      gravity: {
        x: 0,
        y: 0,
      },
    });

    Matter.Composite.add(engine.world, [
      ball,
      top,
      bottom,
      left,
      right,
      leftPaddle,
      rightPaddle,
    ]);

    Matter.Collision.create(ball, left);
    Matter.Collision.create(ball, right);

    let lastTime = new Date();

    function tick() {
      const now = new Date();

      Engine.update(engine, (now as any) - (lastTime as any));
      match.ball.y = ball.position.y;
      match.ball.x = ball.position.x;
      lastTime = now;
    }

    function setLastTime(date: Date) {
      lastTime = date;
    }

    return {
      engine,
      leftPaddle,
      rightPaddle,
      ball,
      leftWall: left,
      rightWall: right,
      tick,
      setLastTime,
    };
  }

  constructMatchStateDto(match: Match, startDate?: Date): PongMatchDto {
    return {
      endCause: match.endCause,
      state: match.state,
      matchId: match.id,
      startDate,
      ball: {
        x: match.ball.x,
        y: match.ball.y,
        vx: match.ball.vx,
        vy: match.ball.vy,
      },
      leftPlayer: {
        id: match.leftPlayer.id,
        y: match.leftPlayer.y,
        goals: match.leftPlayer.score,
        winner: match.leftPlayer.winner,
        angle: match.leftPlayer.angle,
      },
      rightPlayer: {
        id: match.rightPlayer.id,
        y: match.rightPlayer.y,
        goals: match.rightPlayer.score,
        winner: match.rightPlayer.winner,
        angle: match.rightPlayer.angle,
      },
    };
  }

  emitMatchState(match: Match, startDate?: Date) {
    const matchState = this.constructMatchStateDto(match, startDate);

    matchState.myPosition = 'left';
    match.leftPlayer.socket.emit('update:match', matchState);

    matchState.myPosition = 'right';
    match.rightPlayer.socket.emit('update:match', matchState);

    matchState.myPosition = undefined;

    // Emitting State to spectators
    this.server.to(match.id + '.specs').emit('update:match', matchState);
  }

  async simulationLoop(match: Match) {
    const simulation = match.simulation;
    const leftPlayer = match.leftPlayer;
    const rightPlayer = match.rightPlayer;

    let colided = false;
    if (!simulation) return;

    const ball = simulation.ball;
    // const leftPaddle = simulation.leftPaddle;
    // const rightPaddle = simulation.rightPaddle;

    if (
      ball.position.x < 0 ||
      ball.position.x >= Mesures.CANVAS_WIDTH ||
      ball.position.y >= Mesures.CANVAS_HEIGHT ||
      ball.position.y < 0
    ) {
      // Stop simulation
      clearInterval(match.loopHandler);

      // Reset bodies states
      this.resetBodiesPositions(match);

      colided = true;
    } else if (
      Matter.Collision.collides(ball, simulation.leftWall)?.collided ||
      Matter.Collision.collides(ball, simulation.rightWall)?.collided
    ) {
      // Stop simulation
      clearInterval(match.loopHandler);
      let ballCollidedInLeft = false;

      // Detecting in which side ball colided
      if (Matter.Collision.collides(ball, simulation.leftWall)?.collided)
        ballCollidedInLeft = true;
      else ballCollidedInLeft = false;

      // Increasing Player in that side score
      if (ballCollidedInLeft) rightPlayer.score++;
      else leftPlayer.score++;

      // Checking if one of the players reached
      // the target goals of the Match
      if (
        leftPlayer.score == match.targetGoals ||
        rightPlayer.score == match.targetGoals
      ) {
        let winner: Player;
        let loser: Player;

        if (leftPlayer.score == match.targetGoals) {
          leftPlayer.winner = true;
          winner = leftPlayer;
          loser = rightPlayer;
        } else {
          rightPlayer.winner = true;
          winner = rightPlayer;
          loser = leftPlayer;
        }

        // Ending this match
        this.endMatch(match, 'win');

        // Setting winner in db
        this.updateGameWithWinUser(
          match.id,
          winner.socket.user.userId,
          loser.socket.user.userId,
          winner.score,
          loser.score,
        );
      }

      // Reset bodies states
      this.resetBodiesPositions(match);

      colided = true;
    }

    if (!colided) simulation.tick();

    this.emitMatchState(match);

    if (colided && match.state != 'finished') {
      await sleep(1000);

      simulation.setLastTime(new Date());
      this.simulationLoop(match);

      match.loopHandler = setInterval(
        this.simulationLoop.bind(this),
        1000 / 60,
        match,
      );
    }
  }

  resetBodiesPositions(match: Match) {
    const simulation = match.simulation;
    const leftPlayer = match.leftPlayer;
    const rightPlayer = match.rightPlayer;

    if (!simulation) return;

    const ball = simulation.ball;
    const leftPaddle = simulation.leftPaddle;
    const rightPaddle = simulation.rightPaddle;
    Matter.Body.setPosition(ball, {
      x: Mesures.CANVAS_WIDTH / 2,
      y: Mesures.CANVAS_HEIGHT / 2,
    });
    Matter.Body.setVelocity(ball, this.generateRandomVelocity());
    match.ball.x = ball.position.x;
    match.ball.y = ball.position.y;

    Matter.Body.setAngle(leftPaddle, 0);
    Matter.Body.setAngle(rightPaddle, 0);
    leftPlayer.angle = 0;
    rightPlayer.angle = 0;

    Matter.Body.setPosition(leftPaddle, {
      x: leftPaddle.position.x,
      y: Mesures.CANVAS_HEIGHT / 2,
    });
    Matter.Body.setPosition(rightPaddle, {
      x: rightPaddle.position.x,
      y: Mesures.CANVAS_HEIGHT / 2,
    });
    leftPlayer.y = Mesures.CANVAS_HEIGHT / 2;
    rightPlayer.y = Mesures.CANVAS_HEIGHT / 2;
  }

  async updateGameWithWinUser(
    gameId: string,
    winnerId: string,
    looserId: string,
    winnerScore: number,
    looserScore: number,
  ) {
    await this.userService.updateUsersWithWinAndLose(winnerId, looserId);
    try {
      return await this.gameRepository
        .createQueryBuilder()
        .update()
        .set({
          winner: { id: winnerId },
          status: GameStatus.OVER,
          winnerScore,
          looserScore,
        })
        .where('id = :gameId', { gameId })
        .execute();
    } catch (e) {
      throw new WsException('could not update game winner');
    }
  }

  async updateGameDraw(
    gameId: string,
    winnerScore: number,
    looserScore: number,
  ) {
    try {
      return await this.gameRepository
        .createQueryBuilder()
        .update()
        .set({
          status: GameStatus.OVER,
          winnerScore,
          looserScore,
        })
        .where('id = :gameId', { gameId })
        .execute();
    } catch (e) {
      throw new WsException('could not update game winner');
    }
  }

  async getListOfGamesForUser({ userId, limit, offset }: GetUserGamesDto) {
    try {
      return await this.gameRepository.find({
        select: { winner: { id: true } },
        where: [{ user: { id: userId } }, { opponent: { id: userId } }],
        relations: {
          user: true,
          opponent: true,
          winner: true,
        },
        take: limit,
        skip: offset,
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async getGameById(gameId: string) {
    let game: Game | null;
    try {
      game = await this.gameRepository.findOneBy({
        id: gameId,
      });
    } catch (e) {
      throw new BadRequestException();
    }

    if (!game) throw new NotFoundException();
    return game;
  }

  extractMatchComponents(myId: string, match: Match) {
    const me =
      match.leftPlayer.id == myId ? match.leftPlayer : match.rightPlayer;
    const opponent =
      match.leftPlayer.id == myId ? match.rightPlayer : match.leftPlayer;
    const paddle =
      match.leftPlayer.id == myId
        ? match.simulation?.leftPaddle
        : match.simulation?.rightPaddle;

    if (!paddle)
      // how a match started without a simulation
      throw new WsException('Invalid match state');

    return {
      me,
      opponent,
      paddle,
    };
  }

  isUserAlreadyInvitedByUser(hostId: string, invitee: string): boolean {
    let invited = false;

    this.invites.forEach((invite) => {
      if (invite.host.user.userId === hostId && invite.inviteeId === invitee)
        invited = true;
    });

    return invited;
  }

  playerCleanDisconnect(client: SocketWithUser) {
    // Current Player was in the middle of a match before disconnecting
    if (this.isPlayerInMatch(client.user.userId)) {
      const match = this.findMatchByClient(client);

      console.log('match:', match);

      if (match && match.state != 'finished') {
        const { me, opponent } = this.extractMatchComponents(
          client.user.userId,
          match,
        );

        this.endMatch(match, 'opLeft');
        this.emitMatchState(match);

        // Marking Opponent as the winner of the game
        this.updateGameDraw(match.id, opponent.score, me.score);
      }
    }

    if (this.isPlayerInQueue(client.user.userId))
      this.removePlayerFromQueue(client.user.userId);

    // Dropping this disconnected sockets from sockets pool of the user
    const activeSockets = this.sockets
      .get(client.user.userId)
      ?.filter((sock) => sock != client);
    if (activeSockets?.length)
      this.sockets.set(client.user.userId, activeSockets);
    else this.sockets.delete(client.user.userId);

    // Invalidating / Dropping any ongoin invites of the current user
    // if the user has no currently active WSs
    if (activeSockets?.length == 0) this.popUserInvites(client.user.userId);
  }

  popUserInvites(userid: string) {
    const invites = new Map<string, GameInvite>();
    const userInvites: GameInvite[] = [];

    this.invites.forEach((invite, key) => {
      if (invite.host.user.userId == userid || invite.inviteeId == userid)
        userInvites.push(invite);
      else invites.set(key, invite);
    });

    this.invites = invites;

    return userInvites;
  }

  async createMatchFromQueue() {
    const leftPlayer = this.queue.pop();
    const rightPlayer = this.queue.pop();

    if (!leftPlayer || !rightPlayer)
      throw new WsException('Failure creating match');

    const match = await this.createMatch(leftPlayer, rightPlayer);

    if (!match) throw new WsException('Failure creating match');

    match.leftPlayer.socket.join(match.id);
    match.rightPlayer.socket.join(match.id);

    this.server
      .to(match.id)
      .emit('add:queue', { status: 'found', matchId: match.id });
  }

  rad_to_deg(rad: number) {
    return rad * (180 / Math.PI);
  }

  deg_to_rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  normalizeAngle(angle: number) {
    // Normalize angle to be within the range [0, 2π)
    angle = angle % (2 * Math.PI);

    // Ensure the result is positive
    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    return angle;
  }

  isAngleAllowed(rad: number): boolean {
    const angle = this.rad_to_deg(rad);

    const RANGE = 15;

    if (
      (angle <= RANGE && angle >= 0) ||
      (angle <= 360 && angle >= 360 - RANGE)
    )
      return true;

    return false;
  }

  async getListOfUsersRecentlyPlayedWith(
    userId: string,
    { limit, offset }: UsersRecentlyPlatedWithDto,
  ): Promise<GetListOfUsersRecentlyPlayedWithResponse[]> {
    const recentGames = await this.gameRepository
      .createQueryBuilder('g')
      .leftJoinAndMapOne('g.user', User, 'user', 'user.id = g.user_id')
      .leftJoinAndMapOne('g.opponent', User, 'u', 'u.id = g.opponent_id')
      .leftJoinAndMapOne(
        'g.friendship',
        Friendship,
        'f',
        'f.sender = g.user_id AND f.receiver = g.opponent_id OR f.receiver = g.user_id AND f.sender = g.opponent_id',
      )
      .where('g.status = :over', { over: GameStatus.OVER })
      .andWhere('g.user_id = :userId1', { userId1: userId })
      .orWhere('g.opponent_id = :userId2', { userId2: userId })
      .orderBy('g.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
    return recentGames.map((game: any) => {
      const user = game.user.id === userId ? game.opponent : game.user;
      return { ...user, friendship: game.friendship };
    });
  }
}
