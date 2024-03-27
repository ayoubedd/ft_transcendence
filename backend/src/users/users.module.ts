import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersGateway } from './users.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Friendship } from '@/friendship/entities/friendship.entity';
import { FriendshipModule } from '@/friendship/friendship.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship]),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => FriendshipModule),
  ],

  exports: [TypeOrmModule, UsersService, UsersGateway], // for usage outside
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
})
export class UsersModule {}
