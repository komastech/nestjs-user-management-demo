import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from './mappers/user.mapper';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {},
        },
        {
          provide: UserMapper,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
