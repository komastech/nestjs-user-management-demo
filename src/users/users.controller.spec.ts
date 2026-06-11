import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the unpaginated user list for v1', async () => {
    usersService.findAll.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findAllV1()).resolves.toEqual([{ id: 1 }]);
    expect(usersService.findAll).toHaveBeenCalledWith();
  });

  it('returns the paginated user list for v2', async () => {
    const query = { search: 'ada', page: 2, limit: 5 };
    const response = {
      data: [{ id: 1 }],
      meta: { total: 1, page: 2, limit: 5, totalPages: 1 },
    };
    usersService.findAllPaginated.mockResolvedValue(response);

    await expect(controller.findAllV2(query)).resolves.toEqual(response);
    expect(usersService.findAllPaginated).toHaveBeenCalledWith(query);
  });
});
