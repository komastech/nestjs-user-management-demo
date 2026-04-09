import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUsersDto } from '../dto/find-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  private logger = new Logger(UsersService.name);
  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user ${dto.email}`);
    const email = dto.email.toLowerCase();

    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    const user = this.repo.create({ ...dto, email });
    return this.repo.save(user);
  }

  async findAll(query: FindUsersDto) {
    const { search, page = 1, limit = 10 } = query;

    const qb = this.repo.createQueryBuilder('user');

    if (search) {
      qb.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit).orderBy('user.id', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.email) {
      const email = dto.email.toLowerCase();
      const existing = await this.repo.findOne({ where: { email } });
      if (existing && existing.id !== id) throw new BadRequestException('Email already exists');
      dto.email = email;
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return;
  }
}
