import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel-dto';
import { SearchChannelDto } from './dto/search-channel-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Channel, ChannelType } from '@/channel/entities/channel.entity';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { GetOneChannelDto } from './dto/get-one-channel-dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import {
  UserChannel,
  UserChannelStatus,
} from '@/user-channel/entities/user-channel.entity';

export class ChannelResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: ChannelType,
  })
  type: ChannelType;
}

export class SearchChannelResponse extends ChannelResponse {
  @ApiProperty()
  isJoined: boolean;
}

export class UpdateChannelResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: ChannelType,
  })
  type: ChannelType;

  @ApiProperty()
  isDM: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  async createChannel(
    { name, type, password }: CreateChannelDto,
    ownerId: string,
    isDm: boolean,
  ): Promise<ChannelResponse> {
    const channel = new Channel();

    if (type !== ChannelType.PUBLIC && password === undefined)
      throw new BadRequestException(
        'protected and private channels need to have a password',
      );
    channel.name = name;
    channel.type = type;
    channel.password = password;
    channel.createdBy = new User();
    channel.createdBy.id = ownerId;
    channel.isDM = isDm;

    try {
      const res = await this.channelRepository.save(channel);
      return { id: res.id, name, type };
    } catch (e) {
      throw new BadRequestException('name already taken');
    }
  }

  async searchChannel(
    userId: string,
    { name, limit, offset }: SearchChannelDto,
  ) {
    const channels = (await this.channelRepository
      .createQueryBuilder('c')
      .leftJoin(
        UserChannel,
        'uc',
        'c.id = uc.channel_id AND uc.user_id = :userId',
        { userId },
      )
      .where('c.type != :type', { type: ChannelType.PRIVATE })
      .andWhere('c."isDM" != true')
      .andWhere('c.name ILIKE :name', { name: `%${name}%` })
      .andWhere(
        new Brackets((qb) => {
          return qb.where('uc.id IS NULL').orWhere('uc.status != :banned', {
            banned: UserChannelStatus.BANNED,
          });
        }),
      )
      .select(['c.id AS id', 'c.name AS name', 'c.type AS type'])
      .addSelect(
        'CASE WHEN uc.status IS NULL OR uc.status != :accepted THEN false ELSE true END',
        'isJoined',
      )
      .setParameter('accepted', UserChannelStatus.ACCEPTED)
      .limit(limit)
      .offset(offset)
      .printSql()
      .getRawMany()) as SearchChannelResponse[];
    return channels;
  }

  async getOneChannelWithId({ id }: GetOneChannelDto) {
    const channel = await this.channelRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();
    if (!channel)
      throw new NotFoundException(
        'channel with the provided id does not exist',
      );
    return channel;
  }

  async updateChannel({ name, type, password, channelId }: UpdateChannelDto) {
    try {
      return (
        await this.channelRepository
          .createQueryBuilder()
          .update()
          .set({
            name,
            type,
            password,
          })
          .where('id = :channelId', { channelId })
          .returning('id, name, type, "isDM", "createdAt", "updatedAt"')
          .execute()
      ).raw[0];
    } catch (e) {
      throw new BadRequestException('could not save new channel data');
    }
  }

  async createDmChannel() {
    const channel = new Channel();
    channel.isDM = true;
    channel.type = ChannelType.PRIVATE;
    return await this.channelRepository.save(channel);
  }
}
