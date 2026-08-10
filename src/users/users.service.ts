import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { CreateUserData } from './types/create-user-data.type.js';
import { UpdateUserData } from './types/update-user-data.type.js';
import { PublicUser } from './types/public-user.type.js';
import { AuthUser } from './types/auth-user-data.type.js';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  findAll(): Promise<PublicUser[]> {
    return this.userRepository.findAll();
  }

  findByEmail(email: string): Promise<PublicUser | null> {
    if (!email.trim().length) {
      throw new BadRequestException('Email не передан');
    }

    return this.userRepository.findByEmail(email);
  }

  findAuthByEmail(email: string): Promise<AuthUser | null> {
    if (!email.trim().length) {
      throw new BadRequestException('Email не передан');
    }

    return this.userRepository.findAuthByEmail(email);
  }

  async findById(userId: number): Promise<PublicUser> {
    if (userId <= 0) {
      throw new BadRequestException('Id не передан');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Пользователь с таким Id не найден');
    }

    return user;
  }

  async create(data: CreateUserData): Promise<PublicUser> {
    const email = data.email.trim();
    const name = data.name.trim();
    const passwordHash = data.passwordHash.trim();

    if (!email.length) {
      throw new BadRequestException('Email не передан');
    }

    if (!passwordHash.length) {
      throw new BadRequestException('Хеш пароля не передан');
    }

    if (!name.length) {
      throw new BadRequestException('Имя не передано');
    }

    const existUser = await this.findByEmail(email);

    if (existUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    return this.userRepository.create({
      email,
      passwordHash,
      name,
    });
  }

  async update(userId: number, data: UpdateUserData): Promise<PublicUser> {
    const email = data.email?.trim() ?? null;
    const name = data.name?.trim() ?? null;

    if (userId <= 0) {
      throw new BadRequestException('Id не передан');
    }

    await this.findById(userId);
    const updateData: UpdateUserData = {};

    if (email) {
      const existUser = await this.findByEmail(email);
      if (existUser && existUser.id !== userId) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      updateData.email = email;
    }

    if (name) {
      updateData.name = name;
    }

    return this.userRepository.update(userId, updateData);
  }

  async delete(userId: number): Promise<PublicUser> {
    if (userId <= 0) {
      throw new BadRequestException('Id не передан');
    }

    await this.findById(userId);

    return this.userRepository.delete(userId);
  }
}
