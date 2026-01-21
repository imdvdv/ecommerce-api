import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register api
  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.socket.remoteAddress;
    return await this.authService.register(
      registerDto,
      userAgent,
      ip,
    );
  }

  // Refresh access token
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth('JWT-refresh')
  @ApiOperation({
    summary: 'Refresh user`s access token',
    description: 'Generates a new access token using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async refresh(
    @GetUser('id') userId: string,
    @GetUser('refreshTokenId') refreshTokenId: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.socket.remoteAddress;
    return await this.authService.refreshTokens(userId, refreshTokenId, userAgent, ip);
  }

  // Logout user and invalidate refresh token
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @JwtAuth()
  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out the user and invalidates the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async logout(
    @GetUser('id') userId: string,
    @GetUser('refreshTokenId') refreshTokenId?: string,
  ): Promise<{ message: string }> {
    await this.authService.logout(userId, refreshTokenId);
    return { message: 'Successfully logged out' };
  }

  // Login
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Server Error',
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.socket.remoteAddress;
    return await this.authService.login(loginDto, userAgent, ip);
  }
}
