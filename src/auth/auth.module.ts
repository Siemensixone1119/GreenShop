import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtStrategy } from './strategy/jwt.strategy.js';

const jwtSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_ACCESS_SECRET не задан в .env');
}

@Module({
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  imports: [
    UsersModule,
    SessionsModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
})
export class AuthModule {}
