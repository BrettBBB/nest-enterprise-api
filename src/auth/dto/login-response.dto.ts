import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { accessTokenExample, loginResponseExample } from './auth.examples.js';

export class LoginResponseDto {
  @ApiProperty({ example: accessTokenExample })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto, example: loginResponseExample.user })
  user: UserResponseDto;
}
