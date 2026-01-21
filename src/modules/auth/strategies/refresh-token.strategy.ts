import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SessionsService } from '../../sessions/sessions.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor(
    private configService: ConfigService,
    private sessionService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ) {
    this.logger.debug('Validating refresh token', {
      userId: payload.sub,
      email: payload.email,
    });

    if (!payload.jti) {
      throw new UnauthorizedException('Invalid refresh token: missing jti');
    }

    const session = await this.sessionService.findByRefreshTokenId(payload.jti);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token: session not found');
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token: user mismatch');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionService.removeByRefreshTokenId(payload.jti);
      throw new UnauthorizedException('Refresh token expired');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();
    if (session.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token: token mismatch');
    }

    return {
      id: session.userId,
      email: payload.email,
      refreshTokenId: payload.jti
    };
  }
}
