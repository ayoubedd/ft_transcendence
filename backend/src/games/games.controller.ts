import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { OngoingMatch } from './dto/game-spectating-dto';
import {
  GamesService,
  GetListOfUsersRecentlyPlayedWithResponse,
} from './games.service';
import { GetUserGamesDto } from './dto/get-user-games.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Game } from './entities/game.entity';
import { GetGameDto } from './dto/get-game.dto';
import {
  GameInviteAcceptReq,
  GameInviteRejectReq,
  GameInviteReq,
  GameInviteRes,
} from './dto/game-invites-dto';
import { RequestWithUser } from '@/utils/request-with-logged-user';
import { UsersService } from '@/users/users.service';
import { UsersRecentlyPlatedWithDto } from './dto/users-recently-played-with.dto';
import { QueryUserMatchIdRes } from './dto/game-spectating-dto';
import { TwoFaGuard } from '@/auth/2fa.guard';

@Controller('games')
@UseGuards(TwoFaGuard)
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly userService: UsersService,
  ) {}

  @ApiOkResponse({
    type: Game,
    isArray: true,
  })
  @ApiBadRequestResponse()
  @Get()
  games(@Query(ValidationPipe) getUserGamesDto: GetUserGamesDto) {
    return this.gamesService.getListOfGamesForUser(getUserGamesDto);
  }

  @ApiOkResponse()
  @ApiNotFoundResponse()
  game(@Query(ValidationPipe) { gameId }: GetGameDto) {
    return this.gamesService.getGameById(gameId);
  }

  @ApiOkResponse({
    type: GameInviteRes,
    description: 'Invite successfuly created',
  })
  @ApiNotFoundResponse({
    description: 'Invitee not found or offline',
  })
  @ApiUnauthorizedResponse({
    description: 'Failed to create Invite due to logical reason',
  })
  @Post('invite')
  async createInvite(
    @Req() { user: { userId } }: RequestWithUser,
    @Body() { inviteeId, socketId }: GameInviteReq,
  ): Promise<GameInviteRes> {
    const client = this.gamesService.getClientSocket(userId, socketId);
    if (!client)
      throw new BadRequestException(
        'You have currently no active connection to server',
      );

    if (inviteeId == userId)
      throw new ForbiddenException('Cannot invite your self');

    const sockets = this.gamesService.sockets.get(inviteeId);
    if (!sockets) throw new NotFoundException('User not found or offline');

    if (
      this.gamesService.isPlayerInQueue(inviteeId) ||
      this.gamesService.isPlayerInMatch(inviteeId)
    )
      throw new BadRequestException('Invitee is in Match or Queueing');

    if (this.gamesService.isUserAlreadyInvitedByUser(userId, inviteeId))
      throw new BadRequestException('Already issued a invite for this user');

    if (this.gamesService.isUserAlreadyInvitedByUser(inviteeId, userId))
      throw new BadRequestException('This player already invited you');

    const invite = this.gamesService.createGameInvite(client, inviteeId);

    const hostInfo = await this.userService.selectOneStatusById(userId);

    // Emitting invite to all active tabs
    sockets.forEach((sock) => {
      sock.emit('pong:invites', { id: invite.id, host: hostInfo }); // should populate host
    });

    return { id: invite.id };
  }

  @ApiOkResponse({
    description: 'Invite successfuly Accepted',
  })
  @ApiNotFoundResponse({
    description: 'Invitee not found or expired',
  })
  @ApiUnauthorizedResponse({
    description: 'Failed to accept Invite due to owner ship or timeout',
  })
  @Post('invite/accept')
  async acceptInvite(
    @Req() { user: { userId } }: RequestWithUser,
    @Body(ValidationPipe) { id, socketId }: GameInviteAcceptReq,
  ) {
    const client = this.gamesService.getClientSocket(userId, socketId);
    if (!client)
      throw new BadRequestException(
        'You have currently no active connection to server',
      );

    const invite = this.gamesService.invites.get(id);
    if (!invite) throw new NotFoundException('Invite not found or expired');

    if (userId != invite.inviteeId)
      throw new BadRequestException('Invite not issued for you');

    // Clearing invite timeout
    clearTimeout(invite.timeOutHandler);

    invite.invitee = client;

    invite.host.emit('pong:join');
    client.emit('pong:join');

    // Creating Game
    const match = await this.gamesService.createMatchFromInvite(invite);
    if (!match)
      throw new InternalServerErrorException('Failure creating match');

    invite.host.join(match.id);
    client.join(match.id);

    // Destroy all other invites of both users
    this.gamesService.popUserInvites(client.user.userId);
    this.gamesService.popUserInvites(invite.inviteeId);

    return {};
  }

  @ApiOkResponse({
    description: 'Invite successfuly rejected',
  })
  @ApiNotFoundResponse({
    description: 'Invitee not found or expired',
  })
  @ApiUnauthorizedResponse({
    description: 'Failed to reject Invite, rejecter not the invitee',
  })
  @Post('invite/reject')
  async rejectInvite(
    @Req() { user: { userId } }: RequestWithUser,
    @Body(ValidationPipe) { id }: GameInviteRejectReq,
  ) {
    const invite = this.gamesService.invites.get(id);
    if (!invite) throw new NotFoundException('Invite not found or expired');

    if (userId != invite.inviteeId)
      throw new BadRequestException('Invite not issued for you');

    // Clearing invite timeout
    clearTimeout(invite.timeOutHandler);

    this.gamesService.invites.delete(id);

    return {};
  }

  @ApiOkResponse({
    description: 'Ongoing Games returned',
    type: OngoingMatch,
    isArray: true,
  })
  @Get('ongoing/matches')
  async ongoingGames() {
    const ongoings: OngoingMatch[] = [];

    try {
      for (const [id, match] of this.gamesService.matches) {
        ongoings.push({
          matchId: id,
          leftPlayer: await this.userService.selectOneStatusById(
            match.leftPlayer.id,
          ),
          rightPlayer: await this.userService.selectOneStatusById(
            match.rightPlayer.id,
          ),
        });
      }
    } catch {
      throw new InternalServerErrorException();
    }

    return ongoings;
  }

  @ApiOkResponse({
    type: GetListOfUsersRecentlyPlayedWithResponse,
    isArray: true,
    description: 'get a list of users that i recently played with',
  })
  @Get('users')
  users(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe)
    usersRecentlyPlatedWithDto: UsersRecentlyPlatedWithDto,
  ) {
    return this.gamesService.getListOfUsersRecentlyPlayedWith(
      req.user.userId,
      usersRecentlyPlatedWithDto,
    );
  }

  @ApiOkResponse({
    description: 'Match id is returned',
    type: QueryUserMatchIdRes,
  })
  @ApiNotFoundResponse({
    description: 'Match not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Get('ongoing')
  getUserMatchId(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException();

    const match = this.gamesService.findMatchByUserId(userId);
    if (!match || match.state != 'ongoing')
      throw new NotFoundException('Match not found');

    return { matchId: match.id };
  }
}
