import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums.js';

export class PublicUserResponseDto {
  @ApiProperty({
    example: '00000000-0000-4000-8000-000000000001',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'user@greenshop.test',
    format: 'email',
  })
  email!: string;

  @ApiProperty({ example: 'Александра' })
  name!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({
    example: '2026-10-05T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-10-05T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
