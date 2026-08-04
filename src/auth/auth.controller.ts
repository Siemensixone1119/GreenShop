import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/register.dto.js';
import { type Request, type Response } from 'express';
import { LoginUserDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { PublicUser } from '../users/types/public-user.type.js';
import { CurrentUser } from './decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: PublicUser }> {
    const result = await this.authService.register(body);

    this.setAuthCookie(
      response,
      result.accessToken,
      result.refreshToken,
      result.sessionId,
    );

    return {
      user: result.user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: PublicUser }> {
    const result = await this.authService.login(body);

    this.setAuthCookie(
      response,
      result.accessToken,
      result.refreshToken,
      result.sessionId,
    );

    return {
      user: result.user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: PublicUser }> {
    const result = await this.authService.refresh({ cookies: request.cookies });
    this.setAuthCookie(
      response,
      result.accessToken,
      result.refreshToken,
      result.sessionId,
    );
    return {
      user: result.user,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout({ cookies: request.cookies });
    this.clearCookie(response);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout-all')
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logoutAll({ cookies: request.cookies });
    this.clearCookie(response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  me(@CurrentUser() user: PublicUser): { user: PublicUser } {
    return { user };
  }

  private setAuthCookie(
    response: Response,
    accessToken: string,
    refreshToken: string,
    sessionId: number,
  ): void {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    response.cookie('sessionId', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookie(response: Response): void {
    response.clearCookie('accessToken', {
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: true,
    });
    response.clearCookie('refreshToken', {
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: true,
    });
    response.clearCookie('sessionId', {
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: true,
    });
  }
}
