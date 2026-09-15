import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { SessionsRepository } from './sessions.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CategoriesModule } from '../categories/categories.module.js';

@Module({
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
  imports: [PrismaModule, CategoriesModule],
})
export class SessionsModule {}
