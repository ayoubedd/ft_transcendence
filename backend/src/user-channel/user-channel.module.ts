import { Module, forwardRef } from '@nestjs/common';
import { UserChannelService } from './user-channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChannel } from './entities/user-channel.entity';
import { Channel } from '@/channel/entities/channel.entity';
import { ChannelModule } from '@/channel/channel.module';
import { User } from '@/users/entities/user.entity';
import { FriendshipModule } from '@/friendship/friendship.module';

@Module({
  imports: [
    forwardRef(() => ChannelModule),
    TypeOrmModule.forFeature([UserChannel, Channel, User]),
    FriendshipModule,
  ],
  exports: [TypeOrmModule, UserChannelService], // for outside usage
  providers: [UserChannelService],
})
export class UserChannelModule {}
