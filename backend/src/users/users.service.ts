import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserStatus } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  Friendship,
  FriendshipStatus,
} from '@/friendship/entities/friendship.entity';
import { SearchUserQueryDto } from './dto/search-user-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { ApiProperty } from '@nestjs/swagger';
import { FriendshipWithoutJoins } from '@/friendship/friendship.service';
import { WsException } from '@nestjs/websockets';

export interface CreateUserDetails {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  bio?: string;
  avatar: string;
  pub: boolean;
}

export class UserSearchResult extends User {
  @ApiProperty({ nullable: true })
  friendship: FriendshipWithoutJoins;
}

export class GetListOfUsersOrderdByLpResponse extends User {
  @ApiProperty()
  friendship: Friendship;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  async selectOneStatusById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findOrCreate({
    username,
    firstname,
    lastname,
    email,
    bio,
    avatar,
    pub,
  }: CreateUserDetails) {
    let user = await this.userRepository.findOneBy({ email });
    if (user) return user;
    user = this.userRepository.create({
      username,
      firstname,
      lastname,
      email,
      bio,
      avatar,
      pub,
    });
    await this.userRepository.save(user);
    return user;
  }

  async findManyByUsername(
    { username, limit, offset }: SearchUserQueryDto,
    callerId: string,
  ) {
    return await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.friendship',
        Friendship,
        'f',
        'f.sender = u.id AND f.receiver = :userId1 OR f.receiver = u.id AND f.sender = :userId2',
        {
          userId1: callerId,
          userId2: callerId,
        },
      )
      .where('u.username ilike :username', { username: `%${username}%` })
      .andWhere(`f.status IS NULL`)
      .orWhere(`f.status != 'BLOCKED'`)
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      await this.userRepository.update({ id: userId }, { ...updateUserDto });
    } catch (e) {
      throw new BadRequestException('could not updte user data');
    }
    return this.userRepository.findOneBy({ id: userId });
  }

  async findOneById(myUserId: string, hisUserId: string) {
    const relation = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: myUserId }, receiver: { id: hisUserId } },
        { sender: { id: hisUserId }, receiver: { id: myUserId } },
      ],
    });
    if (relation && relation.status === FriendshipStatus.BLOCKED)
      throw new NotFoundException();
    const user = await this.userRepository.findOneBy({ id: hisUserId });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findOneByUsername(myUserId: string, username: string) {
    const relation = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: myUserId }, receiver: { username } },
        { sender: { username }, receiver: { id: myUserId } },
      ],
    });
    if (relation && relation.status === FriendshipStatus.BLOCKED)
      throw new NotFoundException();
    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async updateUsersWithWinAndLose(winnerId: string, looserId: string) {
    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({
        wins: () => 'wins + 1',
        lp: () => 'lp + 1',
        level: () => 'level + 1',
      })
      .where('id = :winnerId', { winnerId })
      .execute();

    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ losses: () => 'wins + 1', lp: () => 'lp - 1' })
      .where('id = :looserId', { looserId })
      .execute();
  }

  async turnOnTowFa(id: string) {
    await this.userRepository.save({ id, '2FA': true });
  }

  async getListOfUsersOrderdByLp(userId: string) {
    return await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.friendship',
        Friendship,
        'f',
        'f.sender = u.id AND f.receiver = :userId1 OR f.receiver = u.id AND f.sender = :userId2',
        {
          userId1: userId,
          userId2: userId,
        },
      )
      .where(
        new Brackets((qb) => {
          qb.where('f.status is NULL').orWhere('f.status != :blocked', {
            blocked: FriendshipStatus.BLOCKED,
          });
        }),
      )
      .orderBy('u.lp', 'DESC')
      .getMany();
  }

  async setUserStatus(userId: string, status: UserStatus) {
    try {
      await this.userRepository.save({ id: userId, status });
      return await this.userRepository.findOneBy({ id: userId });
    } catch (e) {
      throw new WsException('user not found');
    }
  }

  async setUserTwoFaSecret(id: string, twoFaSecret: string) {
    try {
      await this.userRepository.save({ id, twoFaSecret });
    } catch {
      throw new NotFoundException('user not found');
    }
  }

  async getUserByIdWithSecrete(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        '2FA': true,
        email: true,
        firstname: true,
        lastname: true,
        username: true,
        id: true,
        twoFaSecret: true,
      },
    });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findOneByIdWithFriendship(myUserId: string, hisUserId: string) {
    const relation = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: myUserId }, receiver: { id: hisUserId } },
        { sender: { id: hisUserId }, receiver: { id: myUserId } },
      ],
    });
    if (relation && relation.status === FriendshipStatus.BLOCKED)
      throw new NotFoundException();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndMapOne(
        'user.friendship',
        Friendship,
        'f',
        'f.sender = :myUserId1 and f.receiver = :hisUserId1 or f.receiver = :myUserId2 and f.sender = :hisUserId2',
        {
          myUserId1: myUserId,
          myUserId2: myUserId,
          hisUserId1: hisUserId,
          hisUserId2: hisUserId,
        },
      )
      .where('user.id = :hisUserId', { hisUserId })
      .printSql()
      .getOne();
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findOneByUsernameWithFriendship(myUserId: string, username: string) {
    const relation = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: myUserId }, receiver: { username } },
        { sender: { username }, receiver: { id: myUserId } },
      ],
    });
    if (relation && relation.status === FriendshipStatus.BLOCKED)
      throw new NotFoundException();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndMapOne(
        'user.friendship',
        Friendship,
        'f',
        'f.sender = :myUserId1 and f.receiver = user.id or f.receiver = :myUserId2 and f.sender = user.id',
        {
          myUserId1: myUserId,
          myUserId2: myUserId,
        },
      )
      .where('user.username = :username', { username })
      .getOne();
    if (!user) throw new NotFoundException('user not found');
    return user;
  }
}
