import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ip?: string,
  ): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: false,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);
      const expiresAt = new Date(Date.now() + ms(this.configService.get('JWT_REFRESH_EXPIRES', '7d') as any));

      await this.sessionsService.create(
        user.id,
        tokens.refreshTokenId,
        tokens.refreshToken,
        userAgent,
        ip,
        expiresAt,
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch (error) {
      this.logger.error('Error during user registration', error.stack || error);
      throw new InternalServerErrorException(
        'An error occurred during registration',
      );
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string; refreshTokenId: string }> {
    const payload: JwtPayload = { sub: userId, email: email };
    const refreshTokenId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(
        { ...payload, jti: refreshTokenId },
        {
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken, refreshTokenId };
  }

  async refreshTokens(
    userId: string,
    refreshTokenId: string,
    userAgent?: string,
    ip?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const existingSession = await this.sessionsService.findByRefreshTokenId(refreshTokenId);
    if (!existingSession || existingSession.userId !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingSession.expiresAt < new Date()) {
      await this.sessionsService.removeByRefreshTokenId(refreshTokenId);
      throw new UnauthorizedException('Refresh token expired');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    const expiresAt = new Date(Date.now() + ms(this.configService.get('JWT_REFRESH_EXPIRES', '7d') as any));

    await this.sessionsService.removeByRefreshTokenId(refreshTokenId);
    await this.sessionsService.create(
      userId,
      tokens.refreshTokenId,
      tokens.refreshToken,
      userAgent || existingSession.userAgent || undefined,
      ip || existingSession.ip || undefined,
      expiresAt,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ip?: string,
  ): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const expiresAt = new Date(Date.now() + ms(this.configService.get('JWT_REFRESH_EXPIRES', '7d') as any));

    await this.sessionsService.create(
      user.id,
      tokens.refreshTokenId,
      tokens.refreshToken,
      userAgent,
      ip,
      expiresAt,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(userId: string, refreshTokenId?: string): Promise<void> {
    if (refreshTokenId) {
      await this.sessionsService.removeByRefreshTokenId(refreshTokenId);
    } else {
      await this.sessionsService.removeAll(userId);
    }
  }
}
