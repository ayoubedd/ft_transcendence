import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
} from '@nestjs/common';
import {
  GetListOfUsersOrderdByLpResponse,
  UserSearchResult,
  UsersService,
} from './users.service';
import { RequestWithUser } from '@/utils/request-with-logged-user';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { SearchUserQueryDto } from './dto/search-user-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { ProfileUserDto } from './dto/profile-user-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadAvatarDto } from './dto/upload-avatar-dto';
import { TwoFaGuard } from '@/auth/2fa.guard';

@Controller('users')
@UseGuards(TwoFaGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'user not found in the database',
  })
  me(@Req() req: RequestWithUser) {
    return this.usersService.selectOneStatusById(req.user.userId);
  }

  @Get('search')
  @ApiOkResponse({
    type: UserSearchResult,
    isArray: true,
  })
  search(
    @Query(ValidationPipe) searchUserQueryDto: SearchUserQueryDto,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.findManyByUsername(
      searchUserQueryDto,
      req.user.userId,
    );
  }

  @Post('settings')
  @ApiCreatedResponse({
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'at least one property is required',
  })
  settings(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  @Get('profile')
  @ApiOkResponse({
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'no user visibale user to you with following id',
  })
  profile(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) profileUserDto: ProfileUserDto,
  ) {
    return this.usersService.findOneByIdWithFriendship(
      req.user.userId,
      profileUserDto.id,
    );
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadAvatarDto,
  })
  @ApiCreatedResponse({
    type: User,
  })
  @ApiBadRequestResponse()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: '/upload/public',
        filename: (req: any, _: Express.Multer.File, cb) => {
          const now = new Date();
          cb(
            null,
            `${req.user.username}-${now.getFullYear().toString()}-${now
              .getDate()
              .toString()}-${(now.getMonth() + 1).toString()}-${now
              .getHours()
              .toString()}-${now.getMinutes().toString()}-${now
              .getSeconds()
              .toString()}.jpeg`,
          );
        },
      }),
    }),
  )
  avatar(
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1000 * 1000 }),
          new FileTypeValidator({
            fileType: /(gif|jpe?g|tiff?|png|webp|bmp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.updateUser(req.user.userId, {
      avatar: `/public/${file.filename}`,
    });
  }

  @ApiOkResponse({
    type: GetListOfUsersOrderdByLpResponse,
    isArray: true,
    description:
      'NOTE: the sender and receiver in the friendship field are uuids not objects',
  })
  @Get('leaderboard')
  leaderboard(@Req() req: RequestWithUser) {
    return this.usersService.getListOfUsersOrderdByLp(req.user.userId);
  }

  // add get profile by username
  @Get('profile/:username')
  @ApiOkResponse({
    type: UserSearchResult,
  })
  @ApiNotFoundResponse({
    description: 'no user visible to you with following username',
  })
  profileByUsername(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
  ) {
    return this.usersService.findOneByUsernameWithFriendship(
      req.user.userId,
      username,
    );
  }
}
