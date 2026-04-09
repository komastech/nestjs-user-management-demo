import { IsEmail, IsOptional, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserStatus } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}