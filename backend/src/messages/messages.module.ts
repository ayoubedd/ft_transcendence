import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from '@/messages/entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChannel } from '@/user-channel/entities/user-channel.entity';
import { MessagesController } from './messages.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserChannelModule } from '@/user-channel/user-channel.module';
import { FriendshipModule } from '@/friendship/friendship.module';
import { UsersModule } from '@/users/users.module';
import { Channel } from '@/channel/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Channel, UserChannel]),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UserChannelModule,
    FriendshipModule,
    UsersModule,
  ],
  exports: [TypeOrmModule, MessagesService], // for usage outside
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
})
export class MessagesModule {}
