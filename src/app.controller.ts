import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

@ApiTags('Application')
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка работы API' })
  @ApiOkResponse({ description: 'API работает', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
