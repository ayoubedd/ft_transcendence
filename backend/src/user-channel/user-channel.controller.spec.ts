import { Test, TestingModule } from '@nestjs/testing';
import { UserChannelController } from './user-channel.controller';
import { UserChannelService } from './user-channel.service';

describe('UserChannelController', () => {
  let controller: UserChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserChannelController],
      providers: [UserChannelService],
    }).compile();

    controller = module.get<UserChannelController>(UserChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
