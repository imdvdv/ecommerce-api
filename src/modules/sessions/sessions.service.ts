import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionResponseDto } from './dto/session-response.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  //Get all sessions for a user
  async findAllByUserId(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        refreshTokenId: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sessions;
  }

  async findOne(sessionId: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        refreshTokenId: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    const { userId: _, ...sessionData } = session;
    return sessionData;
  }

  async remove(sessionId: string, userId: string): Promise<{ message: string }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Session deleted successfully' };
  }

  //Delete all sessions for a user (except the current one if sessionId is provided)
  async removeAll(
    userId: string,
    excludeSessionId?: string,
  ): Promise<void>{
    const where: { userId: string; id?: { not: string } } = { userId };

    if (excludeSessionId) {
      where.id = { not: excludeSessionId };
    }

    await this.prisma.session.deleteMany({where});

  }

  // Delete expired sessions for a user
  async removeExpired(userId: string): Promise<{ message: string; deletedCount: number }> {
    const result = await this.prisma.session.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return {
      message: 'Expired sessions deleted successfully',
      deletedCount: result.count,
    };
  }

  // Create a new session (used by auth service)
  async create(
    userId: string,
    refreshTokenId: string,
    refreshToken: string,
    userAgent?: string,
    ip?: string,
    expiresAt?: Date,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenId,
        refreshToken,
        userAgent,
        ip,
        expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      },
      select: {
        id: true,
        refreshTokenId: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return session;
  }

  // Find session by refreshTokenId
  async findByRefreshTokenId(refreshTokenId: string): Promise<SessionResponseDto & { userId: string; refreshToken: string } | null> {
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenId },
      select: {
        id: true,
        refreshTokenId: true,
        refreshToken: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!session) {
      return null;
    }

    return session;
  }

  async updateRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { refreshToken },
    });
  }

  async removeByRefreshTokenId(refreshTokenId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { refreshTokenId },
    });
  }

  // Get all sessions (admin only)
  async findAll(): Promise<(SessionResponseDto & { userId: string })[]> {
    const sessions = await this.prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        refreshTokenId: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    return sessions;
  }

  // Get a specific session by ID (admin only - no ownership check)
  async findOneForAdmin(sessionId: string): Promise<SessionResponseDto & { userId: string }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        refreshTokenId: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  // Delete a specific session (admin only - no ownership check)
  async removeForAdmin(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

  }

  // Delete all sessions (admin only)
  async removeAllForAdmin(): Promise<void> {
    await this.prisma.session.deleteMany({});
  }

  // Get all sessions for a specific user (admin only)
  async findAllByUserIdForAdmin(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        refreshTokenId: true,
        userAgent: true,
        ip: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sessions;
  }
}
