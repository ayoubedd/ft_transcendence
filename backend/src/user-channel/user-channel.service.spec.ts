import { Test, TestingModule } from '@nestjs/testing';
import { UserChannelService } from './user-channel.service';

describe('UserChannelService', () => {
  let service: UserChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserChannelService],
    }).compile();

    service = module.get<UserChannelService>(UserChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
