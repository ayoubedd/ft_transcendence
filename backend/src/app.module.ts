import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FriendshipModule } from './friendship/friendship.module';
import { ChannelModule } from './channel/channel.module';
import { UserChannelModule } from './user-channel/user-channel.module';
import { GamesModule } from './games/games.module';
import { MessagesModule } from './messages/messages.module';
import { User } from '@/users/entities/user.entity';
import { Friendship } from '@/friendship/entities/friendship.entity';
import { Channel } from '@/channel/entities/channel.entity';
import { Game } from './games/entities/game.entity';
import { Message } from './messages/entities/message.entity';
import { UserChannel } from './user-channel/entities/user-channel.entity';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.getOrThrow('DB_HOST'),
          port: config.getOrThrow('DB_PORT'),
          username: config.getOrThrow('POSTGRES_USER'),
          password: config.getOrThrow('POSTGRES_PASSWORD'),
          database: config.getOrThrow('POSTGRES_DB'),
          entities: [User, Channel, Friendship, Game, Message, UserChannel],
          synchronize: true,
          logging: true,
        };
      },
    }),
    UsersModule,
    ChannelModule,
    FriendshipModule,
    MessagesModule,
    GamesModule,
    UserChannelModule,
    AuthModule,

    MulterModule.register(),
  ],
})
export class AppModule {}
