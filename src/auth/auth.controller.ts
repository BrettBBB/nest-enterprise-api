import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { createUserExample } from '../users/dto/user.examples.js';
import type { AccessTokenPayload } from './access-token.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { loginExample, loginResponseExample } from './dto/auth.examples.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create an account and receive an access token' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      sample: {
        summary: 'Sample registration',
        description: 'Create the sample user and sign in.',
        value: createUserExample,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The account was created and a token was issued.',
    type: LoginResponseDto,
    example: loginResponseExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation failed.',
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: createUserDto.password,
      age: createUserDto.age,
    });
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({
    type: LoginDto,
    examples: {
      sample: {
        summary: 'Sample login',
        description: 'Sign in as the sample user.',
        value: loginExample,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The credentials matched a user and a token was issued.',
    type: LoginResponseDto,
    example: loginResponseExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation failed.',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read the claims from the current access token' })
  @ApiResponse({
    status: 200,
    description: 'The token was valid.',
    schema: {
      example: {
        sub: loginResponseExample.user.id,
        email: loginResponseExample.user.email,
        isAdmin: loginResponseExample.user.isAdmin,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  me(@CurrentUser() user: AccessTokenPayload) {
    return user;
  }
}
