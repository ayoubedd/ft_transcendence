import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserChannel,
  UserChannelRole,
  UserChannelStatus,
} from './entities/user-channel.entity';
import { Brackets, Repository } from 'typeorm';
import { InviteChannelDto } from '@/channel/dto/invite-channel-dto';
import { AcceptUserChannelDto } from '@/channel/dto/accept-user-channel-dto';
import { User } from '@/users/entities/user.entity';
import { Channel, ChannelType } from '@/channel/entities/channel.entity';
import { MemberOfAChannelDto } from '@/channel/dto/members-channel-dto';
import { JoinChannelDto } from '@/channel/dto/join-channel-dto';
import crypto from 'node:crypto';
import { KickUserFromChannelDto } from '@/channel/dto/kick-user-channel-dto';
import { PromotUserChannelDto } from '@/channel/dto/promot-user-channel-dto';
import { BanUserChannelDto } from '@/channel/dto/ban-user-channel-dto';
import { UnbanUserFromChannelDto } from '@/channel/dto/unban-user-channel-dto';
import { GetListOfBansDto } from '@/channel/dto/get-list-of-bans-dto';
import {
  Friendship,
  FriendshipStatus,
} from '@/friendship/entities/friendship.entity';
import { LeaveChannelDto } from '@/channel/dto/leave-channel.dto';
import { ChannelService } from '@/channel/channel.service';
import { CreateChannelDto } from '@/channel/dto/create-channel-dto';
import { UpdateChannelDto } from '@/channel/dto/update-channel.dto';
import { ChannelAddDto } from '@/channel/entities/channel-add.dto';
import { FriendshipService } from '@/friendship/friendship.service';
import { RecentChannelDto } from '@/channel/dto/recent-channel.dto';

@Injectable()
export class UserChannelService {
  constructor(
    @InjectRepository(UserChannel)
    private readonly userChannelRepository: Repository<UserChannel>,

    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,

    private readonly channelService: ChannelService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly friendshipService: FriendshipService,
  ) {}

  async createPendingUserInChannel({
    channelId,
    senderId,
    receiverId,
  }: InviteChannelDto) {
    const userInfoInChannel = new UserChannel();
    const sender: string | undefined = (
      await this.userChannelRepository
        .createQueryBuilder()
        .select('user_id')
        .where('user_id = :senderId', { senderId })
        .andWhere('channel_id = :channelId', { channelId })
        .andWhere('role != :role', { role: UserChannelRole.USER })
        .limit(1)
        .printSql()
        .execute()
    )[0]?.user_id;

    if (!sender)
      throw new BadRequestException(
        "you can't invite to channel which you are not in and admin or owner",
      );

    const receiverInfoInChannel = await this.userChannelRepository.findOne({
      where: {
        user: { id: receiverId },
        channel: { id: channelId },
      },
      relations: {
        user: true,
        channel: true,
      },
    });

    if (
      receiverInfoInChannel &&
      receiverInfoInChannel.status === UserChannelStatus.BANNED
    )
      throw new BadRequestException("you can't join this channel");

    if (receiverInfoInChannel) return receiverInfoInChannel;

    userInfoInChannel.user = new User();
    userInfoInChannel.user.id = receiverId;
    userInfoInChannel.channel = new Channel();
    userInfoInChannel.channel.id = channelId;

    return this.userChannelRepository.save(userInfoInChannel);
  }

  async findListOfPendingUserInChannel(userId: string) {
    return await this.userChannelRepository.find({
      where: { user: { id: userId }, status: UserChannelStatus.PENDING },
      relations: { channel: true, user: true },
    });
  }

  async changePendingUserInChannelToAccept({
    userId,
    channelId,
  }: AcceptUserChannelDto) {
    const userInfoInChannel = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('channel_id = :channelId', { channelId })
      .andWhere('status = :pending', { pending: UserChannelStatus.PENDING })
      .printSql()
      .getOne();

    if (!userInfoInChannel)
      throw new NotFoundException(
        'the request you trying to accept is not found',
      );
    if (userInfoInChannel.status !== UserChannelStatus.PENDING)
      throw new BadRequestException("you can't accept this request");
    userInfoInChannel.status = UserChannelStatus.ACCEPTED;
    return await this.userChannelRepository.save(userInfoInChannel);
  }

  async getListOfUsersInChannel({ channelId, userId }: MemberOfAChannelDto) {
    const userInChannel = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('channel_id = :channelId', { channelId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .printSql()
      .getOne();

    if (!userInChannel)
      throw new BadRequestException(
        'you cannot view the member of this channel',
      );

    const memberOfAChannel = await this.userChannelRepository
      .createQueryBuilder('uc')
      .leftJoinAndMapOne('uc.user', User, 'user', 'uc.user_id = user.id')
      .leftJoinAndMapOne(
        'uc.friendship',
        Friendship,
        'f',
        'user.id = f.receiver AND f.sender = :userId1 OR user.id = f.sender AND f.receiver = :userId2',
        {
          userId1: userId,
          userId2: userId,
        },
      )
      .where('uc.channel_id = :channelId', { channelId })
      .andWhere('uc.status = :accepted', {
        accepted: UserChannelStatus.ACCEPTED,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('f.status IS NULL').orWhere('f.status != :blocked', {
            blocked: FriendshipStatus.BLOCKED,
          });
        }),
      )
      .printSql()
      .getMany();
    return memberOfAChannel;
  }

  async createAcceptUserInChannel({
    userId,
    channelId,
    password,
  }: JoinChannelDto) {
    const userInfoInChannel = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('channel_id = :channelId', { channelId })
      .printSql()
      .getOne();

    if (
      userInfoInChannel &&
      userInfoInChannel.status === UserChannelStatus.PENDING
    )
      return await this.userChannelRepository.save({
        ...userInfoInChannel,
        status: UserChannelStatus.ACCEPTED,
      });
    if (userInfoInChannel)
      throw new BadRequestException('you cannot join this channel');

    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      select: ['type', 'password', 'salt'],
    });

    if (!channel) throw new NotFoundException('channel not found');

    if (channel.type !== ChannelType.PUBLIC && !password)
      throw new BadRequestException('password required for this channel');

    const userInChannel = new UserChannel();

    if (channel.type === ChannelType.PUBLIC) {
      userInChannel.user = new User();
      userInChannel.user.id = userId;
      userInChannel.channel = new Channel();
      userInChannel.channel.id = channelId;
      userInChannel.status = UserChannelStatus.ACCEPTED;
      return await this.userChannelRepository.save(userInChannel);
    }
    if (
      password &&
      crypto
        .pbkdf2Sync(password, channel.salt, 1000, 64, 'sha512')
        .toString('hex') !== channel.password
    )
      throw new BadRequestException('wrong password');

    userInChannel.user = new User();
    userInChannel.user.id = userId;
    userInChannel.channel = new Channel();
    userInChannel.channel.id = channelId;
    userInChannel.status = UserChannelStatus.ACCEPTED;
    await this.userChannelRepository.save(userInChannel);
    return;
  }

  async deleteUserChannelInfo({
    channelId,
    kickerId,
    kickedUserId,
  }: KickUserFromChannelDto) {
    const kicker = await this.userChannelRepository
      .createQueryBuilder()
      .where('channel_id = :channelId', { channelId })
      .andWhere('user_id = :kickerId', { kickerId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .andWhere('role != :user', { user: UserChannelRole.USER })
      .printSql()
      .getOne();

    if (!kicker)
      throw new BadRequestException('you cannot kick people from this channel');

    const kicked = await this.userChannelRepository
      .createQueryBuilder()
      .where('channel_id = :channelId', { channelId })
      .andWhere('user_id = :kickedUserId', { kickedUserId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .printSql()
      .getOne();

    if (!kicked || kicked.status !== UserChannelStatus.ACCEPTED)
      throw new NotFoundException('the user being kicked is not found');

    if (kicker.role === kicked.role)
      throw new BadRequestException('you cannot kick this user');

    if (
      kicker.role === UserChannelRole.ADMIN &&
      kicked.role !== UserChannelRole.USER
    )
      throw new BadRequestException('you cannot kick this user');

    return await this.userChannelRepository
      .createQueryBuilder()
      .delete()
      .where('user = :kickedUserId', { kickedUserId })
      .andWhere('channel_id = :channelId', { channelId })
      .printSql()
      .execute();
  }

  async updateUserWithAdmin({
    promotedUserId,
    userId,
    channelId,
  }: PromotUserChannelDto) {
    const user = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('channel_id = :channelId', { channelId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .andWhere(
        new Brackets((qb) => {
          qb.where('role = :admin', { admin: UserChannelRole.ADMIN }).orWhere(
            'role = :owner',
            { owner: UserChannelRole.OWNER },
          );
        }),
      )
      .printSql()
      .getOne();

    if (!user)
      throw new BadRequestException('you cannot promote users on this channel');

    const promotedUser = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :promotedUserId', { promotedUserId })
      .andWhere('channel_id = :channelId', { channelId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .andWhere('role = :user', { user: UserChannelRole.USER })
      .printSql()
      .getOne();

    if (!promotedUser)
      throw new BadRequestException('you cannot promote this user');

    return await this.userChannelRepository.save({
      ...promotedUser,
      role: UserChannelRole.ADMIN,
    });
  }

  async updateUserChnnelInfoWithBan({
    bannerId,
    bannedUserId,
    channelId,
  }: BanUserChannelDto) {
    const banner = await this.userChannelRepository
      .createQueryBuilder()
      .where('channel_id = :channelId', { channelId })
      .andWhere('user_id = :bannerId', { bannerId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .printSql()
      .getOne();

    if (!banner || banner.role === UserChannelRole.USER)
      throw new BadRequestException('you cannot ban people from this channel');

    const bannedUser = await this.userChannelRepository
      .createQueryBuilder()
      .where('channel_id = :channelId', { channelId })
      .andWhere('user_id = :bannedUserId', { bannedUserId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .printSql()
      .getOne();

    if (!bannedUser)
      throw new NotFoundException('the user being banned is not found');

    if (banner.role == bannedUser.role)
      throw new BadRequestException('you cannot ban this user');

    if (
      banner.role === UserChannelRole.ADMIN &&
      bannedUser.role !== UserChannelRole.USER
    )
      throw new BadRequestException('you cannot ban this user');

    return this.userChannelRepository.save({
      ...bannedUser,
      status: UserChannelStatus.BANNED,
    });
  }

  async getListOfChannelsUserIn(userId: string) {
    const channels = await this.userChannelRepository
      .createQueryBuilder('uc')
      .leftJoinAndSelect('uc.channel', 'c')
      .where('uc.user_id = :userId', { userId })
      .andWhere('uc.status = :accepted', {
        accepted: UserChannelStatus.ACCEPTED,
      })
      .select('c.id, c.name, c.type, c.isDM')
      .execute();
    return channels;
  }

  async getListOfUsersBannedInChannel(
    userId: string,
    { channelId }: GetListOfBansDto,
  ) {
    const userInChannel = await this.userChannelRepository.findOneBy({
      channel: { id: channelId },
      user: { id: userId },
      status: UserChannelStatus.ACCEPTED,
    });
    if (!userInChannel)
      throw new BadRequestException('you are not in this channel');
    return await this.userChannelRepository.find({
      where: { channel: { id: channelId }, status: UserChannelStatus.BANNED },
      relations: { user: true, channel: true },
    });
  }

  async deleteBannedUserChannelInfo({
    channelId,
    userId,
    bannedUserId,
  }: UnbanUserFromChannelDto) {
    const user = await this.userChannelRepository
      .createQueryBuilder()
      .where('channel_id = :channelId', { channelId })
      .andWhere('user_id = :userId', { userId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .andWhere('role != :user', { user: UserChannelRole.USER })
      .getOne();

    if (!user) throw new BadRequestException('you cannot ban this user');

    await this.userChannelRepository
      .createQueryBuilder()
      .delete()
      .where('channel_id = :channelId', { channelId })
      .andWhere('user_id = :bannedUserId', { bannedUserId })
      .andWhere('status = :banned', { banned: UserChannelStatus.BANNED })
      .execute();
    return;
  }

  async createUserChannelOwner({
    channelId,
    userId,
  }: {
    channelId: string;
    userId: string;
  }) {
    const info = new UserChannel();

    info.role = UserChannelRole.OWNER;
    info.user = new User();
    info.user.id = userId;
    info.status = UserChannelStatus.ACCEPTED;
    info.channel = new Channel();
    info.channel.id = channelId;

    await this.userChannelRepository.save(info);
  }

  async getUserInfoInChannel(userId: string, channelId: string) {
    return await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('channel_id = :channelId', { channelId })
      .getOne();
  }

  async deleteUserFromChannel(
    userId: string,
    { channelId, newOwnerUsername }: LeaveChannelDto,
  ) {
    const userInChannel = await this.userChannelRepository.findOneBy({
      user: { id: userId },
      channel: { id: channelId },
    });
    if (!userInChannel)
      throw new BadRequestException(
        'you cannot leave a channel you are not in',
      );
    if (userInChannel.status !== UserChannelStatus.ACCEPTED)
      throw new BadRequestException('you cant leave this channel');
    if (userInChannel.role !== UserChannelRole.OWNER) {
      await this.userChannelRepository.delete({ id: userInChannel.id });
      return;
    }
    if (!newOwnerUsername)
      throw new BadRequestException('you need choose new owner');
    const newOwner = await this.userChannelRepository.findOneBy({
      user: { username: newOwnerUsername },
      channel: { id: channelId },
    });
    if (!newOwner)
      throw new BadRequestException('the user is not found in the channel');
    if (newOwner.id === userInChannel.id)
      throw new BadRequestException(
        'you need to pass a diffrent user to become the new owner',
      );
    await this.userChannelRepository.delete({ id: userInChannel.id });
    await this.userChannelRepository.update(
      { id: newOwner.id },
      { role: UserChannelRole.OWNER },
    );
  }

  async getDmChannelBetweenTwoUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<Channel | null | undefined> {
    return await this.userChannelRepository
      .createQueryBuilder('uc1')
      .leftJoin(UserChannel, 'uc2', 'uc1.channel_id = uc2.channel_id')
      .leftJoin(Channel, 'channel', 'uc1.channel_id = channel.id')
      .where('channel."isDM" = true')
      .andWhere('uc1.user_id = :user1Id', { user1Id })
      .andWhere('uc2.user_id = :user2Id', { user2Id })
      .andWhere('uc1.channel_id = uc2.channel_id')
      .select([
        'channel.id as id',
        'channel.name as name',
        'channel.type as type',
        'channel."isDM" as "isDM"',
        'channel."createdAt"',
        'channel."updatedAt"',
      ])
      .getRawOne();
  }

  async createDmChannelBetweenTwoUsers(user1Id: string, user2Id: string) {
    const channel = await this.channelService.createDmChannel();
    const user1InChannel = new UserChannel();
    user1InChannel.user = new User();
    user1InChannel.user.id = user1Id;
    user1InChannel.role = UserChannelRole.USER;
    user1InChannel.status = UserChannelStatus.ACCEPTED;
    user1InChannel.channel = channel;

    const user2InChannel = new UserChannel();
    user2InChannel.user = new User();
    user2InChannel.user.id = user2Id;
    user2InChannel.role = UserChannelRole.USER;
    user2InChannel.status = UserChannelStatus.ACCEPTED;
    user2InChannel.channel = channel;

    await this.userChannelRepository.save(user1InChannel);
    await this.userChannelRepository.save(user2InChannel);

    return channel;
  }

  async createChannelWithOwner(
    createChannelDto: CreateChannelDto,
    ownerId: string,
  ) {
    const channel = await this.channelService.createChannel(
      createChannelDto,
      ownerId,
      false,
    );
    const ownerInChannel = new UserChannel();
    ownerInChannel.channel = new Channel();
    ownerInChannel.channel.id = channel.id;
    ownerInChannel.role = UserChannelRole.OWNER;
    ownerInChannel.status = UserChannelStatus.ACCEPTED;
    ownerInChannel.user = new User();
    ownerInChannel.user.id = ownerId;
    await this.userChannelRepository.save(ownerInChannel);
    return channel;
  }

  async updateChannel({
    userId,
    name,
    type,
    password,
    channelId,
  }: UpdateChannelDto) {
    if (
      type &&
      type === ChannelType.PUBLIC &&
      password &&
      password === undefined
    )
      throw new BadRequestException(
        'you need a password if the channel private or public',
      );
    const userInfo = await this.getUserInfoInChannel(userId, channelId);
    if (
      !userInfo ||
      userInfo.status !== UserChannelStatus.ACCEPTED ||
      userInfo.role === UserChannelRole.USER
    )
      throw new BadRequestException(
        'you do not have permissions on this channel',
      );
    return this.channelService.updateChannel({
      userId,
      name,
      type,
      password,
      channelId,
    });
  }

  async getListOfUserThatCanBeAddedToChennel(
    userId: string,
    { channelId, limit, offset, username }: ChannelAddDto,
  ) {
    const userInChannel = await this.userChannelRepository.findOneBy({
      user: { id: userId },
      channel: { id: channelId },
    });
    if (
      !userInChannel ||
      userInChannel.role === UserChannelRole.USER ||
      userInChannel.status !== UserChannelStatus.ACCEPTED
    )
      throw new BadRequestException('you cannot add users to this channel');
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        Friendship,
        'f',
        'f.sender = :userId1 and f.receiver = user.id or f.sender = user.id and f.receiver = :userId2',
        {
          userId1: userId,
          userId2: userId,
        },
      )
      .leftJoin(
        UserChannel,
        'uc',
        'uc.user_id = user.id and uc.channel_id = :channelId',
        {
          channelId,
        },
      )
      .where(
        new Brackets((qb) => {
          qb.where('f.status is null').orWhere('f.status != :blocked', {
            blocked: FriendshipStatus.BLOCKED,
          });
        }),
      )
      .andWhere('uc.status is null')
      .andWhere('user.username ilike :username', { username: `%${username}%` })
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async getDmChannelWithUser(userId: string, friendId: string) {
    const friendship =
      await this.friendshipService.getFriendshipBetweenTwoUsers(
        userId,
        friendId,
      );
    if (friendship && friendship.status === FriendshipStatus.BLOCKED)
      throw new BadRequestException();
  }

  async getListOfChannelsRecentlyChattedIn(
    userId: string,
    { limit, offset }: RecentChannelDto,
  ) {
    const channels: Channel[] = await this.userChannelRepository
      .createQueryBuilder('uc')
      .leftJoinAndSelect('uc.channel', 'c')
      .where('uc.user_id = :userId', { userId })
      .andWhere('uc.status = :accepted', {
        accepted: UserChannelStatus.ACCEPTED,
      })
      .select('c.id, c.name, c.type, c.isDM')
      .orderBy('c."updatedAt"', 'DESC')
      .offset(offset)
      .limit(limit)
      .execute();
    const blockedUsers =
      await this.friendshipService.getListOfUserBlockedOrBlockedBy(userId);

    const blockedChannels: Channel[] = [];
    for (const friendship of blockedUsers) {
      const channel = await this.getDmChannelBetweenTwoUsers(
        userId,
        friendship.sender.id === userId
          ? friendship.receiver.id
          : friendship.sender.id,
      );
      if (channel) blockedChannels.push(channel);
    }

    const isChannelInBlockedChannels = (channel: Channel) => {
      for (const c of blockedChannels) {
        if (c && c.id === channel.id) return true;
      }
      return false;
    };

    return channels.filter((channel) => !isChannelInBlockedChannels(channel));
  }
}
