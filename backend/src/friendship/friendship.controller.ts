import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  FriendshipService,
  FriendshipResponse,
  FriendshipUnblockResponse,
  SelectAllSomeoneFriendsResponse,
} from './friendship.service';
import { RequestWithUser } from '@/utils/request-with-logged-user';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';
import { FriendshipInviteDto } from './dto/frienship.dto';
import { Friendship } from './entities/friendship.entity';
import { SearchInFriendsDto } from './dto/search-in-friends.dto';
import { FriendshipIdDto } from './dto/friendship-id.dto';
import { MyFriendsDto } from './dto/my-friends.dto';
import { FriendshipInviteUsernameDto } from './dto/friendship-invite-username.dto';
import { UserFriendsDto } from './dto/user-friends.dto';
import { TwoFaGuard } from '@/auth/2fa.guard';
import { FriendshipGateway } from './friendship.gateway';

@Controller('friendship')
@UseGuards(TwoFaGuard)
export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly friendshipGateway: FriendshipGateway,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'get list of friends',
    type: User,
    isArray: true,
  })
  friendships(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) myFriendsDto: MyFriendsDto,
  ) {
    return this.friendshipService.selectAllFriends(
      req.user.userId,
      myFriendsDto,
    );
  }

  @Get('requests')
  @ApiOkResponse({
    description: 'get list of friend request you sent',
    type: Friendship,
    isArray: true,
  })
  requests(@Req() { user: { userId } }: RequestWithUser) {
    return this.friendshipService.getListOfFrienshipsBySender(userId);
  }

  @ApiCreatedResponse({
    type: FriendshipResponse,
  })
  @ApiNotFoundResponse({
    description: 'the user you trying to connect with is not found',
  })
  @ApiBadRequestResponse({
    description: 'something went wrong',
  })
  @Post('invite')
  invite(
    @Req() { user: { userId } }: RequestWithUser,
    @Body(ValidationPipe) { him: id }: FriendshipInviteDto,
  ) {
    return this.friendshipService.createPendingRelationWith(
      userId,
      id,
      this.friendshipGateway,
    );
  }

  @Post('accept')
  @ApiCreatedResponse({
    type: FriendshipResponse,
  })
  @ApiNotFoundResponse({
    description: 'the friend request could not be found to be accepted',
  })
  accept(
    @Req() { user: { userId } }: RequestWithUser,
    @Body(ValidationPipe) { him: id }: FriendshipInviteDto,
  ) {
    return this.friendshipService.updatePendingRelationWithAccept(id, userId);
  }

  @Post('block')
  @ApiCreatedResponse({
    type: FriendshipResponse,
  })
  @ApiNotFoundResponse({
    description: 'the provided user id could not be found',
  })
  block(
    @Req() { user: { userId } }: RequestWithUser,
    @Body(ValidationPipe) { him: id }: FriendshipInviteDto,
  ) {
    return this.friendshipService.updateRelationWithBlock(userId, id);
  }

  @Get('block')
  @ApiOkResponse({
    type: Friendship,
    isArray: true,
  })
  getBlockedUsers(@Req() req: RequestWithUser) {
    return this.friendshipService.getListOfBlockedUsers(req.user.userId);
  }

  @Delete('unblock')
  @ApiOkResponse({
    type: FriendshipUnblockResponse,
    description:
      'remove the relation between you and user with the id if he is blocked by you',
  })
  @ApiNotFoundResponse({
    description: 'generated if you dont have a relation with specified user',
  })
  @ApiBadRequestResponse({
    description:
      'generated if you have a relation with the user but it not blocked by you',
  })
  unblock(
    @Req() { user: { userId } }: RequestWithUser,
    @Body(ValidationPipe) { him: id }: FriendshipInviteDto,
  ) {
    return this.friendshipService.updateRelationwithUnblock(userId, id);
  }

  @ApiOkResponse({
    type: User,
    isArray: true,
  })
  @Get('search')
  search(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) searchInFriendsDto: SearchInFriendsDto,
  ) {
    return this.friendshipService.searchInFriends(
      req.user.userId,
      searchInFriendsDto,
    );
  }

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @Delete('cancel')
  cancel(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) friendshipIdDto: FriendshipIdDto,
  ) {
    return this.friendshipService.cancelPendingFriendship(
      req.user.userId,
      friendshipIdDto,
    );
  }

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @Delete('reject')
  reject(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) friendshipIdDto: FriendshipIdDto,
  ) {
    return this.friendshipService.rejectPendingFriendship(
      req.user.userId,
      friendshipIdDto,
    );
  }

  @ApiOkResponse({
    type: Friendship,
    isArray: true,
    description: 'get a list of friendships that were sent to you',
  })
  @Get('pending')
  pending(@Req() req: RequestWithUser) {
    return this.friendshipService.getListOfFrienshipsByReceiver(
      req.user.userId,
    );
  }

  @ApiOkResponse({
    type: SelectAllSomeoneFriendsResponse,
    isArray: true,
  })
  @Get('user')
  userFriends(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) userFriendsDto: UserFriendsDto,
  ) {
    return this.friendshipService.selectAllSomeoneFriends(
      req.user.userId,
      userFriendsDto,
    );
  }

  @ApiCreatedResponse({
    type: Friendship,
  })
  @ApiBadRequestResponse()
  @Post('invite/username')
  inviteUsername(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe)
    friendshipInviteUsernameDto: FriendshipInviteUsernameDto,
  ) {
    return this.friendshipService.createPendingRelationWithUsername(
      req.user.userId,
      friendshipInviteUsernameDto,
    );
  }
}
