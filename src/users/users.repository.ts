import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserData } from './types/create-user-data.type.js';
import { UpdateUserData } from './types/update-user-data.type.js';
import { PublicUser } from './types/public-user.type.js';
import { AuthUser } from './types/auth-user-data.type.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly publicUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: this.publicUserSelect,
    });
  }

  findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { email: email },
      select: this.publicUserSelect,
    });
  }

  findAuthByEmail(email: string): Promise<AuthUser | null>{
    return this.prisma.user.findUnique(
      { where: {
          email
        },
        select : {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          passwordHash: true
        }
      }
    )
  }

  findById(id: number): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.publicUserSelect,
    });
  }

  async create(data: CreateUserData): Promise<PublicUser> {
    return this.prisma.user.create({
      data,
      select: this.publicUserSelect,
    });
  }

  update(id: number, data: UpdateUserData): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.publicUserSelect,
    });
  }

  delete(id: number): Promise<PublicUser> {
    return this.prisma.user.delete({
      where: { id },
      select: this.publicUserSelect,
    });
  }
}
