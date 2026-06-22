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

@Injectable()
export class UsersService {
  constructor(private readonly userReporitory: UsersRepository) {}

  findAll(): Promise<PublicUser[]> {
    return this.userReporitory.findAll();
  }

  findByEmail(email: string): Promise<PublicUser | null> {
    if (!email.trim().length) {
      throw new BadRequestException('Email не передан');
    }

    return this.userReporitory.findByEmail(email);
  }

  async findById(id: number): Promise<PublicUser> {
    if (!id) {
      throw new BadRequestException('Id не передан');
    }

    const user = await this.userReporitory.findById(id);

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

    return this.userReporitory.create({
      email,
      passwordHash,
      name,
    });
  }

  async update(id: number, data: UpdateUserData): Promise<PublicUser> {
    const email = data.email?.trim() ?? null;
    const name = data.name?.trim() ?? null;

    if (!id) {
      throw new BadRequestException('Id не передан');
    }

    await this.findById(id);
    const updateData: UpdateUserData = {};

    if (email) {
      const existUser = await this.findByEmail(email);
      if (existUser && existUser?.id !== id) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      updateData.email = email;
    }

    if (name) {
      updateData.name = name;
    }

    return this.userReporitory.update(id, updateData);
  }

  async delete(id: number): Promise<PublicUser> {
    if (!id) {
      throw new BadRequestException('Id не передан');
    }

    await this.findById(id);

    return this.userReporitory.delete(id);
  }
}
