import { BadRequestException, Injectable } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository.js';
import type { CreateSessionData } from './types/create-session-data.type.js';
import type { Session } from '../../generated/prisma/client.js';
import type { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionRepository: SessionsRepository) {}
  createSession(data: CreateSessionData): Promise<Session> {
    const userId = data.userId ?? null;
    const refreshHash = data.refreshHash?.trim() ?? null;
    const expiresAt = data.expiresAt ?? null;

    if (!userId || userId <= 0) {
      throw new BadRequestException('id пользователя не передан');
    }

    if (!refreshHash) {
      throw new BadRequestException('refreshHash не передан');
    }

    if (!expiresAt) {
      throw new BadRequestException('expires_at пользователя не передан');
    }

    if (expiresAt <= new Date()) {
      throw new BadRequestException('Некорректный expires_at');
    }

    return this.sessionRepository.create({
      userId,
      refreshHash,
      expiresAt,
    });
  }

  findById(sessionId: number): Promise<Session | null> {
    if (!sessionId || sessionId <= 0) {
      throw new BadRequestException('id сессии не передан');
    }

    return this.sessionRepository.findById(sessionId);
  }

  async findActiveById(sessionId: number): Promise<Session | null> {
    if (!sessionId || sessionId <= 0) {
      throw new BadRequestException('id сессии не передан');
    }

    const session = await this.sessionRepository.findById(sessionId);

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null;
    }

    return session;
  }

  revokeById(sessionId: number): Promise<Session> {
    if (!sessionId || sessionId <= 0) {
      throw new BadRequestException('id сессии не передан');
    }

    return this.sessionRepository.revokeById(sessionId);
  }

  revokeAllByUserId(userId: number): Promise<Prisma.BatchPayload> {
    if (!userId || userId <= 0) {
      throw new BadRequestException('id пользователя не передан');
    }

    return this.sessionRepository.revokeAllByUserId(userId);
  }
}
