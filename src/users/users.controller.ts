import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PublicUser } from './types/public-user.type.js';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(): Promise<PublicUser[]> {
    return this.userService.findAll();
  }
}
