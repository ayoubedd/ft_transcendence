import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
  Query,
  Delete,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ChannelService,
  ChannelResponse,
  UpdateChannelResponse,
  SearchChannelResponse,
} from './channel.service';
import { RequestWithUser } from '@/utils/request-with-logged-user';
import { CreateChannelDto } from './dto/create-channel-dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SearchChannelDto } from './dto/search-channel-dto';
import { UserChannelService } from '@/user-channel/user-channel.service';
import { InviteChannelDto } from './dto/invite-channel-dto';
import { UserChannel } from '@/user-channel/entities/user-channel.entity';
import { AcceptUserChannelDto } from './dto/accept-user-channel-dto';
import { MemberOfAChannelDto } from './dto/members-channel-dto';
import { JoinChannelDto } from './dto/join-channel-dto';
import { KickUserFromChannelDto } from './dto/kick-user-channel-dto';
import { PromotUserChannelDto } from './dto/promot-user-channel-dto';
import { BanUserChannelDto } from './dto/ban-user-channel-dto';
import { GetOneChannelDto } from './dto/get-one-channel-dto';
import { GetListOfBansDto } from './dto/get-list-of-bans-dto';
import { UnbanUserFromChannelDto } from './dto/unban-user-channel-dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { LeaveChannelDto } from './dto/leave-channel.dto';
import { TwoFaGuard } from '@/auth/2fa.guard';
import { ChannelAddDto } from './entities/channel-add.dto';
import { User } from '@/users/entities/user.entity';
import { RecentChannelDto } from './dto/recent-channel.dto';
import { MessagesService } from '@/messages/messages.service';

@Controller('channel')
@UseGuards(TwoFaGuard)
export class ChannelController {
  constructor(
    private readonly channelsService: ChannelService,

    private readonly userChannelService: UserChannelService,
    private readonly messageService: MessagesService,
  ) {}

  @ApiOkResponse({
    description: 'list of channels that you are in',
    type: ChannelResponse,
    isArray: true,
  })
  @Get()
  channels(@Req() req: RequestWithUser) {
    return this.userChannelService.getListOfChannelsUserIn(req.user.userId);
  }

  @Post('create')
  @ApiCreatedResponse({
    type: ChannelResponse,
  })
  @ApiBadRequestResponse({
    description: 'protected and private channels need to have a password',
  })
  create(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) createChannelDto: CreateChannelDto,
  ) {
    return this.userChannelService.createChannelWithOwner(
      createChannelDto,
      req.user.userId,
    );
  }

  @Get('search')
  @ApiOkResponse({
    description: 'get a list of channels',
    type: SearchChannelResponse,
    isArray: true,
  })
  search(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) searchChannelDto: SearchChannelDto,
  ) {
    return this.channelsService.searchChannel(
      req.user.userId,
      searchChannelDto,
    );
  }

  @ApiCreatedResponse({
    type: UserChannel,
  })
  @ApiBadRequestResponse()
  @Post('invite')
  invite(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) inviteChannelDto: InviteChannelDto,
  ) {
    inviteChannelDto.senderId = req.user.userId;
    return this.userChannelService.createPendingUserInChannel(inviteChannelDto);
  }

  @ApiOkResponse({
    type: UserChannel,
    isArray: true,
  })
  @Get('invite')
  getInvites(@Req() req: RequestWithUser) {
    return this.userChannelService.findListOfPendingUserInChannel(
      req.user.userId,
    );
  }

  @ApiCreatedResponse({
    type: UserChannel,
  })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Post('accept')
  accept(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) acceptUserChannelDto: AcceptUserChannelDto,
  ) {
    acceptUserChannelDto.userId = req.user.userId;
    return this.userChannelService.changePendingUserInChannelToAccept(
      acceptUserChannelDto,
    );
  }

  @ApiCreatedResponse({
    type: UserChannel,
    isArray: true,
  })
  @ApiBadRequestResponse()
  @Get('members')
  members(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) memberOfAChannelDto: MemberOfAChannelDto,
  ) {
    memberOfAChannelDto.userId = req.user.userId;
    return this.userChannelService.getListOfUsersInChannel(memberOfAChannelDto);
  }

  @Post('join')
  join(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) joinChannelDto: JoinChannelDto,
  ) {
    joinChannelDto.userId = req.user.userId;
    return this.userChannelService.createAcceptUserInChannel(joinChannelDto);
  }

  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Delete('kick')
  kick(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) kickUserFromChannelDto: KickUserFromChannelDto,
  ) {
    kickUserFromChannelDto.kickerId = req.user.userId;
    return this.userChannelService.deleteUserChannelInfo(
      kickUserFromChannelDto,
    );
  }

  @ApiCreatedResponse({
    description: 'promote user to be an admin',
  })
  @ApiBadRequestResponse()
  @Post('promote')
  promote(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) promotUserChannelDto: PromotUserChannelDto,
  ) {
    promotUserChannelDto.userId = req.user.userId;
    return this.userChannelService.updateUserWithAdmin(promotUserChannelDto);
  }

  @ApiCreatedResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Post('ban')
  ban(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) banUserFromChannelDto: BanUserChannelDto,
  ) {
    banUserFromChannelDto.bannerId = req.user.userId;
    return this.userChannelService.updateUserChnnelInfoWithBan(
      banUserFromChannelDto,
    );
  }

  @ApiOkResponse({
    description: 'get a list of banned people on this channel',
    isArray: true,
    type: UserChannel,
  })
  @Get('ban')
  bans(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) getListOfBansDto: GetListOfBansDto,
  ) {
    return this.userChannelService.getListOfUsersBannedInChannel(
      req.user.userId,
      getListOfBansDto,
    );
  }

  @Delete('unban')
  @ApiOkResponse()
  @ApiBadRequestResponse()
  unban(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) unbanUserFromChannelDto: UnbanUserFromChannelDto,
  ) {
    unbanUserFromChannelDto.userId = req.user.userId;
    return this.userChannelService.deleteBannedUserChannelInfo(
      unbanUserFromChannelDto,
    );
  }

  @ApiCreatedResponse({
    type: UpdateChannelResponse,
  })
  @Post('settings')
  settings(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) updateChannelDto: UpdateChannelDto,
  ) {
    updateChannelDto.userId = req.user.userId;
    return this.userChannelService.updateChannel(updateChannelDto);
  }

  @ApiOkResponse()
  @ApiBadRequestResponse()
  @Delete('leave')
  async leave(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) leaveChannelDto: LeaveChannelDto,
  ) {
    return this.userChannelService.deleteUserFromChannel(
      req.user.userId,
      leaveChannelDto,
    );
  }

  @Get('add')
  @ApiOkResponse({
    type: User,
    isArray: true,
    description: 'get a list of users that can be added to a channel',
  })
  @ApiBadRequestResponse()
  add(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) channelAddDto: ChannelAddDto,
  ) {
    return this.userChannelService.getListOfUserThatCanBeAddedToChennel(
      req.user.userId,
      channelAddDto,
    );
  }

  @Get('recent')
  @ApiOkResponse({
    description: 'get list of channels that recently chatted in',
  })
  recent(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) recentChannelDto: RecentChannelDto,
  ) {
    return this.userChannelService.getListOfChannelsRecentlyChattedIn(
      req.user.userId,
      recentChannelDto,
    );
  }

  @Get('dm/:id')
  async getDmChannelWithUser(
    @Req() req: RequestWithUser,
    @Param(ValidationPipe) { id }: GetOneChannelDto,
  ) {
    const channel = await this.userChannelService.getDmChannelBetweenTwoUsers(
      req.user.userId,
      id,
    );
    if (!channel) throw new NotFoundException();
    return channel;
  }

  // WARN: this function will alwase catch all requests if all of the above did not match
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':id')
  getOneChannel(
    @Req() req: RequestWithUser,
    @Param(ValidationPipe) getOneChannelDto: GetOneChannelDto,
  ) {
    return this.channelsService.getOneChannelWithId(getOneChannelDto);
  }
}
