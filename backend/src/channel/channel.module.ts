import { Module, forwardRef } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { UserChannelModule } from '@/user-channel/user-channel.module';
import { MessagesModule } from '@/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    MessagesModule,
    forwardRef(() => UserChannelModule),
  ],
  exports: [TypeOrmModule, ChannelService], // for usage outside
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
