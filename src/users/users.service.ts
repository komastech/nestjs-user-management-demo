import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    const user = this.repo.create({ ...dto, email });
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
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