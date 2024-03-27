import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship, FriendshipStatus } from './entities/friendship.entity';
import { Brackets, ILike, Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FriendshipGateway } from './friendship.gateway';
import { SearchInFriendsDto } from './dto/search-in-friends.dto';
import { FriendshipIdDto } from './dto/friendship-id.dto';
import { MyFriendsDto } from './dto/my-friends.dto';
import { UserFriendsDto } from './dto/user-friends.dto';
import { FriendshipInviteUsernameDto } from './dto/friendship-invite-username.dto';

export class FriendshipResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;

  @ApiProperty({
    type: User,
  })
  sender: User;

  @ApiProperty({
    type: User,
  })
  receiver: User;
}

export class FriendshipWithoutJoins {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;
}

export class FriendshipUnblockResponse {
  @ApiProperty()
  message: string;
}

export class SelectAllSomeoneFriendsResponse extends User {
  @ApiProperty({
    nullable: true,
  })
  friendship: FriendshipWithoutJoins;
}

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async selectAllFriends(id: string, { limit, offset }: MyFriendsDto) {
    const friends = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where('friendship.status = :accepted', {
        accepted: FriendshipStatus.ACCEPTED,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('sender.id = :senderId', { senderId: id });
          qb.orWhere('receiver.id = :receiverId', { receiverId: id });
        }),
      )
      .limit(limit)
      .offset(offset)
      .printSql()
      .getMany();

    return friends.map((relation) =>
      relation.sender.id == id ? relation.receiver : relation.sender,
    ); // idk if this can be done with the query
  }

  async createPendingRelationWith(
    senderId: string,
    receiverId: string,
    friendshipGateway: FriendshipGateway,
  ) {
    if (senderId == receiverId) throw new BadRequestException();
    const isBlocked = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .where('friendship.sender = :receiverId', { receiverId })
      .andWhere('friendship.receiver = :senderId', { senderId })
      .andWhere('friendship.status = :blocked', {
        blocked: FriendshipStatus.BLOCKED,
      })
      .getOne();
    if (isBlocked) throw new NotFoundException();
    const relation = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .where('friendship.sender = :sender', { sender: senderId })
      .andWhere('friendship.receiver = :receiver', { receiver: receiverId })
      .getOne();
    if (relation) return relation;
    const newRelation = new Friendship();
    newRelation.sender = new User();
    newRelation.sender.id = senderId;
    newRelation.receiver = new User();
    newRelation.receiver.id = receiverId;
    newRelation.status = FriendshipStatus.PENDING;
    try {
      const res = await this.friendshipRepository.save(newRelation);
      friendshipGateway.sendFriendRequestEvent(senderId, receiverId, res.id);
      return { id: res.id, status: res.status };
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async updatePendingRelationWithAccept(senderId: string, receiverId: string) {
    const relation = await this.friendshipRepository
      .createQueryBuilder('f')
      .where('f.sender = :senderId', { senderId })
      .andWhere('f.receiver = :receiverId', { receiverId })
      .andWhere('f.status = :pending', { pending: FriendshipStatus.PENDING })
      .printSql()
      .getOne();

    if (!relation) throw new NotFoundException();

    const res = await this.friendshipRepository.save({
      id: relation.id,
      status: FriendshipStatus.ACCEPTED,
    });

    return { id: res.id, status: res.status };
  }

  async updateRelationWithBlock(senderId: string, receiverId: string) {
    const relation = await this.friendshipRepository
      .createQueryBuilder()
      .where(
        new Brackets((qb) => {
          qb.where('sender = :send', { send: senderId }).andWhere(
            'receiver = :recv',
            { recv: receiverId },
          );
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where('sender = :sender', { sender: receiverId }).andWhere(
            'receiver = :receiver',
            { receiver: senderId },
          );
        }),
      )
      .printSql()
      .getOne();
    if (!relation) {
      console.log('1 is running');
      const relation = new Friendship();
      relation.sender = new User();
      relation.sender.id = senderId;
      relation.receiver = new User();
      relation.receiver.id = receiverId;
      relation.status = FriendshipStatus.BLOCKED;
      const { id } = await this.friendshipRepository.save(relation);
      return await this.friendshipRepository.findOne({
        where: { id },
        relations: {
          sender: true,
          receiver: true,
        },
      });
    }

    if (relation.status == FriendshipStatus.BLOCKED)
      throw new BadRequestException();

    console.log('2 is running');
    relation.sender = new User();
    relation.sender.id = senderId;
    relation.receiver = new User();
    relation.receiver.id = receiverId;
    relation.status = FriendshipStatus.BLOCKED;

    const { id } = await this.friendshipRepository.save(relation);
    return await this.friendshipRepository.findOne({
      where: { id },
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }

  async getListOfBlockedUsers(userId: string) {
    return await this.friendshipRepository.find({
      where: {
        sender: {
          id: userId,
        },
        status: FriendshipStatus.BLOCKED,
      },
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }

  async updateRelationwithUnblock(
    senderId: string,
    receiverId: string,
  ): Promise<FriendshipUnblockResponse> {
    const relation = await this.friendshipRepository
      .createQueryBuilder('f')
      .where('f.sender = :senderId', { senderId })
      .andWhere('f.receiver = :receiverId', { receiverId })
      .printSql()
      .getOne();
    console.error({ relation });
    if (!relation) throw new NotFoundException();
    if (relation.status !== FriendshipStatus.BLOCKED)
      throw new BadRequestException();
    await this.friendshipRepository.remove(relation);
    return { message: 'the friend has been unblocked successfully' };
  }

  async searchInFriends(
    userId: string,
    { name, limit, offset }: SearchInFriendsDto,
  ): Promise<User[]> {
    return (
      await this.friendshipRepository.find({
        relations: {
          sender: true,
          receiver: true,
        },
        where: [
          {
            sender: { id: userId },
            receiver: { username: ILike(`%${name}%`) },
            status: FriendshipStatus.ACCEPTED,
          },
          {
            receiver: { id: userId },
            sender: { username: ILike(`%${name}%`) },
            status: FriendshipStatus.ACCEPTED,
          },
        ],
        skip: offset,
        take: limit,
      })
    ).map((fr) => (fr.sender.id === userId ? fr.receiver : fr.sender));
  }

  async cancelPendingFriendship(
    senderId: string,
    { friendshipId: id }: FriendshipIdDto,
  ) {
    const friendship = await this.friendshipRepository.findOneBy({
      id,
      sender: { id: senderId },
      status: FriendshipStatus.PENDING,
    });
    if (!friendship) throw new BadRequestException();
    await this.friendshipRepository.delete({ id });
  }

  async rejectPendingFriendship(
    receiverId: string,
    { friendshipId: id }: FriendshipIdDto,
  ) {
    const friendship = await this.friendshipRepository.findOneBy({
      id,
      receiver: { id: receiverId },
      status: FriendshipStatus.PENDING,
    });
    if (!friendship) throw new BadRequestException();
    await this.friendshipRepository.delete({ id });
  }

  async getListOfFrienshipsByReceiver(receiverId: string) {
    return await this.friendshipRepository.find({
      where: {
        receiver: { id: receiverId },
        status: FriendshipStatus.PENDING,
      },
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }

  async getListOfFrienshipsBySender(senderId: string) {
    return await this.friendshipRepository.find({
      where: {
        sender: { id: senderId },
        status: FriendshipStatus.PENDING,
      },
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }

  async selectAllSomeoneFriends(
    myId: string,
    { userId, limit, offset }: UserFriendsDto,
  ) {
    const relation = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: myId }, receiver: { id: userId } },
        { sender: { id: userId }, receiver: { id: myId } },
      ],
    });
    if (relation && relation.status === FriendshipStatus.BLOCKED)
      throw new BadRequestException('you cannot view this user friends');

    const friends = await this.friendshipRepository
      .createQueryBuilder()
      .distinctOn(['friend'])
      .select('u.*')
      .from((sq) => {
        return sq
          .select(
            `
        CASE
          when ff.sender = :userId then ff.receiver
          else ff.sender
        END
      `,
            'friend',
          )
          .setParameter('userId', userId)
          .from(Friendship, 'ff')
          .where('ff.status = :accepted', {
            accepted: FriendshipStatus.ACCEPTED,
          })
          .andWhere(
            new Brackets((qb) => {
              qb.where(`ff.sender = :sender`, { sender: userId }).orWhere(
                'ff.receiver = :receiver',
                { receiver: userId },
              );
            }),
          );
      }, 'friend')
      .leftJoinAndMapOne(
        'friendship',
        Friendship,
        'f',
        '(f.sender = :myId1 and f.receiver = friend) or (f.receiver = :myId2 and f.sender = friend)',
        { myId1: myId, myId2: myId },
      )
      .leftJoin(User, 'u', 'u.id = friend')
      .where('friend != :my', { my: myId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('f.status is null').orWhere('f.status != :blocked', {
            blocked: FriendshipStatus.BLOCKED,
          });
        }),
      )
      .limit(limit)
      .offset(offset)
      .getRawMany();
    return friends.map((friend) => {
      const formatedFriend: any = {};
      const friendship: any = {};
      for (const [key, val] of Object.entries(friend)) {
        if (key === 'f_id' || key === 'f_status') {
          friendship[key.substring(2)] = val;
          continue;
        }
        if (!key.startsWith('f_')) formatedFriend[key] = val;
      }
      formatedFriend.friendship = friendship.id === null ? null : friendship;
      return formatedFriend;
    });
  }

  async createPendingRelationWithUsername(
    userId: string,
    { username }: FriendshipInviteUsernameDto,
  ) {
    const me = await this.userRepository.findOneBy({ id: userId });
    if (!me) throw new BadRequestException();
    const him = await this.userRepository.findOneBy({ username });
    if (!him) throw new BadRequestException('user not found with this name');
    if (him.username === me.username) {
      throw new BadRequestException('you cant invite yourself');
    }
    const fr = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: me.id }, receiver: { id: him.id } },
        { sender: { id: him.id }, receiver: { id: me.id } },
      ],
      relations: {
        sender: true,
        receiver: true,
      },
    });
    if (fr && fr.status !== FriendshipStatus.PENDING)
      throw new BadRequestException();
    if (fr && fr.status === FriendshipStatus.PENDING) return fr;
    const pending = new Friendship();
    pending.sender = me;
    pending.receiver = him;
    pending.status = FriendshipStatus.PENDING;
    const f = await this.friendshipRepository.save(pending);
    pending.id = f.id;
    return pending;
  }

  async getFriendshipBetweenTwoUsers(user1Id: string, user2Id: string) {
    return await this.friendshipRepository.findOne({
      where: [
        { sender: { id: user1Id }, receiver: { id: user2Id } },
        { sender: { id: user2Id }, receiver: { id: user1Id } },
      ],
    });
  }

  async getListOfUserBlockedOrBlockedBy(userId: string) {
    return await this.friendshipRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.BLOCKED },
        { receiver: { id: userId }, status: FriendshipStatus.BLOCKED },
      ],
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }
}
