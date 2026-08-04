import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PublicUser } from './types/public-user.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles(['ADMIN'])
  @Get()
  findAll(): Promise<PublicUser[]> {
    return this.userService.findAll();
  }

  @Roles(['ADMIN'])
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PublicUser> {
    return this.userService.findById(id);
  }
}
