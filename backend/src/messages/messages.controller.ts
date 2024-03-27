import { RequestWithUser } from '@/utils/request-with-logged-user';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesListDto } from './dto/messages-list.dto';
import { ListOfMessagesResponse, MessagesService } from './messages.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { TwoFaGuard } from '@/auth/2fa.guard';
import { SeenMessageDto } from './dto/seen-message.dto';
import { SendMessageToUserDto } from './dto/send-message-to-user.dto';

@Controller('messages')
@UseGuards(TwoFaGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiOkResponse({
    type: ListOfMessagesResponse,
    isArray: true,
  })
  @Get()
  messages(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) messagesListDto: MessagesListDto,
  ) {
    messagesListDto.userId = req.user.userId;
    return this.messagesService.getListOfMessagesInChannel(messagesListDto);
  }

  @ApiCreatedResponse({
    type: Message,
  })
  @ApiBadRequestResponse()
  @Post()
  message(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) { channelId, message, socketId }: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(
      req.user.userId,
      channelId,
      message,
      socketId,
    );
  }

  @ApiCreatedResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Post('seen')
  read(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) readMessageDto: SeenMessageDto,
  ) {
    return this.messagesService.updateMessageWithRead(
      req.user.userId,
      readMessageDto.messageId,
    );
  }

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @Post('user')
  sendMessageToUser(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) { message, socketId, userId }: SendMessageToUserDto,
  ) {
    return this.messagesService.sendMessageToUser(
      req.user.userId,
      userId,
      message,
      socketId,
    );
  }
}
