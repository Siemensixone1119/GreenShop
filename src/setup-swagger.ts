import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, getSchemaPath, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { ErrorResponseDto } from './common/dto/error-response.dto.js';

function addErrorResponseSchemas(document: OpenAPIObject): void {
  const httpMethods = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
  ] as const;

  for (const path of Object.values(document.paths)) {
    if (!path) continue;

    for (const method of httpMethods) {
      const operation = path[method];
      if (!operation) continue;

      for (const [statusCode, response] of Object.entries(
        operation.responses,
      )) {
        if (!response) continue;

        if (!statusCode.startsWith('4') && !statusCode.startsWith('5')) {
          continue;
        }

        if ('$ref' in response) continue;

        response.content = {
          ...response.content,
          'application/json': {
            schema: { $ref: getSchemaPath(ErrorResponseDto) },
          },
        };
      }
    }
  }
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('GreenShop API')
    .setDescription('API интернет-магазина декоративных растений')
    .setVersion('1.0')
    .addCookieAuth('accessToken', { type: 'apiKey' }, 'accessToken')
    .addCookieAuth('refreshToken', { type: 'apiKey' }, 'refreshToken')
    .addCookieAuth('sessionId', { type: 'apiKey' }, 'sessionId')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ErrorResponseDto],
  });

  addErrorResponseSchemas(document);

  SwaggerModule.setup('docs', app, document);
}
