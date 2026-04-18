import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindUsersDto } from '../dto/find-users.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(payload: Partial<User>) {
    return this.repository.create(payload);
  }

  save(user: User) {
    return this.repository.save(user);
  }

  remove(user: User) {
    return this.repository.remove(user);
  }

  findById(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  async findMany(query: FindUsersDto) {
    const { search, page = 1, limit = 10 } = query;
    const queryBuilder = this.repository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit).orderBy('user.id', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();

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
}
