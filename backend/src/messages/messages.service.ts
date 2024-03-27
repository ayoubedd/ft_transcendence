import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message, MessageStatus } from './entities/message.entity';
import { Brackets, Repository } from 'typeorm';
import {
  UserChannel,
  UserChannelRole,
  UserChannelStatus,
} from '@/user-channel/entities/user-channel.entity';
import { Channel } from '@/channel/entities/channel.entity';
import { User } from '@/users/entities/user.entity';
import { MessagesListDto } from './dto/messages-list.dto';
import {
  Friendship,
  FriendshipStatus,
} from '@/friendship/entities/friendship.entity';
import { ApiProperty } from '@nestjs/swagger';
import { MessagesGateway } from './messages.gateway';
import { UserChannelService } from '@/user-channel/user-channel.service';
import { FriendshipService } from '@/friendship/friendship.service';
import { UsersService } from '@/users/users.service';

class FriendshipInMessage {
  @ApiProperty()
  id: string;

  @ApiProperty({
    type: 'enum',
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;
}

class RoleInMessage {
  @ApiProperty()
  id: string;

  @ApiProperty({
    type: 'enum',
    enum: UserChannelStatus,
  })
  status: UserChannelStatus;

  @ApiProperty()
  muteExpireAt: Date;

  @ApiProperty({
    type: 'enum',
    enum: UserChannelRole,
  })
  role: UserChannelRole;
}

export class ListOfMessagesResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  channel_id: string;

  @ApiProperty({
    enum: MessageStatus,
  })
  status: MessageStatus;

  @ApiProperty({
    type: FriendshipInMessage,
    nullable: true,
  })
  friendship: FriendshipInMessage | null;

  @ApiProperty({
    type: Date,
  })
  createdAt: string;

  @ApiProperty({
    type: RoleInMessage,
  })
  role: RoleInMessage;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(UserChannel)
    private readonly userChannelRepository: Repository<UserChannel>,
    private readonly messagesGateway: MessagesGateway,
    private readonly userChannelService: UserChannelService,
    private readonly friendshipService: FriendshipService,
    private readonly userService: UsersService,

    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  async createMessage(
    senderId: string,
    channelId: string,
    msg: string,
    socketId: string,
  ) {
    const userInfoInChanel = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :senderId', { senderId })
      .andWhere('channel_id = :channelId', { channelId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .getOne();
    if (!userInfoInChanel)
      throw new BadRequestException('you cannot send messages in this channel');
    const message = new Message();
    message.channel = new Channel();
    message.channel.id = channelId;
    message.user = new User();
    message.user.id = senderId;
    message.status = MessageStatus.UNREAD;
    message.value = msg;
    try {
      const { id } = await this.messageRepository.save(message);
      const messageInDb = await this.messageRepository.findOne({
        where: { id },
        relations: { user: true, channel: true },
      });
      const members = await this.userChannelService.getListOfUsersInChannel({
        channelId,
        userId: senderId,
      });
      if (!messageInDb) return;
      this.messagesGateway.broadcast(messageInDb, members, socketId);
      return messageInDb;
    } catch (e) {
      throw new BadRequestException('could not save the message');
    }
  }

  async getListOfMessagesInChannel({
    channelId,
    userId,
    limit,
    offset,
  }: MessagesListDto) {
    const userInfoInChanel = await this.userChannelRepository
      .createQueryBuilder()
      .where('user_id = :userId', { userId })
      .andWhere('channel_id = :channelId', { channelId })
      .andWhere('status = :accepted', { accepted: UserChannelStatus.ACCEPTED })
      .getOne();

    if (!userInfoInChanel)
      throw new BadRequestException('you cannot send messages in this channel');

    const messages = await this.messageRepository
      .createQueryBuilder('msg')
      .leftJoinAndMapOne('msg.user', User, 'user', 'msg.user_id = user.id')
      .leftJoinAndMapOne(
        'msg.friendship',
        Friendship,
        'fr',
        'msg.user_id = fr.sender AND fr.receiver = :receiverId OR msg.user_id = fr.receiver AND fr.sender = :senderId',
        { receiverId: userId, senderId: userId },
      )
      .leftJoinAndMapOne(
        'msg.role',
        UserChannel,
        'uc',
        'msg.channel_id = uc.channel_id AND msg.user_id = uc.user_id',
      )
      .where('msg.channel_id = :channelId', { channelId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('fr.status IS NULL').orWhere('fr.status != :status', {
            status: FriendshipStatus.BLOCKED,
          });
        }),
      )
      .orderBy('msg.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .printSql()
      .getMany();

    return messages;
  }

  async updateMessageWithRead(userId: string, messageId: string) {
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
      },
      relations: {
        user: true,
        channel: true,
      },
    });
    if (!message) throw new NotFoundException('message is not found');
    if (message.user.id === userId)
      throw new BadRequestException(
        'you cannot update your own message status',
      );
    if (!message.channel.isDM)
      throw new BadRequestException('this route work only on dms');
    const userInChannel = await this.userChannelService.getUserInfoInChannel(
      userId,
      message.channel.id,
    );
    if (!userInChannel)
      throw new BadRequestException('you cannot update this message status');
    if (message.status === MessageStatus.SEEN)
      throw new BadRequestException('the message is already seen');
    message.status = MessageStatus.SEEN;
    await this.messageRepository.save(message);
    return;
  }

  async sendMessageToUser(
    myId: string,
    toId: string,
    value: string,
    socketId: string,
  ) {
    if (myId === toId)
      throw new BadRequestException('you cant send request to yourself');

    const friendship =
      await this.friendshipService.getFriendshipBetweenTwoUsers(myId, toId);
    if (friendship && friendship.status === FriendshipStatus.BLOCKED)
      throw new BadRequestException('you cannot send messages to this user');

    let channel = await this.userChannelService.getDmChannelBetweenTwoUsers(
      myId,
      toId,
    );
    if (!channel)
      channel = await this.userChannelService.createDmChannelBetweenTwoUsers(
        myId,
        toId,
      );

    const message = new Message();
    message.channel = channel;
    message.status = MessageStatus.UNREAD;
    message.user = await this.userService.findOneById(myId, myId);
    message.value = value;
    await this.messageRepository.save(message);
    const userInChannel = new UserChannel();
    userInChannel.user = new User();
    userInChannel.user.id = toId;

    const members = await this.userChannelService.getListOfUsersInChannel({
      channelId: channel.id,
      userId: myId,
    });
    this.messagesGateway.broadcast(message, members, socketId);
    await this.channelRepository.update(
      { id: channel.id },
      { updatedAt: new Date() },
    );
    return message;
  }
}
