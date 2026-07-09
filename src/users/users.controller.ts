import { Body, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PublicUser } from './types/public-user.type.js';
import { CreateUserData } from './types/create-user-data.type.js';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(): Promise<PublicUser[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PublicUser> {
    return await this.userService.findById(id)
  }
}
