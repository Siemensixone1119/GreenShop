import { ApiProperty } from '@nestjs/swagger';
import { PublicUserResponseDto } from '../../users/dto/public-user-response.dto.js';

export class AuthUserResponseDto {
  @ApiProperty({
    type: () => PublicUserResponseDto,
  })
  user!: PublicUserResponseDto;
}
