import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PublicUser } from './types/public-user.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PublicUserResponseDto } from './dto/public-user-response.dto.js';

@ApiCookieAuth('accessToken')
@ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
@ApiForbiddenResponse({ description: 'Недостаточно прав' })
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Получение списка пользователей' })
  @ApiOkResponse({
    description: 'Список пользователей',
    type: [PublicUserResponseDto],
  })
  @Get()
  findAll(): Promise<PublicUser[]> {
    return this.userService.findAll();
  }

  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Получение пользователя по id' })
  @ApiOkResponse({
    description: 'Пользователь найден',
    type: PublicUserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный id' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  @Get(':userId')
  findOne(@Param('userId', ParseUUIDPipe) userId: string): Promise<PublicUser> {
    return this.userService.findById(userId);
  }
}
