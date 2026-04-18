import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserMapper {
  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toResponseList(users: User[]) {
    return users.map((user) => this.toResponse(user));
  }
}
