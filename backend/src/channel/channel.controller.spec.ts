import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from './channels.controller';
import { ChannelService } from './channels.service';

describe('ChannelsController', () => {
  let controller: ChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [ChannelService],
    }).compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
