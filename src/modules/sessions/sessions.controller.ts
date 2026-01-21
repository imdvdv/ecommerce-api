import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { SessionsService } from './sessions.service';
import { SessionResponseDto } from './dto/session-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Sessions')
@JwtAuth()
@UseGuards(RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  // Get all sessions for the current user
  @Get()
  @ApiOperation({ summary: 'Get all sessions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all user sessions',
    type: [SessionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAll(@GetUser('id') userId: string): Promise<SessionResponseDto[]> {
    return await this.sessionService.findAllByUserId(userId);
  }

  // Get a specific session by ID (user's own session)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session by ID' })
  @ApiResponse({
    status: 200,
    description: 'The session with the specified ID',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Session does not belong to user' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findOne(
    @Param('id') sessionId: string,
    @GetUser('id') userId: string
  ): Promise<SessionResponseDto> {
    return await this.sessionService.findOne(sessionId, userId);
  }

  // Delete a specific session (user's own session)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specific session' })
  @ApiResponse({
    status: 200,
    description: 'Session deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Session does not belong to user' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async remove(
    @Param('id') sessionId: string,
    @GetUser('id') userId: string
  ): Promise<{ message: string }> {
    return await this.sessionService.remove(sessionId, userId);
  }

  // Delete all sessions for the current user
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all sessions for the current user' })
  @ApiResponse({
    status: 204,
    description: 'All sessions deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async removeAll(@GetUser('id') userId: string): Promise<void> {
    await this.sessionService.removeAll(userId);
  }
}
