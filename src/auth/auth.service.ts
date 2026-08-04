import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import type { RegisterUserDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { SessionsService } from '../sessions/sessions.service.js';
import { randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import type { PublicUser } from '../users/types/public-user.type.js';
import { LoginUserDto } from './dto/login.dto.js';
import type { RefreshCookie } from './types/refresh-cookie-data.type.js';
import type { AuthResult } from './types/auth-result.type.js';
import type { IssuedTokens } from './types/issued-tokens.type.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
    private readonly jwtService: JwtService,
  ) {}
  async register(data: RegisterUserDto): Promise<AuthResult> {
    if (data.password !== data.passwordRepeat) {
      throw new BadRequestException('Пароли не совпадают');
    }

    const passwordHash = await this.hashString(data.password);
    const user = await this.userService.create({
      email: data.email,
      passwordHash,
      name: data.name,
    });

    const tokens = await this.issueTokens(user);

    return {
      user,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      sessionId: tokens.sessionId,
    };
  }

  async login(data: LoginUserDto): Promise<AuthResult> {
    const user = await this.userService.findAuthByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const validPassword = await this.compareHash(
      data.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const tokens = await this.issueTokens(publicUser);

    return {
      user: publicUser,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      sessionId: tokens.sessionId,
    };
  }

  async refresh(data: RefreshCookie): Promise<AuthResult> {
    const refreshToken = data.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Не авторизован');
    }

    const sessionId = Number(data.cookies.sessionId);
    if (!sessionId || !Number.isInteger(sessionId) || sessionId <= 0) {
      throw new UnauthorizedException('Не авторизован');
    }

    const session = await this.sessionService.findActiveById(sessionId);
    if (!session) {
      throw new UnauthorizedException('Не авторизован');
    }

    const validRefreshToken = await this.compareHash(
      refreshToken,
      session.refreshHash,
    );
    if (!validRefreshToken) {
      await this.sessionService.revokeById(sessionId);
      throw new UnauthorizedException('Не авторизован');
    }

    const user = await this.userService.findById(session.userId);
    if (!user) {
      await this.sessionService.revokeById(sessionId);
      throw new UnauthorizedException('Не авторизован');
    }

    await this.sessionService.revokeById(sessionId);
    const tokens = await this.issueTokens(user);

    return {
      user,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      sessionId: tokens.sessionId,
    };
  }

  async logout(data: RefreshCookie): Promise<void> {
    const refreshToken = data.cookies.refreshToken;
    if (!refreshToken) {
      return;
    }

    const sessionId = Number(data.cookies.sessionId);
    if (!sessionId || !Number.isInteger(sessionId) || sessionId <= 0) {
      return;
    }

    const session = await this.sessionService.findActiveById(sessionId);
    if (!session) {
      return;
    }

    const validRefreshToken = await this.compareHash(
      refreshToken,
      session.refreshHash,
    );
    if (!validRefreshToken) {
      return;
    }

    await this.sessionService.revokeById(sessionId);
  }

  async logoutAll(data: RefreshCookie): Promise<void> {
    const refreshToken = data.cookies.refreshToken;
    if (!refreshToken) {
      return;
    }

    const sessionId = Number(data.cookies.sessionId);
    if (!sessionId || !Number.isInteger(sessionId) || sessionId <= 0) {
      return;
    }

    const session = await this.sessionService.findActiveById(sessionId);
    if (!session) {
      return;
    }

    const validRefreshToken = await this.compareHash(
      refreshToken,
      session.refreshHash,
    );
    if (!validRefreshToken) {
      return;
    }

    await this.sessionService.revokeAllByUserId(session.userId);
  }

  private hashString(string: string): Promise<string> {
    return bcrypt.hash(string, 10);
  }

  private compareHash(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  private async issueTokens(user: PublicUser): Promise<IssuedTokens> {
    const refreshToken = this.generateRefreshToken();
    const refreshHash = await this.hashString(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const session = await this.sessionService.createSession({
      userId: user.id,
      refreshHash,
      expiresAt,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      sessionId: session.id,
      role: user.role,
    });

    return {
      sessionId: session.id,
      refreshToken,
      accessToken,
    };
  }
}
