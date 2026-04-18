import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUsersDto } from '../dto/find-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userMapper: UserMapper,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user ${dto.email}`);
    const email = dto.email.toLowerCase();

    const existing = await this.usersRepository.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const user = this.usersRepository.create({ ...dto, email });
    const savedUser = await this.usersRepository.save(user);

    return this.userMapper.toResponse(savedUser);
  }

  async findAll(query: FindUsersDto) {
    const { data, meta } = await this.usersRepository.findMany(query);

    return {
      data: this.userMapper.toResponseList(data),
      meta,
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return this.userMapper.toResponse(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (dto.email) {
      const email = dto.email.toLowerCase();
      const existing = await this.usersRepository.findByEmail(email);
      if (existing && existing.id !== id) throw new BadRequestException('Email already exists');
      dto.email = email;
    }

    Object.assign(user, dto);
    const updatedUser = await this.usersRepository.save(user);

    return this.userMapper.toResponse(updatedUser);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    await this.usersRepository.remove(user);
    return;
  }
}
