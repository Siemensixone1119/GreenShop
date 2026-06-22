import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SessionsRepository } from './sessions.repository.js';

@Module({
  providers: [SessionsService, PrismaService, SessionsRepository],
})
export class SessionsModule {}
