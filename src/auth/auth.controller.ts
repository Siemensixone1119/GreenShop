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
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserResponseDto } from './dto/auth-user-response.dto.js';

@ApiTags('Auth')
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly isProduction = process.env.NODE_ENV === 'production';

  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({
    description: 'Пользователь успешно зарегистрирован',
    type: AuthUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные или пароли не совпадают',
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
  })
  @ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
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
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  @ApiOperation({ summary: 'Вход в аккаунт' })
  @ApiOkResponse({
    description: 'Вход выполнен успешно',
    type: AuthUserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные для входа' })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  @ApiTooManyRequestsResponse({ description: 'Превышен лимит попыток входа' })
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

  @ApiCookieAuth('refreshToken')
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
    type: AuthUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия или refresh token недействительны',
  })
  @ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 20,
      ttl: 60_000,
    },
  })
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

  @ApiCookieAuth('refreshToken')
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Завершение текущей сессии' })
  @ApiNoContentResponse({ description: 'Текущая сессия завершена' })
  @ApiUnauthorizedResponse({ description: 'Нет действительной сессии' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout({ cookies: request.cookies });
    this.clearCookie(response);
  }

  @ApiCookieAuth('refreshToken')
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Завершение всех сессий пользователя' })
  @ApiNoContentResponse({ description: 'Все сессии пользователя завершены' })
  @ApiUnauthorizedResponse({ description: 'Нет действительной сессии' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout-all')
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logoutAll({ cookies: request.cookies });
    this.clearCookie(response);
  }

  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Получение текущего пользователя' })
  @ApiOkResponse({
    description: 'Текущий пользователь',
    type: AuthUserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
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
    sessionId: string,
  ): void {
    response.cookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    response.cookie('sessionId', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookie(response: Response): void {
    response.clearCookie('accessToken', {
      path: '/',
      sameSite: 'lax',
      secure: this.isProduction,
      httpOnly: true,
    });
    response.clearCookie('refreshToken', {
      path: '/',
      sameSite: 'lax',
      secure: this.isProduction,
      httpOnly: true,
    });
    response.clearCookie('sessionId', {
      path: '/',
      sameSite: 'lax',
      secure: this.isProduction,
      httpOnly: true,
    });
  }
}
