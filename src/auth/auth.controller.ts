import { Body, Controller, Get, Headers, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { createUserExample } from '../users/dto/user.examples.js';
import { toUserCreateInput } from '../users/user-input.js';
import type { AccessTokenPayload } from './access-token.js';
import { AuthService, toLoginResponse, type IssuedSession } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { loginExample, loginResponseExample } from './dto/auth.examples.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import {
  clearRefreshCookie,
  readCookie,
  refreshCookieName,
  setRefreshCookie,
  type CookieResponse,
} from './session-tokens.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create an account, receive a 15-minute access token, and set a 7-day refresh cookie',
  })
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
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const session = await this.authService.register(toUserCreateInput(createUserDto));
    return this.sendSession(response, session);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sign in with email and password. The refresh token is an HttpOnly cookie.',
  })
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
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: CookieResponse) {
    const session = await this.authService.login(loginDto.email, loginDto.password);
    return this.sendSession(response, session);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Exchange the refresh cookie for a new 15-minute access token',
  })
  @ApiResponse({
    status: 200,
    description: 'The refresh cookie was valid. A new access token and refresh cookie were issued.',
    type: LoginResponseDto,
    example: loginResponseExample,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid refresh cookie.' })
  async refresh(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const session = await this.authService.refresh(readCookie(cookieHeader, refreshCookieName));
    return this.sendSession(response, session);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear the refresh cookie' })
  @ApiResponse({ status: 204, description: 'The refresh cookie was cleared.' })
  logout(@Res({ passthrough: true }) response: CookieResponse) {
    clearRefreshCookie(response);
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
        role: 'user',
        type: 'access',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  me(@CurrentUser() user: AccessTokenPayload) {
    return user;
  }

  private sendSession<TUser>(response: CookieResponse, session: IssuedSession<TUser>) {
    setRefreshCookie(response, session.refreshToken);
    return toLoginResponse(session);
  }
}
