import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma, Session } from '../../generated/prisma/client.js';
import type { CreateSessionData } from './types/create-session-data.type.js';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(sessionId: number): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id: sessionId } });
  }

  create(data: CreateSessionData): Promise<Session> {
    return this.prisma.session.create({ data });
  }

  revokeById(sessionId: number): Promise<Session> {
    return this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  revokeAllByUserId(userId: number): Promise<Prisma.BatchPayload> {
    return this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
