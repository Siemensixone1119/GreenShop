import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { SessionsRepository } from './sessions.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
  imports: [PrismaModule],
})
export class SessionsModule {}
