import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderProductImagesDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  @ApiProperty({
    type: [String],
    format: 'uuid',
    minItems: 2,
    maxItems: 10,
    uniqueItems: true,
    example: [
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    ],
    description: 'ID изображений в новом порядке',
  })
  imageIds!: string[];
}
