import { Controller } from '@nestjs/common';
import { UserChannelService } from './user-channel.service';

@Controller('user-channel')
export class UserChannelController {
  constructor(private readonly userChannelService: UserChannelService) {}
}
